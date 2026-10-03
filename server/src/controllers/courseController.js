import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { findCourseOr404, canManage, assertCanManage } from '../services/courseAccess.js';

// Adds lessonCount and studentCount to plain (lean) course objects
async function attachCounts(courses) {
  if (!courses.length) return courses;
  const ids = courses.map((c) => c._id);
  const countBy = (Model) =>
    Model.aggregate([
      { $match: { course: { $in: ids } } },
      { $group: { _id: '$course', n: { $sum: 1 } } },
    ]);

  const [lessonRows, studentRows] = await Promise.all([countBy(Lesson), countBy(Enrollment)]);
  const lessons = new Map(lessonRows.map((r) => [String(r._id), r.n]));
  const students = new Map(studentRows.map((r) => [String(r._id), r.n]));

  for (const c of courses) {
    c.lessonCount = lessons.get(String(c._id)) ?? 0;
    c.studentCount = students.get(String(c._id)) ?? 0;
  }
  return courses;
}

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

  res.json({ courses, page, limit, total, pages: Math.ceil(total / limit) });
});

// GET /api/courses/mine  (teacher dashboard: includes drafts)
export const myCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ teacher: req.user._id }).sort({ createdAt: -1 }).lean();
  await attachCounts(courses);
  res.json({ courses });
});

// GET /api/courses/:id  (details + lesson outline, no lesson content)
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('teacher', 'name');
  if (!course) throw httpError(404, 'Course not found');

  const manage = canManage(req.user, course);
  const enrollment = req.user
    ? await Enrollment.findOne({ student: req.user._id, course: course._id }).lean()
    : null;

  // Drafts are visible only to the teacher/admin (and students already enrolled)
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

// POST /api/courses
export const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create({ ...req.body, teacher: req.user._id });
  res.status(201).json({ course });
});

// PATCH /api/courses/:id
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await findCourseOr404(req.params.id);
  assertCanManage(req.user, course);

  Object.assign(course, req.body); // body is whitelisted by the Zod schema
  await course.save();
  res.json({ course });
});

// DELETE /api/courses/:id  (also removes its lessons, enrollments, progress)
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await findCourseOr404(req.params.id);
  assertCanManage(req.user, course);

  await Promise.all([
    Lesson.deleteMany({ course: course._id }),
    Enrollment.deleteMany({ course: course._id }),
    Progress.deleteMany({ course: course._id }),
  ]);
  await course.deleteOne();
  res.json({ message: 'Course deleted' });
});
