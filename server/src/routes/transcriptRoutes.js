import express from "express";
import {
  createYoutubeTranscript,
  getTranscriptById,
  generateSummary,
} from "../controllers/transcriptController.js";

const router = express.Router();

// POST /api/transcript/youtube
router.post("/youtube", createYoutubeTranscript);

// GET /api/transcript/:id
router.get("/:id", getTranscriptById);

// POST /api/transcript/:id/summary
router.post("/:id/summary", generateSummary);

export default router;
