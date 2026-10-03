import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { findCourseOr404, recomputeEnrollment } from '../services/courseAccess.js';

// POST /api/courses/:id/enroll
// (Free for now. When payments are added, verify the payment here before creating.)
export const enroll = asyncHandler(async (req, res) => {
  const course = await findCourseOr404(req.params.id);
  if (!course.published) throw httpError(404, 'Course not found');

  try {
    const enrollment = await Enrollment.create({ student: req.user._id, course: course._id });
    res.status(201).json({ enrollment });
  } catch (err) {
    if (err.code === 11000) throw httpError(409, 'You are already enrolled in this course');
    throw err;
  }
});

// GET /api/enrollments/mine
export const myEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: 'course',
      select: 'title description category thumbnail published teacher',
      populate: { path: 'teacher', select: 'name' },
    })
    .lean();
  res.json({ enrollments });
});

async function loadEnrolledLesson(req) {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw httpError(404, 'Lesson not found');

  const enrolled = await Enrollment.exists({ student: req.user._id, course: lesson.course });
  if (!enrolled) throw httpError(403, 'Enroll in this course first');
  return lesson;
}

// POST /api/lessons/:id/complete
export const markComplete = asyncHandler(async (req, res) => {
  const lesson = await loadEnrolledLesson(req);
  const filter = { student: req.user._id, lesson: lesson._id };

  const existing = await Progress.findOne(filter).select('completed').lean();
  if (!existing?.completed) {
    await Progress.findOneAndUpdate(
      filter,
      { $set: { course: lesson.course, completed: true, completedAt: new Date() } },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  const progress = await recomputeEnrollment(req.user._id, lesson.course);
  res.json({ completed: true, progress });
});

// DELETE /api/lessons/:id/complete
export const markIncomplete = asyncHandler(async (req, res) => {
  const lesson = await loadEnrolledLesson(req);

  await Progress.updateOne(
    { student: req.user._id, lesson: lesson._id },
    { $set: { completed: false }, $unset: { completedAt: 1 } }
  );

  const progress = await recomputeEnrollment(req.user._id, lesson.course);
  res.json({ completed: false, progress });
});
