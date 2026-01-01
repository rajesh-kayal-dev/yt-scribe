import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { passport, configurePassport } from './config/passport.js';

import adminRoutes from './routes/adminRoutes.js';
import transcriptRoutes from './routes/transcriptRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import noteRoutes from './routes/noteRoutes.js';

import errorHandler from './middleware/errorHandler.js';

const app = express();

/* 🔥 REQUIRED FOR RENDER + RATE-LIMIT (ONLY FIX) */
app.set('trust proxy', 1);

/* =========================
   Path helpers
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   Passport setup
========================= */
configurePassport();

/* =========================
   Environment
========================= */
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

/* =========================
   Security & Middleware
========================= */
app.use(helmet());

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

/* =========================
   Rate limiter (Auth)
========================= */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many auth requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/* =========================
   Health Check
========================= */
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true });
});

/* =========================
   API Routes
========================= */
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/transcript', transcriptRoutes);

/* =========================
   Serve Frontend (SPA)
========================= */
const clientBuildPath = path.join(__dirname, '../../client/build');

app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

/* =========================
   Error Handler
========================= */
app.use(errorHandler);

export default app;
