import { Router } from 'express';
import { myEnrollments } from '../controllers/enrollmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/mine', protect, authorize('student'), myEnrollments);

export default router;
