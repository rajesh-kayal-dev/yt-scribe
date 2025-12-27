import express from 'express';
import { passport } from '../config/passport.js';
import {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  oauthCallback,
} from '../controllers/authController.js';

const router = express.Router();

// LOCAL AUTH ROUTES
// Register a new user with email/password
router.post('/register', register);

// Log in with email/password
router.post('/login', login);

// Refresh access token using refresh token cookie
router.post('/refresh', refreshToken);

// Log out and clear cookies
router.post('/logout', logout);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

// OAUTH ROUTES - GOOGLE
// Step 1: Start Google OAuth login
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// Step 2: Google redirects back to this callback URL
// If authentication succeeds, Passport puts the user on req.user
// We then generate JWT tokens, set cookies, and redirect to the frontend
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: (process.env.CLIENT_URL || 'http://localhost:3000') + '/auth/error',
  }),
  oauthCallback
);

// OAUTH ROUTES - GITHUB
router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['user:email'],
  })
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: (process.env.CLIENT_URL || 'http://localhost:3000') + '/auth/error',
  }),
  oauthCallback
);

export default router;