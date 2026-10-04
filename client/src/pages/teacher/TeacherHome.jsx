import { useAuth } from '../../hooks/useAuth.js';
import { useFetch } from '../../hooks/useFetch.js';
import { Spinner } from '../../components/Spinner.jsx';
import Alert from '../../components/Alert.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Card } from '../../components/ui/Card.jsx';

export default function TeacherHome() {
  const { user } = useAuth();
  const pending = user.approvalStatus === 'pending';
  const rejected = user.approvalStatus === 'rejected';

  // The teacher API answers 403 until an admin approves the account, so don't call it yet
  const { data, loading, error } = useFetch(pending || rejected ? null : '/teacher/courses?limit=5');

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-brand-800">Teacher dashboard</h1>

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

      {data && data.courses.length === 0 && (
        <EmptyState title="No courses yet" text="Course creation is coming next." />
      )}

      {data && data.courses.length > 0 && (
        <>
          <p className="text-slate-600">
            {data.total} course{data.total === 1 ? '' : 's'}
          </p>
          <ul className="space-y-3">
            {data.courses.map((c) => (
              <Card as="li" key={c._id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 break-words text-xl font-bold text-brand-800" dir="auto">
                    {c.title}
                  </h2>
                  <Badge tone={c.published ? 'green' : 'gray'}>{c.published ? 'Published' : 'Draft'}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {c.lessonCount} lessons · {c.studentCount} students
                </p>
              </Card>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
