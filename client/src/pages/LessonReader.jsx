import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage } from '../../services/api.js';
import {
  addBookmark,
  markComplete,
  markIncomplete,
  removeBookmark,
} from '../../services/studentService.js';
import { calcPercent } from '../../utils/learning.js';
import { formatBytes } from '../../utils/format.js';
import Alert from '../../components/Alert.jsx';
import { Spinner } from '../../components/Spinner.jsx';
import Button, { ButtonLink } from '../../components/ui/Button.jsx';
import { buttonClasses } from '../../components/ui/buttonStyles.js';
import { Card } from '../../components/ui/Card.jsx';
import Icon from '../../components/ui/Icon.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';

// Sidebar: course progress + every lesson, with a tick on the finished ones
function LessonList({ course, lessons, currentId, isDone, onPick }) {
  const done = lessons.filter((l) => isDone(l._id)).length;

  return (
    <Card className="p-4">
      {course && (
        <Link to={`/courses/${course._id}`} dir="auto" className="block font-display text-lg font-bold text-brand-800 hover:text-brand-600">
          {course.title}
        </Link>
      )}
      <ProgressBar value={calcPercent(done, lessons.length)} className="mt-3" label="Course progress" />
      <p className="mt-1 text-xs text-slate-500">
        {done} of {lessons.length} lessons done
      </p>

      <nav aria-label="Lessons" className="mt-3">
        <ol className="space-y-1">
          {lessons.map((l, i) => {
            const current = l._id === currentId;
            const finished = isDone(l._id);
            return (
              <li key={l._id}>
                <Link
                  to={`/student/courses/${course?._id ?? ''}/lessons/${l._id}`}
                  onClick={onPick}
                  aria-current={current ? 'page' : undefined}
                  className={`flex items-start gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                    current ? 'bg-brand-700 font-semibold text-white' : 'text-slate-700 hover:bg-brand-50'
                  }`}
                >
                  <Icon
                    name={finished ? 'check' : 'circle'}
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      finished ? (current ? 'text-gold-300' : 'text-brand-600') : current ? 'text-white/70' : 'text-slate-300'
                    }`}
                  />
                  <span className="min-w-0 break-words" dir="auto">
                    {i + 1}. {l.title}
                  </span>
                  {finished && <span className="sr-only"> (completed)</span>}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </Card>
  );
}

function Attachments({ files }) {
  if (!files?.length) return null;
  return (
    <section aria-labelledby="files-heading" className="mt-8 space-y-3">
      <h2 id="files-heading" className="text-xl font-bold text-brand-800">
        Lesson files
      </h2>
      <ul className="space-y-3">
        {files.map((f) => (
          <li key={f._id} className="rounded-lg border border-brand-100 bg-white p-3">
            {f.kind === 'image' ? (
              <a href={f.url} target="_blank" rel="noreferrer" className="block">
                <img src={f.url} alt={f.name} className="max-h-96 rounded-lg object-contain" loading="lazy" />
              </a>
            ) : (
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                  <Icon name="file" />
                </span>
                <div className="min-w-0 flex-1">
                  <a href={f.url} target="_blank" rel="noreferrer" dir="auto" className="block truncate font-medium text-brand-800 hover:underline">
                    {f.name}
                  </a>
                  <p className="text-xs uppercase text-slate-500">
                    {f.kind} · {formatBytes(f.size)}
                  </p>
                </div>
              </div>
            )}
            {f.kind === 'audio' && <audio controls preload="none" src={f.url} className="mt-2 w-full" />}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Reader({ courseId }) {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const course = useFetch(`/courses/${courseId}`);
  const outline = useFetch(`/courses/${courseId}/lessons`); // loaded once; stays while you move between lessons
  const current = useFetch(`/lessons/${lessonId}`);

  // changes made on this page, shown at once without reloading the lists
  const [doneOverride, setDoneOverride] = useState({});
  const [bookmarkOverride, setBookmarkOverride] = useState({});
  const [busy, setBusy] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 }); // new lesson: start at the top
  }, [lessonId]);

  const lessons = outline.data?.lessons ?? [];
  const outlineDone = new Map(lessons.map((l) => [l._id, l.completed]));
  const isDone = (id) => doneOverride[id] ?? (id === lessonId ? current.data?.completed : undefined) ?? outlineDone.get(id) ?? false;

  const error = current.error || outline.error;
  if (error) {
    return (
      <div className="space-y-3">
        <Alert>{error}</Alert>
        <Link to={`/courses/${courseId}`} className="text-brand-700 underline">
          Open the course page{current.status === 403 ? ' to enroll' : ''}
        </Link>
      </div>
    );
  }

  const lesson = current.data?.lesson;
  const { prevLesson, nextLesson } = current.data ?? {};
  const done = lesson ? isDone(lesson._id) : false;
  const bookmarked = lesson ? (bookmarkOverride[lesson._id] ?? current.data.bookmarked) : false;
  const lessonUrl = (id) => `/student/courses/${courseId}/lessons/${id}`;

  async function toggleComplete() {
    setBusy(true);
    try {
      const result = done ? await markIncomplete(lesson._id) : await markComplete(lesson._id);
      setDoneOverride((o) => ({ ...o, [lesson._id]: !done }));
      if (!done && result.courseCompleted) toast.success("Masha'Allah! You have completed this course.");
      else toast.success(done ? 'Marked as not completed' : 'Lesson completed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleBookmark() {
    const next = !bookmarked;
    setBookmarkOverride((o) => ({ ...o, [lesson._id]: next })); // instant, undone if it fails
    try {
      if (next) await addBookmark(lesson._id);
      else await removeBookmark(lesson._id);
      toast.success(next ? 'Lesson bookmarked' : 'Bookmark removed');
    } catch (err) {
      setBookmarkOverride((o) => ({ ...o, [lesson._id]: !next }));
      toast.error(getErrorMessage(err));
    }
  }

  async function completeAndContinue() {
    setBusy(true);
    try {
      await markComplete(lesson._id);
      setDoneOverride((o) => ({ ...o, [lesson._id]: true }));
      navigate(lessonUrl(nextLesson._id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const hasBody = lesson && (lesson.content || lesson.videoUrl || lesson.attachments?.length);

  return (
    <div className="space-y-4">
      <Link to="/student/courses" className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline">
        <Icon name="chevron-left" className="h-4 w-4" />
        My courses
      </Link>

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:self-start lg:overflow-y-auto">
          <Button
            variant="outline"
            full
            className="lg:hidden"
            aria-expanded={listOpen}
            aria-controls="lesson-list"
            onClick={() => setListOpen((v) => !v)}
          >
            <Icon name="menu" className="h-4 w-4" />
            {listOpen ? 'Hide lessons' : `Lessons (${lessons.length})`}
          </Button>
          <div id="lesson-list" className={`${listOpen ? 'mt-3 block' : 'hidden'} lg:block`}>
            {outline.data ? (
              <LessonList
                course={course.data?.course ?? { _id: courseId, title: '' }}
                lessons={lessons}
                currentId={lessonId}
                isDone={isDone}
                onPick={() => setListOpen(false)}
              />
            ) : (
              <Skeleton className="h-64" />
            )}
          </div>
        </aside>

        <article className="min-w-0">
          {!lesson ? (
            <div className="space-y-3" aria-busy="true">
              <Spinner />
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-48" />
            </div>
          ) : (
            <Card className="p-5 sm:p-8">
              <header className="flex items-start justify-between gap-3">
                <h1 className="break-words text-3xl font-bold text-brand-800" dir="auto">
                  {lesson.title}
                </h1>
                <button
                  type="button"
                  onClick={toggleBookmark}
                  aria-pressed={bookmarked}
                  aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this lesson'}
                  title={bookmarked ? 'Remove bookmark' : 'Bookmark this lesson'}
                  className={`shrink-0 rounded-lg p-2 transition-colors hover:bg-brand-50 ${
                    bookmarked ? 'text-gold-500' : 'text-slate-400 hover:text-brand-700'
                  }`}
                >
                  <Icon name="bookmark" className={`h-6 w-6 ${bookmarked ? 'fill-current' : ''}`} />
                </button>
              </header>

              {lesson.videoUrl && (
                <a
                  href={lesson.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`${buttonClasses({ variant: 'outline' })} mt-4`}
                >
                  Watch the video
                </a>
              )}

              {lesson.content && (
                // The server sanitizes this HTML (allow-list of tags, no scripts or event handlers)
                <div className="rich-content mt-6" dangerouslySetInnerHTML={{ __html: lesson.content }} />
              )}
              {!hasBody && <p className="mt-6 text-slate-500">This lesson has no content yet.</p>}

              <Attachments files={lesson.attachments} />

              <footer className="mt-8 flex flex-col gap-3 border-t border-brand-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                {prevLesson ? (
                  <ButtonLink to={lessonUrl(prevLesson._id)} variant="outline">
                    <Icon name="chevron-left" className="h-4 w-4" />
                    Previous
                  </ButtonLink>
                ) : (
                  <span className="hidden sm:block sm:w-28" />
                )}

                <Button variant={done ? 'outline' : 'gold'} loading={busy} onClick={toggleComplete}>
                  <Icon name={done ? 'check' : 'circle'} className="h-4 w-4" />
                  {done ? 'Completed (undo)' : 'Mark as complete'}
                </Button>

                {nextLesson ? (
                  done ? (
                    <ButtonLink to={lessonUrl(nextLesson._id)}>
                      Next
                      <Icon name="chevron-right" className="h-4 w-4" />
                    </ButtonLink>
                  ) : (
                    <Button loading={busy} onClick={completeAndContinue}>
                      Complete &amp; next
                      <Icon name="chevron-right" className="h-4 w-4" />
                    </Button>
                  )
                ) : (
                  <ButtonLink to="/student/courses" variant="outline">
                    Back to my courses
                  </ButtonLink>
                )}
              </footer>
            </Card>
          )}
        </article>
      </div>
    </div>
  );
}

// /student/courses/:courseId/lessons/:lessonId
// keyed by course, so opening another course starts with a clean slate
export default function LessonReader() {
  const { courseId } = useParams();
  return <Reader key={courseId} courseId={courseId} />;
}
