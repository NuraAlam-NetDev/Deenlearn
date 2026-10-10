import crypto from 'crypto';

// Stripe signs each webhook: header "stripe-signature: t=<unix>,v1=<hmac>[,v1=<hmac>]"
// where hmac = HMAC-SHA256(webhookSecret, `${t}.${rawBody}`). The RAW bytes must be used:
// re-serialized JSON would not match.
export function verifyStripeSignature(rawBody, header, secret, { now = Date.now(), toleranceSec = 300 } = {}) {
  if (!rawBody || !header || !secret) return false;

  const parts = String(header).split(',').map((p) => p.trim().split('='));
  const timestamp = parts.find(([k]) => k === 't')?.[1];
  const signatures = parts.filter(([k, v]) => k === 'v1' && v).map(([, v]) => v);
  if (!timestamp || !signatures.length) return false;

  // reject old (replayed) events
  if (Math.abs(now / 1000 - Number(timestamp)) > toleranceSec) return false;

  const payload = Buffer.concat([Buffer.from(`${timestamp}.`), Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody)]);
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const expectedBuf = Buffer.from(expected);

  return signatures.some((sig) => {
    const sigBuf = Buffer.from(sig);
    return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  });
}
