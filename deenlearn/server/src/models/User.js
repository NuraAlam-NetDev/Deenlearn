import mongoose from 'mongoose';

export const ROLES = ['student', 'teacher', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true, // creates the unique index
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    // Store only the bcrypt hash; never returned by default queries
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'student', index: true },

    // Moderation: banned users can't log in and their tokens stop working
    status: { type: String, enum: ['active', 'banned'], default: 'active', index: true },
    banReason: { type: String, default: '' },
    bannedAt: { type: Date },

    // Teachers start as "pending" and need admin approval. Everyone else is "approved".
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    rejectionReason: { type: String, default: '' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, approvalStatus: 1 });
userSchema.index({ createdAt: -1 });

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
