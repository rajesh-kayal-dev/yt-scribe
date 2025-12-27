import jwt from 'jsonwebtoken';

// Generate a short-lived access token (used for most API requests)
function generateAccessToken(user) {
  const secret = process.env.JWT_ACCESS_SECRET;
  const expiresIn = process.env.TOKEN_EXPIRES_IN || '15m';

  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not defined');
  }

  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, secret, { expiresIn });
}

// Generate a longer-lived refresh token (used to issue new access tokens)
function generateRefreshToken(user) {
  const secret = process.env.JWT_REFRESH_SECRET;
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, secret, { expiresIn });
}

export { generateAccessToken, generateRefreshToken };
