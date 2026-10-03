import Lesson from '../models/Lesson.js';
import Progress from '../models/Progress.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import {
  findCourseOr404,
  assertCanManage,
  hasCourseAccess,
  syncCourseProgress,
} from '../services/courseAccess.js';

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

// POST /api/courses/:courseId/lessons
export const createLesson = asyncHandler(async (req, res) => {
  const course = await findCourseOr404(req.params.courseId);
  assertCanManage(req.user, course);

  const data = { ...req.body };
  if (data.order === undefined) {
    const last = await Lesson.findOne({ course: course._id }).sort({ order: -1 }).select('order');
    data.order = last ? last.order + 1 : 1;
  }

  const lesson = await Lesson.create({ ...data, course: course._id });
  await syncCourseProgress(course._id); // total lessons changed
  res.status(201).json({ lesson });
});

// PATCH /api/lessons/:id
export const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw httpError(404, 'Lesson not found');

  const course = await findCourseOr404(lesson.course);
  assertCanManage(req.user, course);

  Object.assign(lesson, req.body);
  await lesson.save();
  res.json({ lesson });
});

// DELETE /api/lessons/:id
export const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw httpError(404, 'Lesson not found');

  const course = await findCourseOr404(lesson.course);
  assertCanManage(req.user, course);

  await Promise.all([lesson.deleteOne(), Progress.deleteMany({ lesson: lesson._id })]);
  await syncCourseProgress(course._id);
  res.json({ message: 'Lesson deleted' });
});

// PUT /api/courses/:courseId/lessons/reorder   body: { lessonIds: [...] }
export const reorderLessons = asyncHandler(async (req, res) => {
  const course = await findCourseOr404(req.params.courseId);
  assertCanManage(req.user, course);

  const existing = await Lesson.find({ course: course._id }).select('_id').lean();
  const existingIds = new Set(existing.map((l) => String(l._id)));
  const ids = req.body.lessonIds.map(String);

  const valid =
    ids.length === existingIds.size &&
    new Set(ids).size === ids.length &&
    ids.every((id) => existingIds.has(id));
  if (!valid) {
    throw httpError(400, 'lessonIds must list every lesson of this course exactly once');
  }

  await Lesson.bulkWrite(
    ids.map((id, i) => ({
      updateOne: { filter: { _id: id, course: course._id }, update: { $set: { order: i + 1 } } },
    }))
  );
  res.json({ message: 'Lessons reordered' });
});
