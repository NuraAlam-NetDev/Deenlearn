import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api, { getErrorMessage } from '../../services/api.js';
import { useToast } from '../../hooks/useToast.js';
import Button from '../ui/Button.jsx';
import Alert from '../Alert.jsx';
import FormField from '../FormField.jsx';

// Payment choices for a paid course. Cash goes to the teacher; the others go to a payment page.
export default function PaymentOptions({ course }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [busy, setBusy] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [cashDone, setCashDone] = useState(null); // amount, once the cash request is sent

  async function pay(provider) {
    if (provider === 'sslcommerz' && !/^01[3-9]\d{8}$/.test(phone.trim())) {
      setPhoneError(t('cash.phoneInvalid'));
      return;
    }
    setPhoneError('');
    setBusy(provider);
    try {
      const body = { courseId: course._id, provider, ...(provider === 'sslcommerz' && { phone: phone.trim() }) };
      const { data } = await api.post('/payments/checkout', body);
      if (provider === 'cash') {
        setCashDone(course.priceBDT);
      } else {
        toast.success(t('cash.redirecting'));
        window.location.href = data.url; // the payment page takes over
        return;
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy('');
    }
  }

  if (cashDone !== null) {
    return <Alert type="info">{t('cash.sent', { amount: cashDone })}</Alert>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">{t('cash.chooseHint')}</p>

      {course.priceBDT > 0 && (
        <>
          <FormField
            label={t('cash.phoneLabel')}
            name="payPhone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={phoneError}
            hint={t('cash.phoneHint')}
          />
          <Button full loading={busy === 'sslcommerz'} disabled={!!busy} onClick={() => pay('sslcommerz')}>
            {t('cash.optionBdt', { amount: course.priceBDT })}
          </Button>
          <Button full variant="outline" loading={busy === 'cash'} disabled={!!busy} onClick={() => pay('cash')}>
            {t('cash.optionCash', { amount: course.priceBDT })}
          </Button>
        </>
      )}

      {course.priceUSD > 0 && (
        <Button full variant="outline" loading={busy === 'stripe'} disabled={!!busy} onClick={() => pay('stripe')}>
          {t('cash.optionUsd', { amount: course.priceUSD })}
        </Button>
      )}
    </div>
  );
}
