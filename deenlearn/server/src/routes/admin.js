import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getStats, listUsers, banUser, unbanUser, approveTeacher, rejectTeacher,
  listCourses, deleteCourse,
} from '../controllers/adminController.js';
import {
  listUsersQuery, banUserSchema, rejectTeacherSchema, adminListCoursesQuery,
} from '../validators/admin.js';

const router = Router();

// Everything below: admins only
router.use(protect, authorize('admin'));

router.get('/stats', getStats);

router.get('/users', validate(listUsersQuery, 'query'), listUsers);
router.patch('/users/:id/ban', validate(banUserSchema), banUser);
router.patch('/users/:id/unban', unbanUser);

router.patch('/teachers/:id/approve', approveTeacher);
router.patch('/teachers/:id/reject', validate(rejectTeacherSchema), rejectTeacher);

router.get('/courses', validate(adminListCoursesQuery, 'query'), listCourses);
router.delete('/courses/:id', deleteCourse);

export default router;
