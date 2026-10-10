import Course from '../models/Course.js';
import Order from '../models/Order.js';
import Enrollment from '../models/Enrollment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { startSslPayment, validateSslPayment, sslConfigured } from '../services/payments/sslcommerz.js';
import { startStripeCheckout, verifyStripeSignature, stripeConfigured } from '../services/payments/stripe.js';

const clientUrl = () =>
  (process.env.CLIENT_URL || (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',')[0]).trim();
const apiUrl = () => (process.env.PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const priceFor = (course, currency) => (currency === 'BDT' ? course.priceBDT : course.priceUSD);
const isObjectId = (v) => /^[a-f\d]{24}$/i.test(String(v || ''));

// The gateway confirmed the money. The admin still has to verify and approve before the student is enrolled.
// Safe to repeat: gateways call back more than once.
export async function markAwaitingApproval(order, gatewayTxnId = '') {
  if (order.status === 'awaiting_approval' || order.status === 'approved') return order;
  order.status = 'awaiting_approval';
  order.paidAt = new Date();
  order.gatewayTxnId = String(gatewayTxnId || order.gatewayTxnId || '');
  await order.save();
  return order;
}

// Blocks the free enroll route for paid courses. Used in routes/courses.js.
export const requireFreeCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).select('published priceBDT priceUSD').lean();
  if (course?.published && (course.priceBDT > 0 || course.priceUSD > 0)) {
    throw httpError(402, 'This course is paid. Buy it to enroll.');
  }
  next();
});

// POST /api/payments/checkout  body: { courseId, provider: 'sslcommerz' | 'stripe', phone? }
export const checkout = asyncHandler(async (req, res) => {
  const { courseId, provider, phone } = req.body;
  const course = await Course.findById(courseId);
  if (!course || !course.published) throw httpError(404, 'Course not found');

  const enrolled = await Enrollment.exists({ student: req.user._id, course: course._id });
  if (enrolled) throw httpError(409, 'You are already enrolled in this course');

  // One open payment per course: a waiting approval, or a checkout started in the last hour
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const open = await Order.exists({
    student: req.user._id,
    course: course._id,
    $or: [{ status: 'awaiting_approval' }, { status: 'pending', createdAt: { $gte: hourAgo } }],
  });
  if (open) throw httpError(409, 'You already have a payment for this course in progress');

  const currency = provider === 'sslcommerz' ? 'BDT' : 'USD';
  const amount = priceFor(course, currency);
  if (!amount) throw httpError(400, 'This course is not priced in that currency');

  if (provider === 'sslcommerz') {
    if (!sslConfigured()) throw httpError(503, 'bKash / card payment is not set up yet');
    if (!phone) throw httpError(400, 'A mobile number is needed for bKash / Nagad payment');
  } else if (!stripeConfigured()) {
    throw httpError(503, 'International card payment is not set up yet');
  }

  const order = await Order.create({ student: req.user._id, course: course._id, provider, amount, currency });

  try {
    if (provider === 'sslcommerz') {
      const url = await startSslPayment({ order, course, student: req.user, phone, apiUrl: apiUrl() });
      return res.status(201).json({ orderId: order._id, url });
    }
    const session = await startStripeCheckout({ order, course, clientUrl: clientUrl() });
    order.providerRef = session.id;
    await order.save();
    return res.status(201).json({ orderId: order._id, url: session.url });
  } catch (err) {
    order.status = 'failed';
    await order.save();
    throw err;
  }
});

// GET /api/payments/orders/:id  (the result page polls this)
export const orderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, student: req.user._id }).lean();
  if (!order) throw httpError(404, 'Order not found');
  res.json({
    status: order.status,
    courseId: order.course,
    amount: order.amount,
    currency: order.currency,
    enrolled: order.status === 'approved',
    rejectReason: order.status === 'rejected' ? order.rejectReason : '',
  });
});

// Shared by the browser callback and the SSLCommerz IPN. Only a payment that SSLCommerz confirms
// through its validation API (right order, amount and currency) moves an order forward.
async function applySslResult(body) {
  if (!isObjectId(body.tran_id)) return null;
  const order = await Order.findById(body.tran_id);
  if (!order || order.provider !== 'sslcommerz') return null;
  if (['awaiting_approval', 'approved'].includes(order.status)) return order;

  const status = String(body.status || '').toUpperCase();
  if (status === 'VALID' || status === 'VALIDATED') {
    if (!body.val_id) return order; // the IPN will bring the val_id later
    const check = await validateSslPayment(body.val_id);
    const confirmed =
      (check.status === 'VALID' || check.status === 'VALIDATED') &&
      check.tran_id === String(order._id) &&
      Number(check.amount) === order.amount &&
      (check.currency || check.currency_type) === order.currency;
    if (confirmed) return markAwaitingApproval(order, check.bank_tran_id || body.bank_tran_id || body.val_id);
    order.status = 'failed';
    await order.save();
    return order;
  }

  if (status === 'CANCELLED' || status === 'FAILED') {
    order.status = status === 'CANCELLED' ? 'cancelled' : 'failed';
    await order.save();
  }
  return order;
}

// POST /api/payments/sslcommerz/callback  (the browser comes back here after success / fail / cancel)
export const sslCallback = asyncHandler(async (req, res) => {
  const order = await applySslResult(req.body);
  res.redirect(303, `${clientUrl()}/payment/result?order=${order?._id ?? ''}`);
});

// POST /api/payments/sslcommerz/ipn  (SSLCommerz calls this from its server)
export const sslIpn = asyncHandler(async (req, res) => {
  await applySslResult(req.body);
  res.status(200).send('OK');
});

// POST /api/payments/stripe/webhook  (raw body. Mounted in app.js BEFORE express.json)
export const stripeWebhook = asyncHandler(async (req, res) => {
  if (!verifyStripeSignature(req.body, req.headers['stripe-signature'])) {
    throw httpError(400, 'Invalid signature');
  }

  const event = JSON.parse(req.body.toString('utf8'));
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId || session.client_reference_id;
    const order = isObjectId(orderId) ? await Order.findById(orderId) : null;

    if (order && order.provider === 'stripe' && !['awaiting_approval', 'approved'].includes(order.status)) {
      const paidOk =
        session.payment_status === 'paid' &&
        Number(session.amount_total) === order.amount * 100 &&
        session.currency === 'usd';
      if (paidOk) await markAwaitingApproval(order, session.payment_intent);
      else {
        order.status = 'failed';
        await order.save();
      }
    }
  }
  res.json({ received: true });
});
