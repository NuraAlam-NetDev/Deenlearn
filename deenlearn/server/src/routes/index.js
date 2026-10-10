import { Router } from 'express';
import health from './health.js';
import auth from './auth.js';
import courses from './courses.js';
import lessons from './lessons.js';
import enrollments from './enrollments.js';
import bookmarks from './bookmarks.js';
import teacher from './teacher.js';
import admin from './admin.js';

const router = Router();

router.use('/health', health);
router.use('/auth', auth);
router.use('/courses', courses);
router.use('/lessons', lessons);
router.use('/enrollments', enrollments);
router.use('/bookmarks', bookmarks);
router.use('/teacher', teacher);
router.use('/admin', admin);

export default router;
