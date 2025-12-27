import { Router } from 'express';
import { initiatePayment, checkStatus, callbackHandler } from '../controllers/paymentController.js';

const router = Router();

router.post('/initiate', initiatePayment);
router.post('/callback', callbackHandler);
router.post('/status/:merchantTransactionId', checkStatus);

export default router;
