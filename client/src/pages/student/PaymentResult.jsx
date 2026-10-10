import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api.js';
import { formatMinor } from '../../utils/money.js';
import Alert from '../../components/Alert.jsx';
import { Spinner } from '../../components/Spinner.jsx';
import { ButtonLink } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';

const POLL_MS = 2000;
const MAX_TRIES = 30; // about a minute: webhooks are usually faster than this

// /student/payment/result?payment=ID   where the gateway sends the buyer back to.
// The browser redirect proves nothing; this page only asks OUR server what the payment status is.
export default function PaymentResult() {
  const [params] = useSearchParams();
  const id = params.get('payment');
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;
    let timer;
    let tries = 0;

    async function check() {
      try {
        const { data } = await api.get(`/payments/${id}`);
        if (cancelled) return;
        setPayment(data.payment);
        if (data.payment.status !== 'pending') return;
        tries += 1;
        if (tries >= MAX_TRIES) setGaveUp(true);
        else timer = setTimeout(check, POLL_MS);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      }
    }
    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id]);

  let body;
  if (!id) body = <Alert>No payment was given.</Alert>;
  else if (error) body = <Alert>{error}</Alert>;
  else if (!payment || (payment.status === 'pending' && !gaveUp)) {
    body = (
      <div className="space-y-3 text-center" aria-live="polite">
        <Spinner />
        <p className="font-semibold text-brand-800">Confirming your payment…</p>
        <p className="text-sm text-slate-500">This usually takes a few seconds. Please do not close this page.</p>
      </div>
    );
  } else if (payment.status === 'paid') {
    body = (
      <div className="space-y-4 text-center" aria-live="polite">
        <p className="text-2xl font-bold text-brand-800">Payment received. Jazakallahu khairan!</p>
        <p className="text-slate-600" dir="auto">
          You are now enrolled in {payment.courseTitle} ({formatMinor(payment.amountMinor, payment.currency)}).
        </p>
        <ButtonLink to={`/student/courses/${payment.course}`} size="lg">
          Start learning
        </ButtonLink>
      </div>
    );
  } else if (payment.status === 'pending') {
    body = (
      <div className="space-y-3 text-center">
        <p className="text-xl font-bold text-brand-800">Still processing</p>
        <p className="text-slate-600">
          We have not heard back from the payment gateway yet. If money was taken, you will get access automatically as
          soon as it is confirmed. Check <Link to="/student/payments" className="text-brand-700 underline">your payments</Link> later.
        </p>
      </div>
    );
  } else if (payment.status === 'duplicate') {
    body = <Alert type="warning">This looks like a second payment for a course you already own. Please contact support for a refund.</Alert>;
  } else {
    body = (
      <div className="space-y-4 text-center" aria-live="polite">
        <p className="text-xl font-bold text-brand-800">
          {payment.status === 'cancelled' ? 'Payment cancelled' : 'Payment was not completed'}
        </p>
        <p className="text-slate-600">You have not been charged for this order. You can try again.</p>
        <ButtonLink to={`/courses/${payment.course}`}>Back to the course</ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-8">
      <Card className="p-6">{body}</Card>
    </div>
  );
}
