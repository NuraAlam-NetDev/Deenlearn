import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Enrollment from '../models/Enrollment.js';
import { httpError } from '../utils/httpError.js';
import { toMinor } from '../utils/money.js';
import { getProvider } from './payments/index.js';

const newTranId = () => `DLP-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

// Starts a checkout for a paid course. Returns { payment, redirectUrl }.
export async function startCheckout({ user, course, providerName }) {
  if (!course.published) throw httpError(404, 'Course not found');
  if (!(course.price > 0)) throw httpError(400, 'This course is free. Use Enroll instead.');
  if (await Enrollment.exists({ student: user._id, course: course._id })) {
    throw httpError(409, 'You are already enrolled in this course');
  }

  const provider = getProvider(providerName);
  if (!provider || !provider.isEnabled() || !provider.supportsCurrency(course.currency)) {
    throw httpError(400, 'This payment method is not available for this course');
  }

  // The amount is decided HERE from the course, never taken from the browser
  const payment = await Payment.create({
    student: user._id,
    course: course._id,
    courseTitle: course.title,
    provider: provider.name,
    tranId: newTranId(),
    amountMinor: toMinor(course.price),
    currency: course.currency,
  });

  try {
    const { redirectUrl, providerRef } = await provider.createCheckout({ payment, course, user });
    payment.providerRef = providerRef;
    await payment.save();
    return { payment, redirectUrl };
  } catch (err) {
    payment.status = 'failed';
    payment.failureReason = 'could not start checkout';
    await payment.save();
    throw err;
  }
}

// The ONLY place a payment becomes "paid" and the student gets the course.
// Call it after the gateway confirmed the payment and its amount. Safe to call many times
// (webhook + browser redirect + IPN often arrive together): only one call wins.
export async function fulfillPayment(paymentId, { providerPaymentId = '' } = {}) {
  let payment;
  try {
    payment = await Payment.findOneAndUpdate(
      { _id: paymentId, status: { $in: ['pending', 'failed', 'cancelled'] } }, // a forged "cancel" must not block a real payment
      { $set: { status: 'paid', paidAt: new Date(), providerPaymentId, failureReason: '' } },
      { new: true }
    );
  } catch (err) {
    if (err.code === 11000) {
      // student already has a PAID payment for this course: this one needs a manual refund
      await Payment.updateOne({ _id: paymentId }, { $set: { status: 'duplicate', providerPaymentId } });
      console.error(`[payments] DUPLICATE payment ${paymentId} needs a refund`);
      return Payment.findById(paymentId);
    }
    throw err;
  }
  if (!payment) return Payment.findById(paymentId); // already paid (or duplicate): nothing more to do

  await Enrollment.updateOne(
    { student: payment.student, course: payment.course },
    { $setOnInsert: { student: payment.student, course: payment.course } },
    { upsert: true }
  );
  return payment;
}

// Gateway says it did not go through (only touches payments that are still pending)
export async function closePayment(paymentId, status, reason = '') {
  await Payment.updateOne({ _id: paymentId, status: 'pending' }, { $set: { status, failureReason: reason } });
}
