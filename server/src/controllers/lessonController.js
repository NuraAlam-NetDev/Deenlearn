import Lesson from '../models/Lesson.js';
import Progress from '../models/Progress.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { findCourseOr404, hasCourseAccess } from '../services/courseAccess.js';

async function requireAccess(user, course) {
  if (!(await hasCourseAccess(user, course))) {
    throw httpError(403, 'Enroll in this course to view its lessons');
  }
}

// GET /api/courses/:courseId/lessons  (outline + completed flags, no content)
export const listLessons = asyncHandler(async (req, res) => {
  const course = await findCourseOr404(req.params.courseId);
  await requireAccess(req.user, course);

  const [lessons, doneRows] = await Promise.all([
    Lesson.find({ course: course._id }).select('-content').sort({ order: 1 }).lean(),
    Progress.find({ student: req.user._id, course: course._id, completed: true })
      .select('lesson')
      .lean(),
  ]);
  const done = new Set(doneRows.map((p) => String(p.lesson)));
  for (const l of lessons) l.completed = done.has(String(l._id));

  res.json({ lessons });
});

// GET /api/lessons/:id  (full lesson)
export const getLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).lean();
  if (!lesson) throw httpError(404, 'Lesson not found');

  const course = await findCourseOr404(lesson.course);
  await requireAccess(req.user, course);

  const completed = !!(await Progress.exists({
    student: req.user._id,
    lesson: lesson._id,
    completed: true,
  }));
  res.json({ lesson, completed });
});
