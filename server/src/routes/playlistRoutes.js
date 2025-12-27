import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createPlaylist,
  importPlaylistFromYoutube,
  getMyPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  updateVideoStatus,
  deletePlaylist,
  updatePlaylist,
  removeVideoFromPlaylist,
  importYoutubePlaylist,
  getUserPlaylists,
  generatePlaylistVideoNotes,
} from '../controllers/playlistController.js';

const router = express.Router();

router.post('/', protect, createPlaylist);
router.post('/import', protect, importPlaylistFromYoutube);
router.post('/import-youtube', protect, importYoutubePlaylist);
router.get('/', protect, getMyPlaylists);
router.get('/me', protect, getUserPlaylists);
router.get('/:id', protect, getPlaylistById);
router.post('/:id/videos', protect, addVideoToPlaylist);
router.patch('/:id/videos/:videoId/status', protect, updateVideoStatus);
router.patch('/:id', protect, updatePlaylist);
router.delete('/:id/videos/:videoId', protect, removeVideoFromPlaylist);
router.delete('/:id', protect, deletePlaylist);

// Generate transient AI notes for a video (no DB writes, public)
router.post('/notes/generate', generatePlaylistVideoNotes);

export default router;
