import { Router } from 'express';
import { getLesson } from '../controllers/lessonController.js';
import { markComplete, markIncomplete } from '../controllers/enrollmentController.js';
import { addBookmark, removeBookmark } from '../controllers/bookmarkController.js';
import { protect, authorize } from '../middleware/auth.js';

// Public / student side. Teachers edit lessons under /api/teacher/lessons.
const router = Router();

router.get('/:id', protect, getLesson);
router.post('/:id/complete', protect, authorize('student'), markComplete);
router.delete('/:id/complete', protect, authorize('student'), markIncomplete);
router.post('/:id/bookmark', protect, authorize('student'), addBookmark);
router.delete('/:id/bookmark', protect, authorize('student'), removeBookmark);

export default router;
