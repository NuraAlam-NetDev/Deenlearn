import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { pageMeta, escapeRegex } from '../utils/pagination.js';
import { attachCounts } from '../services/courseStats.js';
import { uploadFile, deleteAssets } from '../services/media.js';
import { deleteCourseCascade } from '../services/courseCleanup.js';

// GET /api/teacher/courses?page=&limit=&status=published|draft&q=
export const listMyCourses = asyncHandler(async (req, res) => {
  const { page, limit, status, q } = req.query;

  const filter = { teacher: req.user._id };
  if (status === 'published') filter.published = true;
  if (status === 'draft') filter.published = false;
  if (q) filter.title = { $regex: escapeRegex(q), $options: 'i' };

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Course.countDocuments(filter),
  ]);
  await attachCounts(courses);

  res.json({ courses, ...pageMeta(page, limit, total) });
});

// GET /api/teacher/courses/:id
export const getMyCourse = asyncHandler(async (req, res) => {
  const course = req.course.toObject();
  await attachCounts([course]);
  res.json({ course });
});

// POST /api/teacher/courses  (always created as a draft)
export const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create({ ...req.body, teacher: req.user._id, published: false });
  res.status(201).json({ course });
});

// PATCH /api/teacher/courses/:id
export const updateCourse = asyncHandler(async (req, res) => {
  const course = req.course;
  const replacedUpload =
    req.body.thumbnail !== undefined && course.thumbnailPublicId
      ? { publicId: course.thumbnailPublicId, resourceType: 'image' }
      : null;

  Object.assign(course, req.body); // body is whitelisted by the Zod schema
  if (replacedUpload) course.thumbnailPublicId = '';
  await course.save();

  // thumbnail URL was replaced by a plain link: drop the old uploaded file
  if (replacedUpload) await deleteAssets([replacedUpload]);
  res.json({ course });
});

// DELETE /api/teacher/courses/:id  (also removes lessons, enrollments, progress, uploaded files)
export const deleteCourse = asyncHandler(async (req, res) => {
  await deleteCourseCascade(req.course);
  res.json({ message: 'Course deleted' });
});

// PATCH /api/teacher/courses/:id/publish
export const publishCourse = asyncHandler(async (req, res) => {
  const lessonCount = await Lesson.countDocuments({ course: req.course._id });
  if (!lessonCount) throw httpError(400, 'Add at least one lesson before publishing');

  req.course.published = true;
  await req.course.save();
  res.json({ course: req.course });
});

// PATCH /api/teacher/courses/:id/unpublish
export const unpublishCourse = asyncHandler(async (req, res) => {
  req.course.published = false;
  await req.course.save();
  res.json({ course: req.course });
});

// POST /api/teacher/courses/:id/thumbnail   (multipart, field "file", image only)
export const uploadThumbnail = asyncHandler(async (req, res) => {
  const course = req.course;
  const file = await uploadFile(req.file, {
    folder: `deenlearn/${req.user._id}/thumbnails`,
    allow: ['image'],
  });

  const old = course.thumbnailPublicId
    ? { publicId: course.thumbnailPublicId, resourceType: 'image' }
    : null;

  try {
    course.thumbnail = file.url;
    course.thumbnailPublicId = file.publicId;
    await course.save();
  } catch (err) {
    await deleteAssets([file]); // don't leave an orphan in Cloudinary
    throw err;
  }

  if (old) await deleteAssets([old]);
  res.json({ course });
});

// DELETE /api/teacher/courses/:id/thumbnail
export const deleteThumbnail = asyncHandler(async (req, res) => {
  const course = req.course;
  const old = course.thumbnailPublicId
    ? { publicId: course.thumbnailPublicId, resourceType: 'image' }
    : null;

  course.thumbnail = '';
  course.thumbnailPublicId = '';
  await course.save();

  if (old) await deleteAssets([old]);
  res.json({ course });
});
