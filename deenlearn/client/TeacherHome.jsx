import { useAuth } from '../../hooks/useAuth.js';
import { useFetch } from '../../hooks/useFetch.js';
import { Spinner } from '../../components/Spinner.jsx';
import Alert from '../../components/Alert.jsx';

export default function TeacherHome() {
  const { user } = useAuth();
  const pending = user.approvalStatus === 'pending';
  const rejected = user.approvalStatus === 'rejected';

  // The teacher API answers 403 until an admin approves the account, so don't call it yet
  const { data, loading, error } = useFetch(
    pending || rejected ? null : '/teacher/courses?limit=5'
  );

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-brand-700">Teacher dashboard</h1>

      {pending && (
        <Alert type="warning">
          Your account is waiting for admin approval. You can manage courses as soon as it is approved.
        </Alert>
      )}
      {rejected && (
        <Alert type="error">
          Your teacher application was not approved
          {user.rejectionReason ? `: ${user.rejectionReason}` : '.'}
        </Alert>
      )}

      {loading && <Spinner />}
      {error && <Alert>{error}</Alert>}

      {data && (
        <>
          <p className="mb-3 text-slate-600">
            {data.total} course{data.total === 1 ? '' : 's'}
          </p>
          <ul className="space-y-3">
            {data.courses.map((c) => (
              <li key={c._id} className="rounded-lg bg-white p-4 shadow-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-semibold text-slate-800">{c.title}</h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      c.published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {c.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {c.lessonCount} lessons · {c.studentCount} students
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}