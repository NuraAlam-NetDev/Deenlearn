import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage } from '../../services/api.js';
import { completeDevPayment } from '../../services/paymentService.js';
import Alert from '../../components/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';

// /student/payment/dev?payment=ID   stand-in for a gateway page (server: PAYMENTS_DEV_PROVIDER=true)
export default function PaymentDev() {
  const [params] = useSearchParams();
  const id = params.get('payment');
  const navigate = useNavigate();
  const toast = useToast();
  const [busy, setBusy] = useState('');

  async function finish(outcome) {
    setBusy(outcome);
    try {
      await completeDevPayment(id, outcome);
      navigate(`/student/payment/result?payment=${id}`, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setBusy('');
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 py-8">
      <Alert type="warning">This is a fake test payment page for development. No money moves.</Alert>
      <Card className="space-y-3 p-6">
        <h1 className="text-2xl font-bold text-brand-800">Test payment</h1>
        <Button full loading={busy === 'success'} disabled={!id || !!busy} onClick={() => finish('success')}>
          Pay (success)
        </Button>
        <Button full variant="outline" loading={busy === 'fail'} disabled={!id || !!busy} onClick={() => finish('fail')}>
          Fail the payment
        </Button>
      </Card>
    </div>
  );
}
