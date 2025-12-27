import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/userModel.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';

const isProduction = process.env.NODE_ENV === 'production';

function isStrongPassword(password) {
  if (!password || typeof password !== 'string') return false;

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
}

// POST /api/auth/forgot-password
// Generate a password reset token and (in a real app) send it via email
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // For security, do not reveal whether the email exists
    if (!user) {
      return res.json({
        success: true,
        message: 'If that email is registered, a password reset link has been sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    console.log('Password reset link:', resetUrl);

    return res.json({
      success: true,
      message: 'If that email is registered, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/reset-password
// Verify the reset token and set a new password
async function resetPassword(req, res, next) {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Reset link is invalid or has expired' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setAuthCookies(res, accessToken, refreshToken);

    return res.json({
      success: true,
      message: 'Password has been reset successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/register
// Create a new local (email/password) user
async function register(req, res, next) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      provider: 'local',
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
// Log in a user with email and password
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.provider !== 'local') {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setAuthCookies(res, accessToken, refreshToken);

    return res.json({
      success: true,
      message: 'Logged in successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/refresh
// Use the refresh token to issue a new access token (and optionally a new refresh token)
async function refreshToken(req, res, next) {
  try {
    const token = req.cookies && req.cookies.refresh_token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token missing' });
    }

    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ success: false, message: 'Refresh token secret not configured' });
    }

    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    setAuthCookies(res, newAccessToken, newRefreshToken);

    return res.json({
      success: true,
      message: 'Token refreshed',
      user: sanitizeUser(user),
    });
  } catch (error) {
    // If token is invalid or expired, return 401
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
}

// POST /api/auth/logout
// Clear auth cookies so the user is logged out
function logout(req, res) {
  const baseOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };

  res.clearCookie('access_token', baseOptions);
  res.clearCookie('refresh_token', baseOptions);

  return res.json({ success: true, message: 'Logged out successfully' });
}

// Helper: remove sensitive fields like password before sending user data to the client
function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    provider: user.provider,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// Helper: set HTTP-only cookies for access and refresh tokens
function setAuthCookies(res, accessToken, refreshToken) {
  const baseOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };

  // Short-lived access token
  res.cookie('access_token', accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Longer-lived refresh token
  res.cookie('refresh_token', refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// OAuth callback success handler
// Passport attaches the authenticated user to req.user
function oauthCallback(req, res) {
  const passportUser = req.user;

  if (!passportUser) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    return res.redirect(clientUrl + '/auth/error');
  }

  // Generate JWT tokens using your JWT_* secrets
  const accessToken = generateAccessToken(passportUser);
  const refreshToken = generateRefreshToken(passportUser);

  // Set secure HTTP-only cookies
  setAuthCookies(res, accessToken, refreshToken);

  // Redirect to CLIENT_URL/auth/success?token=...
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const redirectUrl = `${clientUrl}/auth/success?token=${encodeURIComponent(accessToken)}`;
  return res.redirect(redirectUrl);
}

export {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  oauthCallback,
};