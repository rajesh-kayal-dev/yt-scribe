import axios from 'axios';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import { generateAccessToken } from '../utils/generateTokens.js';
import { Order } from '../models/Order.js';
import { Playlist } from '../models/playlistModel.js';

// Official PhonePe UAT sandbox credentials (hardcoded)
const MERCHANT_ID = 'PGTESTPAYUAT86';
const SALT_KEY = '96434309-7796-489d-8924-ab56988a6076';
const SALT_INDEX = 1;
const PHONEPE_HOST = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
const PAY_API_PATH = '/pg/v1/pay';
const SERVER_BASE_URL = process.env.SERVER_BASE_URL || 'http://localhost:5000';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

export async function initiatePayment(req, res) {
  try {
    console.log('Payment initiate body:', req.body);
    const { amount, userId, courseData } = req.body || {};
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount missing' });
    }

    const merchantTransactionId = uuidv4();
    const merchantUserId = userId || `MUID_${Date.now()}`;

    // Optional safety: prevent duplicate purchase of same course for same user
    try {
      if (userId && mongoose.Types.ObjectId.isValid(userId) && courseData?.title) {
        const existing = await Playlist.findOne({ user: userId, title: courseData.title }).lean();
        if (existing) {
          return res.status(400).json({ success: false, message: 'You already own this course.' });
        }
      }
    } catch (dupErr) {
      // log and continue
      console.error('Duplicate check error:', dupErr);
    }

    // Persist a pending order for post-payment fulfillment
    try {
      await Order.create({
        merchantTransactionId,
        userId: userId || null,
        courseData: courseData || null,
        status: 'PENDING',
      });
    } catch (persistErr) {
      console.error('Failed to persist Order before payment:', persistErr);
      // continue; do not block payment creation
    }

    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId,
      merchantUserId,
      amount: Math.round(Number(amount) * 100),
      redirectUrl: `${SERVER_BASE_URL}/api/payment/status/${merchantTransactionId}`,
      redirectMode: 'POST',
      callbackUrl: `${SERVER_BASE_URL}/api/payment/callback`,
      paymentInstrument: { type: 'PAY_PAGE' },
    };

    const jsonPayload = JSON.stringify(payload);
    const base64Payload = Buffer.from(jsonPayload).toString('base64');

    const stringToHash = base64Payload + PAY_API_PATH + SALT_KEY; // PAY_API_PATH is "/pg/v1/pay"
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = `${sha256}###${SALT_INDEX}`; // SALT_INDEX is 1

    const url = `${PHONEPE_HOST}${PAY_API_PATH}`;
    console.log('PhonePe request config:', {
      url,
      merchantId: MERCHANT_ID,
      saltIndex: SALT_INDEX,
      host: PHONEPE_HOST,
      payloadPreview: { ...payload, callbackUrl: '[redacted]', redirectUrl: payload.redirectUrl },
      base64Length: base64Payload.length,
      checksumPrefix: checksum.slice(0, 12),
    });

    const response = await axios.post(
      url,
      { request: base64Payload },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': MERCHANT_ID,
        },
        timeout: 15000,
      }
    );

    const data = response?.data;
    const redirectUrl = data?.data?.instrumentResponse?.redirectInfo?.url;
    if (!redirectUrl) {
      return res.status(500).json({ success: false, message: 'Failed to get redirect URL', data });
    }

    return res.json({ success: true, merchantTransactionId, url: redirectUrl });
  } catch (err) {
    console.error('initiatePayment error:', err?.response?.data || err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function checkStatus(req, res) {
  try {
    const { merchantTransactionId } = req.params;
    const code = req.body?.code || req.query?.code;
    const success = String(code || '').toUpperCase() === 'PAYMENT_SUCCESS';

    // Fetch the order and fulfill on success
    const order = await Order.findOne({ merchantTransactionId });
    if (success && order) {
      try {
        order.status = 'SUCCESS';
        await order.save();

        if (order.userId && mongoose.Types.ObjectId.isValid(order.userId) && order.courseData) {
          const { title, description, thumbnail, videos } = order.courseData || {};
          try {
            const playlist = await Playlist.create({
              user: order.userId,
              title: title || 'Purchased Course',
              description: description || '',
              thumbnailUrl: thumbnail || '',
              source: 'custom',
              visibility: 'private',
              videos: Array.isArray(videos)
                ? videos.map((v, idx) => ({
                    title: v.title || `Lesson ${idx + 1}`,
                    description: v.description || '',
                    thumbnailUrl: v.thumbnail || '',
                    youtubeUrl: v.youtubeUrl || '',
                    youtubeVideoId: v.youtubeVideoId || '',
                    order: idx,
                  }))
                : [],
              itemCount: Array.isArray(videos) ? videos.length : 0,
            });
            console.log('Created playlist from order:', playlist?._id);
          } catch (plErr) {
            console.error('Failed creating playlist from order:', plErr);
          }
        }
      } catch (fulfillErr) {
        console.error('Order fulfillment error:', fulfillErr);
      }
    } else if (!success && order) {
      try {
        order.status = 'FAILED';
        await order.save();
      } catch (saveFail) {
        // ignore
      }
    }

    const encodedTitle = encodeURIComponent(order?.courseData?.title || 'Course');
    const redirectBase = CLIENT_URL;
    let target;
    if (success) {
      let token = '';
      try {
        if (order?.userId && mongoose.Types.ObjectId.isValid(order.userId)) {
          const user = await User.findById(order.userId).lean();
          if (user) token = generateAccessToken(user);
        }
      } catch (tokenErr) {
        console.error('Token generation failed:', tokenErr);
      }
      const tokenQS = token ? `&token=${encodeURIComponent(token)}` : '';
      const courseIdQS = order?.courseData?.id ? `&course_id=${encodeURIComponent(String(order.courseData.id))}` : '';
      target = `${redirectBase}/marketplace?payment_success=true${tokenQS}${courseIdQS}`;
    } else {
      target = `${redirectBase}/marketplace?payment_failed=true`;
    }
    return res.redirect(target);
  } catch (err) {
    console.error('checkStatus error:', err);
    return res.redirect(`${CLIENT_URL}/marketplace?payment_failed=true`);
  }
}

export async function callbackHandler(req, res) {
  try {
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(200).json({ success: true });
  }
}
