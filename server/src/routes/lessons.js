import { Router } from 'express';
import { getLesson, updateLesson, deleteLesson } from '../controllers/lessonController.js';
import { markComplete, markIncomplete } from '../controllers/enrollmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateLessonSchema } from '../validators/lesson.js';

const router = Router();

router.get('/:id', protect, getLesson);
router.patch('/:id', protect, authorize('teacher', 'admin'), validate(updateLessonSchema), updateLesson);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteLesson);

// Student progress
router.post('/:id/complete', protect, authorize('student'), markComplete);
router.delete('/:id/complete', protect, authorize('student'), markIncomplete);

export default router;
