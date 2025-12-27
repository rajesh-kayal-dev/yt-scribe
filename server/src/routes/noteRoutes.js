import express from 'express';
import { createNote, getNotes, exportNotesAsPdf } from '../controllers/noteController.js';

const router = express.Router();

// Public simple notes API (can be secured later)
router.get('/', getNotes);
router.post('/', createNote);
router.get('/export', exportNotesAsPdf);

export default router;
