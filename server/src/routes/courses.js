import { Router } from 'express';
import { listCourses, getCourse } from '../controllers/courseController.js';
import { listLessons } from '../controllers/lessonController.js';
import { enroll } from '../controllers/enrollmentController.js';
import { protect, optionalAuth, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listCoursesQuery } from '../validators/course.js';

// Public / student side. Teachers manage content under /api/teacher.
const router = Router();

router.get('/', optionalAuth, validate(listCoursesQuery, 'query'), listCourses);
router.get('/:id', optionalAuth, getCourse);
router.post('/:id/enroll', protect, authorize('student'), enroll);
router.get('/:courseId/lessons', protect, listLessons);

export default router;
