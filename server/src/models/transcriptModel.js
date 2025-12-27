import mongoose from 'mongoose';

const transcriptSchema = new mongoose.Schema(
  {
    videoId: { type: String, required: true },
    text: { type: String, required: true },
    rawTranscript: { type: Array, required: true },
    summary: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Transcript', transcriptSchema);
