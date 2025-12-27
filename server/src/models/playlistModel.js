import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema(
  {
    // Common fields
    title: { type: String, required: true },
    description: { type: String },
    thumbnailUrl: { type: String },
    duration: { type: Number, default: 0 }, // seconds for custom, derived from ISO8601 for YouTube
    status: {
      type: String,
      enum: ['not_started', 'watching', 'completed'],
      default: 'not_started',
    },
    notesCount: { type: Number, default: 0 },
    transcriptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transcript' },
    channelTitle: { type: String },
    channelId: { type: String },
    publishedAt: { type: Date },

    // For ordering in custom playlists
    order: { type: Number, default: 0 },

    // YouTube specific
    youtubeUrl: { type: String },
    videoId: { type: String }, // legacy field
    youtubeVideoId: { type: String },
    position: { type: Number },
  },
  { _id: true }
);

const PlaylistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    thumbnailUrl: { type: String },
    source: { type: String, enum: ['youtube', 'custom'], default: 'youtube' },
    visibility: { type: String, enum: ['public', 'private', 'unlisted'], default: 'private' },
    // YouTube metadata
    youtubePlaylistId: { type: String },
    channelTitle: { type: String },
    itemCount: { type: Number, default: 0 },
    completedVideoIds: { type: [String], default: [] },
    videos: { type: [VideoSchema], default: [] },
    progress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

// Helpful indexes for fast user and analytics queries
PlaylistSchema.index({ user: 1, updatedAt: -1 });
PlaylistSchema.index({ user: 1, 'videos.status': 1 });

export const Playlist = mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);
