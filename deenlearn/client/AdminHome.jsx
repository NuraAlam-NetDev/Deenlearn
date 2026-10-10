import { useFetch } from '../../hooks/useFetch.js';
import { Spinner } from '../../components/Spinner.jsx';
import Alert from '../../components/Alert.jsx';

function Stat({ label, value, highlight }) {
  return (
    <div className={`rounded-lg p-4 shadow-sm ${highlight ? 'bg-amber-50' : 'bg-white'}`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

export default function AdminHome() {
  const { data, loading, error } = useFetch('/admin/stats');

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-brand-700">Admin overview</h1>

      {loading && <Spinner />}
      {error && <Alert>{error}</Alert>}

      {data && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Users" value={data.users.total} />
          <Stat label="Students" value={data.users.students} />
          <Stat label="Teachers" value={data.users.teachers} />
          <Stat label="Pending teachers" value={data.users.pendingTeachers} highlight={data.users.pendingTeachers > 0} />
          <Stat label="Banned users" value={data.users.banned} />
          <Stat label="Courses" value={`${data.courses.published} / ${data.courses.total} published`} />
          <Stat label="Lessons" value={data.lessons.total} />
          <Stat label="Enrollments" value={`${data.enrollments.completed} / ${data.enrollments.total} completed`} />
        </div>
      )}
    </div>
  );
}