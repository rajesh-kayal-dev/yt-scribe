import mongoose from 'mongoose';
import { Playlist } from '../models/playlistModel.js';

export async function getAnalyticsSummary(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [playlistsCount, statusBuckets, playlistDocs] = await Promise.all([
      Playlist.countDocuments({ user: userObjectId }),
      Playlist.aggregate([
        { $match: { user: userObjectId } },
        { $unwind: { path: '$videos', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$videos.status', count: { $sum: 1 } } },
      ]),
      Playlist.find({ user: userObjectId }).select('title progress videos').lean(),
    ]);

    const counts = { completed: 0, watching: 0, not_started: 0 };
    for (const b of statusBuckets) {
      if (b._id && counts.hasOwnProperty(b._id)) counts[b._id] = b.count;
      else if (!b._id) counts.not_started += 0; // safety
    }

    const summary = {
      videosCompleted: counts.completed,
      videosInProgress: counts.watching,
      playlistsCount,
      timeSpentToday: '0m',
    };

    const playlistProgress = (playlistDocs || []).map((p) => ({
      title: p.title,
      progressPercent: Math.max(0, Math.min(100, Math.round(p.progress || 0))),
    }));

    const overallProgress = {
      completed: counts.completed,
      inProgress: counts.watching,
      pending: counts.not_started,
    };

    const weeklyData = generateDefaultWeeklyData();
    const timeSpentLearning = {
      streakDays: 0,
      avgDailyTime: Math.round(
        weeklyData.reduce((s, d) => s + d.minutes, 0) / (weeklyData.length || 1)
      ),
      weeklyData,
    };

    const recentAchievements = buildAchievements({
      playlistsCount,
      completed: counts.completed,
    });

    return res.json({
      success: true,
      data: { summary, timeSpentLearning, playlistProgress, overallProgress, recentAchievements },
    });
  } catch (err) {
    next(err);
  }
}

function generateDefaultWeeklyData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => ({ day, minutes: 0 }));
}

function buildAchievements({ playlistsCount, completed }) {
  const items = [];
  if (playlistsCount > 0) items.push({ title: 'Created your first playlist', icon: 'star', date: 'recently' });
  if (completed >= 1) items.push({ title: 'Watched your first video', icon: 'check', date: 'recently' });
  if (completed >= 10) items.push({ title: '10 videos completed', icon: 'trophy', date: 'recently' });
  return items;
}
