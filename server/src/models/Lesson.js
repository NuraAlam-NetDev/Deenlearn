import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    type: { type: String, trim: true }, // e.g. application/pdf
    size: { type: Number, min: 0 }, // bytes
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    content: { type: String, default: '' }, // text / markdown / HTML
    attachments: { type: [attachmentSchema], default: [] },
    order: { type: Number, default: 0, min: 0 },
    videoUrl: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// Lessons of a course in order (not unique, so reordering is easy)
lessonSchema.index({ course: 1, order: 1 });

export default mongoose.model('Lesson', lessonSchema);
