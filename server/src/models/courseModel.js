import mongoose from 'mongoose';

const CourseVideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    duration: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    sourceType: { type: String, enum: ['upload', 'youtube'], default: 'upload' },
    youtubeVideoId: { type: String },
  },
  { _id: true }
);

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, index: true },
    description: { type: String },
    category: { type: String },
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    thumbnailUrl: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    level: { type: String },
    // Backward compatibility: keep isPublished but prefer status going forward
    isPublished: { type: Boolean, default: true },
    status: { type: String, enum: ['draft', 'published', 'pending'], default: 'pending' },
    stats: {
      students: { type: Number, default: 0 },
      purchases: { type: Number, default: 0 },
    },
    videos: { type: [CourseVideoSchema], default: [] },
  },
  { timestamps: true }
);

export const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
