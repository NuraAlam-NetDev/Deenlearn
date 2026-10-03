import { Router } from 'express';
import health from './health.js';

const router = Router();

router.use('/health', health);
// router.use('/auth', authRoutes);
// router.use('/lessons', lessonRoutes);

export default router;
