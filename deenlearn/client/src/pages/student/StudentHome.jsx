import { useFetch } from '../../hooks/useFetch.js';
import { Spinner } from '../../components/Spinner.jsx';
import Alert from '../../components/Alert.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { CourseCard } from '../../components/ui/Card.jsx';

export default function StudentHome() {
  const { data, loading, error } = useFetch('/enrollments/mine?limit=6');

  return (
    <div>
      <h1 className="mb-5 text-3xl font-bold text-brand-800">My learning</h1>

      {loading && <Spinner />}
      {error && <Alert>{error}</Alert>}

      {data && data.enrollments.length === 0 && (
        <EmptyState title="No courses yet" text="You have not enrolled in any course yet." />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data?.enrollments.map((e) => (
          <CourseCard
            key={e._id}
            title={e.course.title}
            teacher={e.course.teacher?.name}
            category={e.course.category}
            lessonCount={e.totalLessons}
            progress={e.progress}
            thumbnail={e.course.thumbnail}
          />
        ))}
      </div>
    </div>
  );
}
