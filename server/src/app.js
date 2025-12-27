import express from 'express';
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

// Configure Passport strategies (Google, GitHub)
configurePassport();

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

// Security headers
app.use(helmet());

// CORS configuration to allow requests from the React frontend
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  })
);

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Parse cookies (needed for reading auth tokens)
app.use(cookieParser());

// Initialize Passport for OAuth
app.use(passport.initialize());

// Rate limiting for auth routes to help prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per window
  message: 'Too many auth requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Simple health check route to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy' });
});

// Mount API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payment', paymentRoutes);

// Notes (AI + manual)
app.use('/api/notes', noteRoutes);

//Mount transcript routes
app.use("/api/transcript", transcriptRoutes);

// Global error handler (keep this last)
app.use(errorHandler);

export default app;
