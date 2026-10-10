import { Router } from 'express';
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { checkoutSchema } from '../validators/payment.js';
import { checkout, orderStatus, sslCallback, sslIpn } from '../controllers/paymentController.js';

// Stripe's webhook lives in app.js (it needs the raw body, so it is mounted before express.json)
const router = Router();
const formBody = express.urlencoded({ extended: false, limit: '32kb' }); // SSLCommerz posts forms

router.post('/checkout', protect, authorize('student'), validate(checkoutSchema), checkout);
router.get('/orders/:id', protect, authorize('student'), orderStatus);
router.post('/sslcommerz/callback', formBody, sslCallback);
router.post('/sslcommerz/ipn', formBody, sslIpn);

export default router;
