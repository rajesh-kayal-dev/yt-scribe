import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    merchantTransactionId: { type: String, required: true, index: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    courseData: {
      id: { type: String },
      title: { type: String },
      description: { type: String },
      thumbnail: { type: String },
      videos: [
        new mongoose.Schema(
          {
            title: { type: String },
            description: { type: String },
            thumbnail: { type: String },
            youtubeUrl: { type: String },
            youtubeVideoId: { type: String },
          },
          { _id: false }
        ),
      ],
    },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
