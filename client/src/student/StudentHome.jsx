import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import Alert from '../../components/Alert.jsx';
import ContinueLearning from '../../components/student/ContinueLearning.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { ButtonLink } from '../../components/ui/Button.jsx';
import { CourseCard, StatCard } from '../../components/ui/Card.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { CourseCardSkeleton, Skeleton } from '../../components/ui/Skeleton.jsx';
import { lessonLink } from '../../utils/progress.js';

export default function StudentHome() {
  const summary = useFetch('/enrollments/summary');
  const courses = useFetch('/enrollments/mine?limit=6');

  const s = summary.data;
  const noCourses = s && s.enrolledCourses === 0;
  const allDone = s && s.enrolledCourses > 0 && !s.continueLearning;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-brand-800">My learning</h1>

      {(summary.error || courses.error) && <Alert>{summary.error || courses.error}</Alert>}

      {/* Continue learning */}
      {summary.loading && !s && <Skeleton className="h-44 w-full rounded-2xl" />}
      {s?.continueLearning && <ContinueLearning target={s.continueLearning} />}
      {allDone && (
        <EmptyState
          title="You have finished all your courses, Masha'Allah"
          text="Ready for more? Pick another course and keep learning."
          action={<ButtonLink to="/courses">Browse courses</ButtonLink>}
        />
      )}

      {/* Numbers */}
      {s && !noCourses && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Courses enrolled" value={s.enrolledCourses} hint={`${s.inProgressCourses} in progress`} />
          <StatCard label="Courses completed" value={s.completedCourses} />
          <StatCard label="Lessons completed" value={s.completedLessons} />
          <StatCard label="Bookmarks" value={s.bookmarks} />
        </div>
      )}

      {/* Enrolled courses with progress bars */}
      <section aria-labelledby="my-courses-heading">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="my-courses-heading" className="text-2xl font-bold text-brand-800">
            My courses
          </h2>
          {courses.data?.total > 0 && (
            <Link to="/student/courses" className="text-sm font-medium text-brand-700 hover:text-brand-600">
              View all ({courses.data.total})
            </Link>
          )}
        </div>

        {courses.loading && !courses.data && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        )}

        {courses.data && courses.data.enrollments.length === 0 && (
          <EmptyState
            title="No courses yet"
            text="You have not enrolled in any course yet. Find one and start today."
            action={<ButtonLink to="/courses">Browse courses</ButtonLink>}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.data?.enrollments.map((e) => (
            <CourseCard
              key={e._id}
              title={e.course.title}
              teacher={e.course.teacher?.name}
              category={e.course.category}
              lessonCount={e.totalLessons}
              completedLessons={e.completedLessons}
              progress={e.progress}
              thumbnail={e.course.thumbnail}
              to={lessonLink(e.course._id, e.nextLessonId, e.firstLessonId) ?? `/courses/${e.course._id}`}
              badge={e.progress === 100 ? <Badge tone="green">Completed</Badge> : null}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
