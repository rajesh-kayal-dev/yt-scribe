import mongoose from 'mongoose';

// Connect to MongoDB Atlas using the connection string from environment variables
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      // Helps avoid long hangs on SRV/DNS issues and IPv6-only lookups
      serverSelectionTimeoutMS: 20000,
      family: 4,
    });
    console.log('MongoDB connected');
  } catch (error) {
    const detail = (error && (error.reason?.code || error.code || error.name)) ? ` (${error.reason?.code || error.code || error.name})` : '';
    console.error(` MongoDB connection error${detail}:`, error.message || error);
    process.exit(1);
  }
}

export { connectDB };
