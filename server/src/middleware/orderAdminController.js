import Order from '../models/Order.js';
import Enrollment from '../models/Enrollment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { pageMeta, escapeRegex } from '../utils/pagination.js';

// Admins only see the approval queue: who paid for what, and the transaction ID to check.
// Amounts, revenue and history are never sent to admins (those are on the super admin's /api/super routes).

// GET /api/admin/orders?page=&limit=&q=   (q = transaction ID)
export const listOrders = asyncHandler(async (req, res) => {
  const { page, limit, q } = req.query;

  const filter = { status: 'awaiting_approval' };
  if (q) filter.gatewayTxnId = q;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .select('gatewayTxnId createdAt student course')
      .sort({ createdAt: 1 }) // oldest first, so nothing waits forever
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('student', 'name email')
      .populate('course', 'title')
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.json({ orders, ...pageMeta(page, limit, total) });
});

// PATCH /api/admin/orders/:id/approve  -> the student gets enrolled
export const approveOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw httpError(404, 'Order not found');
  if (order.status !== 'awaiting_approval') {
    throw httpError(400, 'Only a payment waiting for approval can be approved');
  }

  order.status = 'approved';
  order.reviewedBy = req.user._id;
  order.reviewedAt = new Date();
  order.rejectReason = '';
  await order.save();

  try {
    await Enrollment.create({ student: order.student, course: order.course });
  } catch (err) {
    if (err.code !== 11000) throw err; // already enrolled: fine
  }
  res.json({ ok: true, status: 'approved' });
});

// PATCH /api/admin/orders/:id/reject  body: { reason }
export const rejectOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw httpError(404, 'Order not found');
  if (order.status !== 'awaiting_approval') {
    throw httpError(400, 'Only a payment waiting for approval can be rejected');
  }

  order.status = 'rejected';
  order.reviewedBy = req.user._id;
  order.reviewedAt = new Date();
  order.rejectReason = req.body.reason;
  await order.save();
  res.json({ ok: true, status: 'rejected' });
});
