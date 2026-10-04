import { useFetch } from '../../hooks/useFetch.js';
import { Spinner } from '../../components/Spinner.jsx';
import Alert from '../../components/Alert.jsx';

export default function StudentHome() {
  const { data, loading, error } = useFetch('/enrollments/mine?limit=6');

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-brand-700">My learning</h1>

      {loading && <Spinner />}
      {error && <Alert>{error}</Alert>}

      {data && data.enrollments.length === 0 && (
        <p className="text-slate-600">You have not enrolled in any course yet.</p>
      )}

      <ul className="space-y-3">
        {data?.enrollments.map((e) => (
          <li key={e._id} className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-semibold text-slate-800">{e.course.title}</h2>
              <span className="text-sm text-slate-500">
                {e.completedLessons}/{e.totalLessons} lessons
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-brand-600" style={{ width: `${e.progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{e.progress}% complete</p>
          </li>
        ))}
      </ul>
    </div>
  );
}