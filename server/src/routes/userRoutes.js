import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMe, updateMe } from '../controllers/userController.js';

const router = express.Router();

// Routes for regular logged-in users
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);

export default router;
