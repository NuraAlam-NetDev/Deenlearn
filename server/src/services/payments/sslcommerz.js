import { httpError } from '../../utils/httpError.js';

// SSLCommerz: bKash, Nagad, Rocket and local cards. Sandbox first, then live.
const SANDBOX = 'https://sandbox.sslcommerz.com';
const LIVE = 'https://securepay.sslcommerz.com';

export const sslConfigured = () => !!(process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWD);

const base = () => (process.env.SSLCOMMERZ_SANDBOX === 'false' ? LIVE : SANDBOX);
const creds = () => ({
  store_id: process.env.SSLCOMMERZ_STORE_ID,
  store_passwd: process.env.SSLCOMMERZ_STORE_PASSWD,
});

// Starts a payment. Returns the SSLCommerz payment page the browser must be sent to.
export async function startSslPayment({ order, course, student, phone, apiUrl }) {
  const callback = `${apiUrl}/api/payments/sslcommerz/callback`;
  const form = new URLSearchParams({
    ...creds(),
    total_amount: String(order.amount),
    currency: 'BDT',
    tran_id: String(order._id),
    success_url: callback,
    fail_url: callback,
    cancel_url: callback,
    ipn_url: `${apiUrl}/api/payments/sslcommerz/ipn`,
    cus_name: student.name.slice(0, 50),
    cus_email: student.email,
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    cus_phone: phone,
    shipping_method: 'NO',
    product_name: course.title.slice(0, 100),
    product_category: (course.category || 'general').slice(0, 50),
    product_profile: 'non-physical-goods',
  });

  const res = await fetch(`${base()}/gwprocess/v4/api.php`, { method: 'POST', body: form });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== 'SUCCESS' || !json.GatewayPageURL) {
    console.error('SSLCommerz init failed:', json?.failedreason || res.status);
    throw httpError(502, 'Could not start the bKash / card payment. Please try again.');
  }
  return json.GatewayPageURL;
}

// Asks SSLCommerz directly whether a payment is real. Never trust the browser's callback alone.
export async function validateSslPayment(valId) {
  const qs = new URLSearchParams({ val_id: valId, format: 'json', ...creds() });
  const res = await fetch(`${base()}/validator/api/validationserverAPI.php?${qs}`);
  if (!res.ok) throw httpError(502, 'Could not verify the payment');
  return res.json();
}
