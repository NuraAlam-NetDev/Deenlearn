import { httpError } from '../../utils/httpError.js';

// The client gets a safe message; the real reason (which may contain keys/details) stays in the server log
export function gatewayError(provider, detail) {
  console.error(`[payments] ${provider} error:`, detail);
  return httpError(502, 'The payment gateway could not start the checkout. Please try again.');
}

export const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
};
