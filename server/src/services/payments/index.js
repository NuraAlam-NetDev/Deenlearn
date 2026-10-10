import stripe from './stripe.js';
import sslcommerz from './sslcommerz.js';
import dev from './dev.js';

// To add a gateway (bKash direct, Nagad, PayPal...): write an adapter with
// { name, label, isEnabled(), supportsCurrency(c), createCheckout({payment, course, user}) -> { redirectUrl, providerRef } }
// and add it here, then confirm the payment through paymentService.fulfillPayment() ONLY after
// the gateway itself has confirmed the amount.
const PROVIDERS = [sslcommerz, stripe, dev];

export const getProvider = (name) => PROVIDERS.find((p) => p.name === name);

export const enabledProviders = (currency) =>
  PROVIDERS.filter((p) => p.isEnabled() && (!currency || p.supportsCurrency(currency))).map((p) => ({
    name: p.name,
    label: p.label,
  }));
