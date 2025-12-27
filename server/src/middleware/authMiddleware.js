import jwt from 'jsonwebtoken';

// Middleware to protect routes - only logged-in users can access
export function protect(req, res, next) {
  try {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessSecret) {
      return res.status(500).json({ success: false, message: 'JWT access secret not configured' });
    }

    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    // We primarily use HTTP-only cookies, but also allow Authorization header
    const cookieToken = req.cookies && req.cookies.access_token;

    const token = bearerToken || cookieToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, accessSecret);

    // Attach basic user info to the request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

// Middleware to restrict access to admin users only
export function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  next();
}

export default { protect, adminOnly };
