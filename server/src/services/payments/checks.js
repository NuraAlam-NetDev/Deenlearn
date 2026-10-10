import { parseAmountToMinor } from '../../utils/money.js';

// Does a Stripe Checkout Session really mean "this payment was paid in full"?
export function stripeSessionPaysFor(session, payment) {
  return (
    session?.payment_status === 'paid' &&
    session.id === payment.providerRef &&
    session.amount_total === payment.amountMinor &&
    String(session.currency).toUpperCase() === payment.currency
  );
}

// Does SSLCommerz's validation answer mean "paid in full for THIS payment"?
// (The browser's redirect parameters are never enough: they can be forged.)
export function sslcommerzResultPaysFor(result, payment) {
  if (!result || !['VALID', 'VALIDATED'].includes(result.status)) return false;
  if (result.tran_id !== payment.tranId) return false;

  // If the buyer paid in another currency, SSLCommerz converts; currency_amount is the original price
  const sameCurrency = String(result.currency_type).toUpperCase() === payment.currency;
  const paid = parseAmountToMinor(sameCurrency ? result.amount : result.currency_amount);
  const currencyOk = sameCurrency || String(result.currency).toUpperCase() === payment.currency;
  return currencyOk && paid === payment.amountMinor;
}
