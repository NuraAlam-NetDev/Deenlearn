import { Router } from 'express';
import { myCertificates, downloadCertificate, verifyCertificate } from '../controllers/certificateController.js';
import { protect, authorize } from '../middleware/auth.js';

// Claiming a certificate lives under POST /api/courses/:courseId/certificate (see routes/courses.js)
const router = Router();

// Public: check a certificate by its code
router.get('/verify/:code', verifyCertificate);

router.get('/mine', protect, authorize('student'), myCertificates);
//router.get('/:id/pdf', protect, authorize('student'), downloadCertificate);
router.get(
  '/:id/pdf',
  (req, res, next) => {
    console.log('========== PDF ROUTE HIT ==========');
    console.log('Certificate ID:', req.params.id);
    next();
  },
  (req, res, next) => {
    console.log('========== BEFORE PROTECT ==========');
    next();
  },
  protect,
  (req, res, next) => {
    console.log('========== AFTER PROTECT ==========');
    console.log('User:', req.user?._id);
    next();
  },
  authorize('student'),
  (req, res, next) => {
    console.log('========== AFTER AUTHORIZE ==========');
    next();
  },
  downloadCertificate
);
export default router;
