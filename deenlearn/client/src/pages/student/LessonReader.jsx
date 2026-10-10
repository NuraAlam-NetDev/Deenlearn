import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage } from '../../services/api.js';
import { setLessonBookmark, setLessonComplete } from '../../services/studentService.js';
import Alert from '../../components/Alert.jsx';
import LessonContent from '../../components/student/LessonContent.jsx';
import LessonList from '../../components/student/LessonList.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button, { ButtonLink } from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Icon from '../../components/ui/Icon.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { calcPercent } from '../../utils/progress.js';

// Previous / next link with the lesson title underneath
function NavCard({ to, direction, title, primary = false }) {
  const tone = primary
    ? 'border-brand-700 bg-brand-700 text-white hover:bg-brand-800'
    : 'border-brand-200 text-brand-800 hover:bg-brand-50';

  return (
    <Link
      to={to}
      aria-label={`${direction === 'prev' ? 'Previous' : 'Next'} lesson: ${title}`}
      className={`flex w-full min-w-0 items-center gap-2 rounded-lg border px-3 py-2 transition-colors sm:max-w-xs ${tone}`}
    >
      {direction === 'prev' && <Icon name="chevron-left" className="h-5 w-5 shrink-0" />}
      <span className="min-w-0 flex-1 text-start">
        <span className="block text-xs opacity-80">{direction === 'prev' ? 'Previous' : 'Next'}</span>
        <span className="block truncate text-sm font-semibold" dir="auto">
          {title}
        </span>
      </span>
      {direction === 'next' && <Icon name="chevron-right" className="h-5 w-5 shrink-0" />}
    </Link>
  );
}

// One lesson. The reader renders it with key={lessonId}, so every lesson starts with fresh state.
function LessonPane({ courseId, lessonId, position, total, onChanged }) {
  const toast = useToast();
  const { data, loading, error, status } = useFetch(`/lessons/${lessonId}`);
  const [local, setLocal] = useState({}); // what the student just changed, shown at once
  const [busy, setBusy] = useState(''); // 'complete' | 'bookmark' | ''

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  if (loading && !data) {
    return (
      <Card>
        <CardBody className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-48 w-full" />
        </CardBody>
      </Card>
    );
  }

  if (status === 404) {
    return (
      <EmptyState
        title="Lesson not found"
        text="This lesson does not exist any more. The teacher may have removed it."
        action={<ButtonLink to="/student/courses">Back to my courses</ButtonLink>}
      />
    );
  }

  if (status === 403) {
    return (
      <EmptyState
        title="Enroll to read this lesson"
        text="You need to be enrolled in this course first."
        action={<ButtonLink to={`/courses/${courseId}`}>View course</ButtonLink>}
      />
    );
  }

  if (error || !data) return <Alert>{error || 'Could not load this lesson.'}</Alert>;

  const { lesson, prevLesson, nextLesson } = data;

  // a link with the wrong course in it: go to the right address
  if (String(lesson.course) !== courseId) {
    return <Navigate replace to={`/student/courses/${lesson.course}/lessons/${lessonId}`} />;
  }

  const completed = local.completed ?? data.completed;
  const bookmarked = local.bookmarked ?? data.bookmarked;
  const base = `/student/courses/${courseId}/lessons`;

  async function toggleComplete() {
    const next = !completed;
    setBusy('complete');
    try {
      const res = await setLessonComplete(lessonId, next);
      setLocal((l) => ({ ...l, completed: next }));
      onChanged();
      if (next && res.courseCompleted) toast.success("You have completed this course. Masha'Allah!");
      else if (next) toast.success('Lesson marked as complete.');
      else toast.info('Lesson marked as not complete.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy('');
    }
  }

  async function toggleBookmark() {
    const next = !bookmarked;
    setBusy('bookmark');
    try {
      await setLessonBookmark(lessonId, next);
      setLocal((l) => ({ ...l, bookmarked: next }));
      onChanged();
      toast.info(next ? 'Lesson bookmarked.' : 'Bookmark removed.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy('');
    }
  }

  return (
    <Card>
      <CardBody className="sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          {position >= 0 && (
            <p className="text-sm text-slate-500">
              Lesson {position + 1} of {total}
            </p>
          )}
          {completed && <Badge tone="green">Completed</Badge>}
        </div>

        <div className="mt-1 flex items-start justify-between gap-3">
          <h1 className="min-w-0 break-words text-2xl font-bold text-brand-800 sm:text-3xl" dir="auto">
            {lesson.title}
          </h1>
          <button
            type="button"
            onClick={toggleBookmark}
            disabled={busy === 'bookmark'}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this lesson'}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark this lesson'}
            className={`shrink-0 rounded-lg border p-2.5 transition-colors disabled:opacity-60 ${
              bookmarked
                ? 'border-gold-400 bg-gold-50 text-gold-700 hover:bg-gold-100'
                : 'border-brand-200 text-brand-700 hover:bg-brand-50'
            }`}
          >
            <Icon name="bookmark" filled={bookmarked} className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6">
          <LessonContent lesson={lesson} />
        </div>
      </CardBody>

      <div className="grid gap-3 border-t border-brand-100 p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-5">
        <div className="order-2 sm:order-1">
          {prevLesson && <NavCard to={`${base}/${prevLesson._id}`} direction="prev" title={prevLesson.title} />}
        </div>

        <Button
          variant={completed ? 'outline' : 'primary'}
          onClick={toggleComplete}
          loading={busy === 'complete'}
          aria-pressed={completed}
          title={completed ? 'Click to mark as not complete' : undefined}
          className="order-1 sm:order-2"
        >
          <Icon name="check" className="h-5 w-5" />
          {completed ? 'Completed' : 'Mark as complete'}
        </Button>

        <div className="order-3 sm:justify-self-end">
          {nextLesson ? (
            <NavCard to={`${base}/${nextLesson._id}`} direction="next" title={nextLesson.title} primary={completed} />
          ) : (
            <ButtonLink to="/student/courses" variant={completed ? 'primary' : 'outline'} full>
              Back to my courses
            </ButtonLink>
          )}
        </div>
      </div>
    </Card>
  );
}

// /student/courses/:courseId/lessons/:lessonId
export default function LessonReader() {
  const { courseId, lessonId } = useParams();
  const outline = useFetch(`/courses/${courseId}/lessons`);
  const [listOpen, setListOpen] = useState(false);

  // phones: fold the lesson list away after choosing a lesson
  useEffect(() => {
    setListOpen(false);
  }, [lessonId]);

  const { data, loading, error, status, reload } = outline;

  if (loading && !data) {
    return (
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (status === 403) {
    return (
      <EmptyState
        title="Enroll to read this course"
        text="The lessons are open to enrolled students."
        action={<ButtonLink to={`/courses/${courseId}`}>View course</ButtonLink>}
      />
    );
  }

  if (status === 404) {
    return (
      <EmptyState
        title="Course not found"
        text="This course does not exist any more."
        action={<ButtonLink to="/student/courses">Back to my courses</ButtonLink>}
      />
    );
  }

  if (error || !data) return <Alert>{error || 'Could not load this course.'}</Alert>;

  const { course, lessons } = data;
  const done = lessons.filter((l) => l.completed).length;
  const progress = calcPercent(done, lessons.length);
  const position = lessons.findIndex((l) => l._id === lessonId);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-4 flex min-w-0 items-center gap-1 text-sm">
        <Link to="/student/courses" className="shrink-0 font-medium text-brand-700 hover:text-brand-600">
          My courses
        </Link>
        <Icon name="chevron-right" className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="truncate text-slate-600" dir="auto">
          {course.title}
        </span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <button
            type="button"
            onClick={() => setListOpen((v) => !v)}
            aria-expanded={listOpen}
            aria-controls="lesson-list"
            className="flex w-full items-center gap-2 rounded-xl border border-brand-100 bg-white px-4 py-3 text-start font-semibold text-brand-800 shadow-card lg:hidden"
          >
            <Icon name="list" className="h-5 w-5" />
            <span className="flex-1">Lessons</span>
            <span className="text-sm font-normal text-slate-500">
              {done}/{lessons.length} done
            </span>
          </button>

          <div id="lesson-list" className={`${listOpen ? 'mt-2 block' : 'hidden'} lg:mt-0 lg:block`}>
            <Card className="overflow-hidden">
              <div className="border-b border-brand-50 p-4">
                <h2 className="break-words text-lg font-bold text-brand-800" dir="auto">
                  {course.title}
                </h2>
                <ProgressBar value={progress} label="Course progress" className="mt-2" />
                <p className="mt-0.5 text-xs text-slate-500">
                  {done} of {lessons.length} lesson{lessons.length === 1 ? '' : 's'} completed
                </p>
              </div>
              <div className="max-h-[60vh] overflow-y-auto lg:max-h-[calc(100dvh-16rem)]">
                {lessons.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500">No lessons have been added yet.</p>
                ) : (
                  <LessonList courseId={courseId} lessons={lessons} currentId={lessonId} />
                )}
              </div>
            </Card>
          </div>
        </aside>

        <article className="min-w-0" aria-label="Lesson">
          <LessonPane
            key={lessonId}
            courseId={courseId}
            lessonId={lessonId}
            position={position}
            total={lessons.length}
            onChanged={reload}
          />
        </article>
      </div>
    </div>
  );
}
