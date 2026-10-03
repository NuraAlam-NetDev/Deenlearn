import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, lowercase: true, default: 'general' },
    thumbnail: { type: String, trim: true, default: '' }, // image URL
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Teacher dashboard: "my courses", newest first
courseSchema.index({ teacher: 1, createdAt: -1 });
// Public catalogue: published courses by category
courseSchema.index({ published: 1, category: 1, createdAt: -1 });
// Search box
courseSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Course', courseSchema);
