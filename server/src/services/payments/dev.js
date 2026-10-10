import { paymentConfig } from '../../config/payments.js';

// Fake gateway for local testing (PAYMENTS_DEV_PROVIDER=true, never in production):
// sends the browser to a page with "Pay" and "Fail" buttons.
export default {
  name: 'dev',
  label: 'Test payment (development only)',
  isEnabled: () => paymentConfig.devEnabled(),
  supportsCurrency: () => true,
  async createCheckout({ payment }) {
    return {
      redirectUrl: `${paymentConfig.clientBase()}/student/payment/dev?payment=${payment._id}`,
      providerRef: `dev_${payment.tranId}`,
    };
  },
};
