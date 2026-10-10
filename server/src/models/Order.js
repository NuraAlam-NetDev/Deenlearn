import mongoose from 'mongoose';

export const PROVIDERS = ['sslcommerz', 'stripe'];
export const CURRENCIES = ['BDT', 'USD'];
export const ORDER_STATUSES = ['pending', 'awaiting_approval', 'approved', 'rejected', 'failed', 'cancelled'];

// Lifecycle:
//   pending -> (gateway confirms money) -> awaiting_approval -> approved (enrolled) | rejected
//   pending -> failed | cancelled   (gateway says the payment did not go through)
const orderSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    provider: { type: String, enum: PROVIDERS, required: true },
    // Whole currency units, copied from the course price at checkout. The client never sets it.
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, enum: CURRENCIES, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    // SSLCommerz: our order id is sent as tran_id. Stripe: the Checkout Session id.
    providerRef: { type: String, default: '' },
    // The transaction id from the gateway (bank_tran_id for SSLCommerz, payment_intent for Stripe). Admins verify with it.
    gatewayTxnId: { type: String, default: '' },
    paidAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    rejectReason: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ student: 1, course: 1, createdAt: -1 });
orderSchema.index({ course: 1, status: 1 });
orderSchema.index({ gatewayTxnId: 1 });

export default mongoose.model('Order', orderSchema);
