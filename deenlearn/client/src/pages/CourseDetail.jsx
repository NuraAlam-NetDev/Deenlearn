import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.js';
import api, { getErrorMessage } from '../services/api.js';
import Alert from '../components/Alert.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button, { ButtonLink } from '../components/ui/Button.jsx';
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Icon from '../components/ui/Icon.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import TextBlock from '../components/ui/TextBlock.jsx';
import { homeFor } from '../utils/roles.js';

// The box next to the course: what the visitor can do depends on who they are
function EnrollPanel({ user, authLoading, canManage, enrollment, lessonCount, enrolling, onEnroll, location }) {
  let body;

  if (authLoading) {
    body = <Skeleton className="h-11 w-full" />;
  } else if (!user) {
    body = (
      <>
        <p className="text-sm text-slate-600">Login or create an account to join this course.</p>
        <ButtonLink to="/login" state={{ from: location }} full size="lg">
          Login to enroll
        </ButtonLink>
        <ButtonLink to="/register" state={{ from: location }} variant="outline" full>
          Create an account
        </ButtonLink>
      </>
    );
  } else if (enrollment) {
    body = (
      <>
        <p className="font-semibold text-brand-800">You are enrolled</p>
        <ProgressBar value={enrollment.progress} />
        <p className="text-sm text-slate-600">
          {enrollment.completedLessons} of {enrollment.totalLessons} lessons completed
        </p>
        <ButtonLink to={homeFor(user.role)} full size="lg">
          Go to my dashboard
        </ButtonLink>
      </>
    );
  } else if (canManage) {
    body = (
      <>
        <Alert type="info">This is your course. Students see it like this.</Alert>
        <ButtonLink to="/teacher/courses" variant="outline" full>
          Manage my courses
        </ButtonLink>
      </>
    );
  } else if (user.role === 'student') {
    body = (
      <>
        <p className="text-sm text-slate-600">
          Join to unlock all {lessonCount} lesson{lessonCount === 1 ? '' : 's'} and track your progress.
        </p>
        <Button full size="lg" loading={enrolling} onClick={onEnroll}>
          Enroll now
        </Button>
      </>
    );
  } else {
    body = <Alert type="info">Only student accounts can enroll in courses.</Alert>;
  }

  return (
    <Card>
      <CardBody className="space-y-3">{body}</CardBody>
    </Card>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const location = useLocation();
  const toast = useToast();
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, status, reload } = useFetch(`/courses/${id}`);
  const [enrolling, setEnrolling] = useState(false);

  async function handleEnroll() {
    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      toast.success('You are enrolled in this course.');
      reload();
    } catch (err) {
      if (err.response?.status === 409) {
        toast.info('You are already enrolled.');
        reload();
      } else {
        toast.error(getErrorMessage(err));
      }
    } finally {
      setEnrolling(false);
    }
  }

  const back = (
    <Link
      to="/courses"
      className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-600"
    >
      <Icon name="chevron-left" className="h-4 w-4" />
      All courses
    </Link>
  );

  if (loading && !data) {
    return (
      <div>
        {back}
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="mt-4 h-10 w-2/3" />
        <Skeleton className="mt-3 h-5 w-1/3" />
      </div>
    );
  }

  if (status === 404) {
    return (
      <div>
        {back}
        <EmptyState
          title="Course not found"
          text="This course does not exist, or it is not published."
          action={<ButtonLink to="/courses">Browse courses</ButtonLink>}
        />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        {back}
        <Alert>{error || 'Could not load this course.'}</Alert>
      </div>
    );
  }

  const { course, lessons, canManage, enrollment } = data;
  const locked = !enrollment && !canManage;

  return (
    <div>
      {back}

      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="order-first lg:sticky lg:top-24 lg:order-none lg:col-start-3 lg:row-start-1 lg:self-start">
          <EnrollPanel
            user={user}
            authLoading={authLoading}
            canManage={canManage}
            enrollment={enrollment}
            lessonCount={lessons.length}
            enrolling={enrolling}
            onEnroll={handleEnroll}
            location={location}
          />
        </aside>

        <div className="space-y-6 lg:col-span-2 lg:col-start-1 lg:row-start-1">
          <Card className="overflow-hidden">
            <div className="pattern-star relative aspect-video bg-brand-700">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-gold-400">
                  <Icon name="book" className="h-16 w-16" />
                </div>
              )}
            </div>
            <CardBody className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="gold" className="capitalize">
                  {course.category}
                </Badge>
                {!course.published && <Badge tone="gray">Draft: only you can see this</Badge>}
              </div>
              <h1 className="break-words text-3xl font-bold text-brand-800 sm:text-4xl" dir="auto">
                {course.title}
              </h1>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                {course.teacher?.name && (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="user" className="h-4 w-4" />
                    <span dir="auto">{course.teacher.name}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="book" className="h-4 w-4" />
                  {lessons.length} lesson{lessons.length === 1 ? '' : 's'}
                </span>
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="About this course" />
            <CardBody>
              <TextBlock text={course.description || 'The teacher has not added a description yet.'} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Course content"
              subtitle={`${lessons.length} lesson${lessons.length === 1 ? '' : 's'}`}
            />
            {lessons.length === 0 ? (
              <CardBody>
                <p className="text-sm text-slate-500">No lessons have been added yet.</p>
              </CardBody>
            ) : (
              <ol className="divide-y divide-brand-50">
                {lessons.map((lesson, i) => (
                  <li key={lesson._id} className="flex items-center gap-3 px-5 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 break-words" dir="auto">
                      {lesson.title}
                    </span>
                    {locked && <Icon name="lock" className="h-4 w-4 shrink-0 text-slate-400" />}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
