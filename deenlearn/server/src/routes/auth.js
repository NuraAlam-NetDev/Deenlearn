import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  me,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginLimiter, registerLimiter, refreshLimiter } from '../middleware/rateLimiters.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.js';

const router = Router();

router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);
router.get('/me', protect, me);
router.patch('/me', protect, validate(updateProfileSchema), updateProfile);
// loginLimiter only counts failures, which is what we want for guessing the current password
router.put('/password', protect, loginLimiter, validate(changePasswordSchema), changePassword);

export default router;
