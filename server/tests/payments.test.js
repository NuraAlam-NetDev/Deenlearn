import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { toMinor, parseAmountToMinor, formatMinor } from '../src/utils/money.js';
import { verifyStripeSignature } from '../src/services/payments/stripeSignature.js';
import { stripeSessionPaysFor, sslcommerzResultPaysFor } from '../src/services/payments/checks.js';

const sign = (body, secret, t) =>
  crypto.createHmac('sha256', secret).update(`${t}.${body}`).digest('hex');

test('money: major units <-> minor units without float drift', () => {
  assert.equal(toMinor(500), 50000);
  assert.equal(toMinor(19.99), 1999);
  assert.equal(toMinor(0.1 + 0.2), 30);
  assert.equal(formatMinor(1999), '19.99');
  assert.equal(parseAmountToMinor('500.00'), 50000);
  assert.equal(parseAmountToMinor(' 19.99 '), 1999);
  assert.ok(Number.isNaN(parseAmountToMinor('abc')));
  assert.ok(Number.isNaN(parseAmountToMinor(undefined) + NaN));
});

test('stripe signature: valid signature is accepted', () => {
  const body = '{"id":"evt_1"}';
  const t = Math.floor(Date.now() / 1000);
  const header = `t=${t},v1=${sign(body, 'whsec_test', t)}`;
  assert.equal(verifyStripeSignature(Buffer.from(body), header, 'whsec_test'), true);
});

test('stripe signature: tampered body, wrong secret, missing parts are rejected', () => {
  const body = '{"id":"evt_1"}';
  const t = Math.floor(Date.now() / 1000);
  const header = `t=${t},v1=${sign(body, 'whsec_test', t)}`;
  assert.equal(verifyStripeSignature(Buffer.from('{"id":"evt_2"}'), header, 'whsec_test'), false);
  assert.equal(verifyStripeSignature(Buffer.from(body), header, 'whsec_other'), false);
  assert.equal(verifyStripeSignature(Buffer.from(body), `t=${t}`, 'whsec_test'), false);
  assert.equal(verifyStripeSignature(Buffer.from(body), undefined, 'whsec_test'), false);
  assert.equal(verifyStripeSignature(Buffer.from(body), header, ''), false);
  assert.equal(verifyStripeSignature(Buffer.from(body), `t=${t},v1=zz`, 'whsec_test'), false);
});

test('stripe signature: old (replayed) event is rejected, one good v1 among several is enough', () => {
  const body = '{"id":"evt_1"}';
  const old = Math.floor(Date.now() / 1000) - 3600;
  assert.equal(verifyStripeSignature(Buffer.from(body), `t=${old},v1=${sign(body, 's', old)}`, 's'), false);

  const t = Math.floor(Date.now() / 1000);
  const header = `t=${t},v1=deadbeef,v1=${sign(body, 's', t)}`;
  assert.equal(verifyStripeSignature(Buffer.from(body), header, 's'), true);
});

const payment = { tranId: 'DLP-1', providerRef: 'cs_1', amountMinor: 50000, currency: 'BDT' };

test('stripe session must be paid, same session, same amount and currency', () => {
  const ok = { id: 'cs_1', payment_status: 'paid', amount_total: 50000, currency: 'bdt' };
  assert.equal(stripeSessionPaysFor(ok, payment), true);
  assert.equal(stripeSessionPaysFor({ ...ok, payment_status: 'unpaid' }, payment), false);
  assert.equal(stripeSessionPaysFor({ ...ok, amount_total: 100 }, payment), false);
  assert.equal(stripeSessionPaysFor({ ...ok, currency: 'usd' }, payment), false);
  assert.equal(stripeSessionPaysFor({ ...ok, id: 'cs_other' }, payment), false);
  assert.equal(stripeSessionPaysFor(null, payment), false);
});

test('sslcommerz result must be VALID, same tran_id and the full amount', () => {
  const ok = { status: 'VALID', tran_id: 'DLP-1', amount: '500.00', currency_type: 'BDT' };
  assert.equal(sslcommerzResultPaysFor(ok, payment), true);
  assert.equal(sslcommerzResultPaysFor({ ...ok, status: 'VALIDATED' }, payment), true);
  assert.equal(sslcommerzResultPaysFor({ ...ok, status: 'INVALID_TRANSACTION' }, payment), false);
  assert.equal(sslcommerzResultPaysFor({ ...ok, status: 'FAILED' }, payment), false);
  assert.equal(sslcommerzResultPaysFor({ ...ok, tran_id: 'DLP-2' }, payment), false);
  assert.equal(sslcommerzResultPaysFor({ ...ok, amount: '5.00' }, payment), false);
  assert.equal(sslcommerzResultPaysFor({ ...ok, amount: 'x' }, payment), false);
  assert.equal(sslcommerzResultPaysFor(null, payment), false);
});

test('sslcommerz: card paid in another currency is checked against the original price', () => {
  const usdPayment = { ...payment, amountMinor: 1000, currency: 'USD' };
  const converted = { status: 'VALID', tran_id: 'DLP-1', amount: '1100.00', currency_type: 'BDT', currency_amount: '10.00', currency: 'USD' };
  assert.equal(sslcommerzResultPaysFor(converted, usdPayment), true);
  assert.equal(sslcommerzResultPaysFor({ ...converted, currency_amount: '1.00' }, usdPayment), false);
});
