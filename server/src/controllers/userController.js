import User from '../models/userModel.js';

// GET /api/user/me
// Return the profile of the currently logged-in user
async function getMe(req, res, next) {
  try {
    const userId = req.user && req.user.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, message: 'Current user fetched', user });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/user/me
// Update basic profile information for the logged-in user
async function updateMe(req, res, next) {
  try {
    const userId = req.user && req.user.id;
    const { name, avatarUrl, bio } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const updates = {};
    if (typeof name === 'string' && name.trim()) {
      updates.name = name.trim();
    }
    if (typeof avatarUrl === 'string') {
      updates.avatarUrl = avatarUrl;
    }
    if (typeof bio === 'string') {
      updates.bio = bio.trim();
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    next(error);
  }
}

export { getMe, updateMe };
