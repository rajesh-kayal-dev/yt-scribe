import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// User roles: regular users and admins
// Auth providers: local (email/password), Google, GitHub
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Password is optional because OAuth users may not have a local password
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },
    providerId: {
      type: String,
    },
    googleId: {
      type: String,
    },
    githubId: {
      type: String,
    },
    avatarUrl: {
      type: String,
    },
    bio: {
      type: String,
      trim: true,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Before saving a user, hash the password if it was modified
userSchema.pre('save', async function (next) {
  const user = this;

  // If password was not changed or not set (e.g., OAuth user), skip hashing
  if (!user.isModified('password') || !user.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare a plain password with the hashed password stored in the database
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;