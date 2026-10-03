import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loadOwnedCourse, loadOwnedLesson } from '../middleware/ownership.js';
import { uploadSingle, requireUploads } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimiters.js';
import {
  listMyCourses, getMyCourse, createCourse, updateCourse, deleteCourse,
  publishCourse, unpublishCourse, uploadThumbnail, deleteThumbnail,
} from '../controllers/teacherCourseController.js';
import {
  listCourseLessons, getLesson, createLesson, updateLesson, deleteLesson,
  reorderLessons, addAttachment, removeAttachment,
} from '../controllers/teacherLessonController.js';
import {
  createCourseSchema, updateCourseSchema, teacherListCoursesQuery,
} from '../validators/course.js';
import {
  createLessonSchema, updateLessonSchema, reorderLessonsSchema, teacherListLessonsQuery,
} from '../validators/lesson.js';

const router = Router();

// Everything below: logged-in teachers only. Ownership is checked per course/lesson.
router.use(protect, authorize('teacher'));

const ownCourse = loadOwnedCourse('id');
const ownCourseByCourseId = loadOwnedCourse('courseId');
const uploadChain = [uploadLimiter, requireUploads, uploadSingle];

// ---- Courses ----
router.get('/courses', validate(teacherListCoursesQuery, 'query'), listMyCourses);
router.post('/courses', validate(createCourseSchema), createCourse);
router.get('/courses/:id', ownCourse, getMyCourse);
router.patch('/courses/:id', ownCourse, validate(updateCourseSchema), updateCourse);
router.delete('/courses/:id', ownCourse, deleteCourse);

router.patch('/courses/:id/publish', ownCourse, publishCourse);
router.patch('/courses/:id/unpublish', ownCourse, unpublishCourse);

router.post('/courses/:id/thumbnail', ownCourse, ...uploadChain, uploadThumbnail);
router.delete('/courses/:id/thumbnail', ownCourse, deleteThumbnail);

// ---- Lessons of a course ----
router.get('/courses/:courseId/lessons', ownCourseByCourseId, validate(teacherListLessonsQuery, 'query'), listCourseLessons);
router.post('/courses/:courseId/lessons', ownCourseByCourseId, validate(createLessonSchema), createLesson);
router.put('/courses/:courseId/lessons/reorder', ownCourseByCourseId, validate(reorderLessonsSchema), reorderLessons);

// ---- Single lesson ----
router.get('/lessons/:id', loadOwnedLesson, getLesson);
router.patch('/lessons/:id', loadOwnedLesson, validate(updateLessonSchema), updateLesson);
router.delete('/lessons/:id', loadOwnedLesson, deleteLesson);

// ---- Lesson files (PDF / image / audio) ----
router.post('/lessons/:id/attachments', loadOwnedLesson, ...uploadChain, addAttachment);
router.delete('/lessons/:id/attachments/:attachmentId', loadOwnedLesson, removeAttachment);

export default router;
