import { Router } from 'express';
import health from './health.js';
import auth from './auth.js';
import courses from './courses.js';
import lessons from './lessons.js';
import enrollments from './enrollments.js';

const router = Router();

router.use('/health', health);
router.use('/auth', auth);
router.use('/courses', courses);
router.use('/lessons', lessons);
router.use('/enrollments', enrollments);

export default router;
