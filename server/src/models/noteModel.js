import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    content: { type: String, required: true },
    isAIGenerated: { type: Boolean, default: false },
    videoId: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);
