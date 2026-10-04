import { useFetch } from '../../hooks/useFetch.js';
import { Spinner } from '../../components/Spinner.jsx';
import Alert from '../../components/Alert.jsx';
import { StatCard } from '../../components/ui/Card.jsx';

export default function AdminHome() {
  const { data, loading, error } = useFetch('/admin/stats');

  return (
    <div>
      <h1 className="mb-5 text-3xl font-bold text-brand-800">Admin overview</h1>

      {loading && <Spinner />}
      {error && <Alert>{error}</Alert>}

      {data && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Users" value={data.users.total} hint={`${data.users.newLast7Days} new this week`} />
          <StatCard label="Students" value={data.users.students} />
          <StatCard label="Teachers" value={data.users.teachers} />
          <StatCard
            label="Pending teachers"
            value={data.users.pendingTeachers}
            tone={data.users.pendingTeachers > 0 ? 'warning' : 'default'}
          />
          <StatCard label="Banned users" value={data.users.banned} />
          <StatCard label="Courses" value={data.courses.total} hint={`${data.courses.published} published`} />
          <StatCard label="Lessons" value={data.lessons.total} />
          <StatCard
            label="Enrollments"
            value={data.enrollments.total}
            hint={`${data.enrollments.completed} completed`}
          />
        </div>
      )}
    </div>
  );
}
