import { Router } from 'express';
import { getLesson } from '../controllers/lessonController.js';
import { markComplete, markIncomplete } from '../controllers/enrollmentController.js';
import { protect, authorize } from '../middleware/auth.js';

// Public / student side. Teachers edit lessons under /api/teacher/lessons.
const router = Router();

router.get('/:id', protect, getLesson);
router.post('/:id/complete', protect, authorize('student'), markComplete);
router.delete('/:id/complete', protect, authorize('student'), markIncomplete);

export default router;
