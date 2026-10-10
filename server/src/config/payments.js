// Read lazily (functions), so the values are always the current process.env.
const first = (s) => String(s || '').split(',')[0].trim();

export const paymentConfig = {
  // where the browser is sent after paying (first allowed client origin)
  clientBase: () => first(process.env.CLIENT_ORIGIN) || 'http://localhost:5173',
  // public https address of THIS api; gateways call it back (use a tunnel such as ngrok in dev)
  apiBase: () => String(process.env.PUBLIC_API_URL || '').replace(/\/$/, ''),
  stripe: () => ({
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  }),
  sslcommerz: () => ({
    storeId: process.env.SSLCOMMERZ_STORE_ID || '',
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || '',
    live: process.env.SSLCOMMERZ_LIVE === 'true',
  }),
  // fake gateway for local testing; can never be on in production
  devEnabled: () => process.env.PAYMENTS_DEV_PROVIDER === 'true' && process.env.NODE_ENV !== 'production',
};
