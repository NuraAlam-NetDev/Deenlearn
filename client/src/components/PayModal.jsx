import { useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.js';
import { getErrorMessage } from '../services/api.js';
import { createCheckout } from '../services/paymentService.js';
import { formatPrice } from '../utils/money.js';
import Alert from './Alert.jsx';
import { Spinner } from './Spinner.jsx';
import Button from './ui/Button.jsx';
import Icon from './ui/Icon.jsx';
import Modal from './ui/Modal.jsx';

// "Buy this course": pick a payment method, then the browser goes to the gateway's page.
// The price is NOT sent from here: the server reads it from the course.
export default function PayModal({ open, onClose, course }) {
  const toast = useToast();
  const [busy, setBusy] = useState('');
  const { data, loading, error } = useFetch(open ? `/payments/providers?currency=${course.currency}` : null);
  const providers = data?.providers ?? [];

  async function pay(provider) {
    setBusy(provider);
    try {
      const { redirectUrl } = await createCheckout(course._id, provider);
      if (!/^https?:\/\//i.test(redirectUrl)) throw new Error('Invalid payment link');
      window.location.assign(redirectUrl); // leaves the app; the gateway sends the buyer back
    } catch (err) {
      toast.error(getErrorMessage(err));
      setBusy('');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Buy this course" size="sm" dismissible={!busy}>
      <p className="font-semibold text-brand-800" dir="auto">
        {course.title}
      </p>
      <p className="text-2xl font-bold text-brand-700">{formatPrice(course.price, course.currency)}</p>

      <p className="mb-2 mt-4 text-sm font-medium text-slate-700">Pay with</p>
      {loading && <Spinner />}
      {error && <Alert>{error}</Alert>}
      {data && providers.length === 0 && (
        <Alert type="info">Online payment is not available for this course yet. Please try again later.</Alert>
      )}
      <div className="space-y-2">
        {providers.map((p) => (
          <Button key={p.name} variant="outline" full loading={busy === p.name} disabled={!!busy} onClick={() => pay(p.name)}>
            <Icon name="card" className="h-4 w-4" />
            {p.label}
          </Button>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">You will be taken to a secure payment page. You get access as soon as the payment is confirmed.</p>
    </Modal>
  );
}
