import { useTranslation } from 'react-i18next';
import { useFetch } from '../../hooks/useFetch.js';
import { Spinner } from '../../components/Spinner.jsx';
import Alert from '../../components/Alert.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { CourseCard } from '../../components/ui/Card.jsx';

export default function StudentHome() {
  const { t } = useTranslation();
  const { data, loading, error } = useFetch('/enrollments/mine?limit=6');

  return (
    <div>
      <h1 className="mb-5 text-3xl font-bold text-brand-800">{t('student.home.title')}</h1>

      {loading && <Spinner />}
      {error && <Alert>{error}</Alert>}

      {data && data.enrollments.length === 0 && (
        <EmptyState title={t('student.home.noCoursesTitle')} text={t('student.home.noCoursesText')} />
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