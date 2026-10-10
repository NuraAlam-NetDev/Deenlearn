import { Router } from 'express';
import {
  stripeWebhook, sslcommerzSuccess, sslcommerzClosed, sslcommerzIpn,
} from '../controllers/paymentController.js';

// Called by Stripe / SSLCommerz, not by our users: no login. Every request is verified instead
// (Stripe: signature; SSLCommerz: asks SSLCommerz back). Body parsers are chosen in app.js.
const router = Router();

router.post('/stripe', stripeWebhook);
router.post('/sslcommerz/success', sslcommerzSuccess);
router.post('/sslcommerz/fail', sslcommerzClosed('failed'));
router.post('/sslcommerz/cancel', sslcommerzClosed('cancelled'));
router.post('/sslcommerz/ipn', sslcommerzIpn);

export default router;
