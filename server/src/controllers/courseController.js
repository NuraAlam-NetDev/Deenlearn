import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { pageMeta } from '../utils/pagination.js';
import { canManage } from '../services/courseAccess.js';
import { attachCounts } from '../services/courseStats.js';

// GET /api/courses  (public catalogue: published only)
export const listCourses = asyncHandler(async (req, res) => {
  const { page, limit, category, q } = req.query;

  const filter = { published: true };
  if (category) filter.category = category;
  if (q) filter.$text = { $search: q };

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('teacher', 'name')
      .lean(),
    Course.countDocuments(filter),
  ]);
  await attachCounts(courses);

  res.json({ courses, ...pageMeta(page, limit, total) });
});

// GET /api/courses/:id  (details + lesson outline, no lesson content)
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('teacher', 'name');
  if (!course) throw httpError(404, 'Course not found');

  const manage = canManage(req.user, course);
  const enrollment = req.user
    ? await Enrollment.findOne({ student: req.user._id, course: course._id }).lean()
    : null;

  // Drafts are visible only to the teacher (and students already enrolled)
  if (!course.published && !manage && !enrollment) throw httpError(404, 'Course not found');

  const lessons = await Lesson.find({ course: course._id })
    .select('title order')
    .sort({ order: 1 })
    .lean();

  res.json({
    course,
    lessons,
    canManage: manage,
    enrollment: enrollment ? { progress: enrollment.progress, enrolledAt: enrollment.createdAt } : null,
  });
});
