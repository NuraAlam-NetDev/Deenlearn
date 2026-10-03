import { Router } from 'express';
import {
  listCourses, myCourses, getCourse, createCourse, updateCourse, deleteCourse,
} from '../controllers/courseController.js';
import {
  listLessons, createLesson, reorderLessons,
} from '../controllers/lessonController.js';
import { enroll } from '../controllers/enrollmentController.js';
import { protect, optionalAuth, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCourseSchema, updateCourseSchema, listCoursesQuery } from '../validators/course.js';
import { createLessonSchema, reorderLessonsSchema } from '../validators/lesson.js';

const router = Router();
const teacherOrAdmin = authorize('teacher', 'admin');

// Courses
router.get('/', validate(listCoursesQuery, 'query'), listCourses);
router.get('/mine', protect, teacherOrAdmin, myCourses); // must be before /:id
router.post('/', protect, teacherOrAdmin, validate(createCourseSchema), createCourse);
router.get('/:id', optionalAuth, getCourse);
router.patch('/:id', protect, validate(updateCourseSchema), updateCourse);
router.delete('/:id', protect, deleteCourse);

// Enrollment
router.post('/:id/enroll', protect, authorize('student'), enroll);

// Lessons of a course
router.get('/:courseId/lessons', protect, listLessons);
router.post('/:courseId/lessons', protect, teacherOrAdmin, validate(createLessonSchema), createLesson);
router.put('/:courseId/lessons/reorder', protect, teacherOrAdmin, validate(reorderLessonsSchema), reorderLessons);

export default router;
