import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import { formatMinor } from '../../utils/money.js';
import Alert from '../../components/Alert.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Card } from '../../components/ui/Card.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';

const TONE = { paid: 'green', pending: 'gold', failed: 'red', cancelled: 'gray', duplicate: 'red' };
const LABEL = { paid: 'Paid', pending: 'Pending', failed: 'Failed', cancelled: 'Cancelled', duplicate: 'Duplicate' };

// /student/payments  -> purchase history
export default function Payments() {
  const { data, loading, error } = useFetch('/payments/mine');

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-brand-800">Payments</h1>

      {error && <Alert>{error}</Alert>}
      {loading && !data && (
        <div className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      )}
      {data && data.payments.length === 0 && (
        <EmptyState title="No payments yet" text="Paid courses you buy will be listed here." />
      )}

      {data && data.payments.length > 0 && (
        <ul className="space-y-2">
          {data.payments.map((p) => (
            <Card as="li" key={p._id} className="flex flex-wrap items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <Link
                  to={p.status === 'paid' ? `/student/courses/${p.course}` : `/courses/${p.course}`}
                  dir="auto"
                  className="block truncate font-semibold text-brand-800 hover:text-brand-600"
                >
                  {p.courseTitle}
                </Link>
                <p className="text-sm text-slate-500">
                  {new Date(p.paidAt || p.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  {' · '}
                  <span className="capitalize">{p.provider}</span>
                </p>
              </div>
              <span className="font-semibold text-slate-800">{formatMinor(p.amountMinor, p.currency)}</span>
              <Badge tone={TONE[p.status]}>{LABEL[p.status]}</Badge>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
