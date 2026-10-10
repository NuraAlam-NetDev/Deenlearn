import { Link, Navigate, useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import Alert from '../../components/Alert.jsx';
import { Spinner } from '../../components/Spinner.jsx';
import { ButtonLink } from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

// /student/courses/:courseId  -> jumps into the course: the next unfinished lesson,
// or the first lesson when everything is done. Nothing is shown except while loading.
export default function CourseResume() {
  const { courseId } = useParams();
  const progress = useFetch(`/enrollments/${courseId}/progress`);
  const lessons = useFetch(`/courses/${courseId}/lessons`);

  const error = progress.error || lessons.error;
  if (error) {
    return (
      <div className="space-y-3">
        <Alert>{error}</Alert>
        <Link to={`/courses/${courseId}`} className="text-brand-700 underline">
          Open the course page
        </Link>
      </div>
    );
  }
  if (!progress.data || !lessons.data) return <Spinner />;

  const target = progress.data.nextLesson?._id ?? lessons.data.lessons[0]?._id;
  if (!target) {
    return (
      <EmptyState
        title="No lessons yet"
        text="The teacher has not added any lessons to this course."
        action={<ButtonLink to="/student/courses">Back to my courses</ButtonLink>}
      />
    );
  }
  return <Navigate to={`/student/courses/${courseId}/lessons/${target}`} replace />;
}
