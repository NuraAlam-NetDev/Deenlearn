import mongoose from 'mongoose';
import { CURRENCIES } from '../utils/money.js';

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'cancelled', 'duplicate'];

// One checkout attempt. A student is enrolled in a paid course only after a payment is "paid",
// and "paid" is only ever set after the gateway itself confirmed amount and currency.
const paymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    courseTitle: { type: String, required: true }, // snapshot: history stays readable if the course changes
    provider: { type: String, required: true }, // 'stripe' | 'sslcommerz' | 'dev'
    tranId: { type: String, required: true, unique: true }, // our reference, sent to the gateway
    amountMinor: { type: Number, required: true, min: 1 }, // price at checkout time, e.g. 50000 = 500.00
    currency: { type: String, enum: CURRENCIES, required: true },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'pending' },
    providerRef: { type: String, default: '' }, // Stripe session id / SSLCommerz session key
    providerPaymentId: { type: String, default: '' }, // gateway's own transaction id
    failureReason: { type: String, default: '' },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

paymentSchema.index({ student: 1, createdAt: -1 });
paymentSchema.index({ course: 1, status: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
// A student can never have two PAID payments for one course (a second one becomes 'duplicate')
paymentSchema.index({ student: 1, course: 1 }, { unique: true, partialFilterExpression: { status: 'paid' } });

export default mongoose.model('Payment', paymentSchema);
