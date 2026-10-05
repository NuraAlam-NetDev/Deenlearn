import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage } from '../../services/api.js';
import { setLessonBookmark } from '../../services/studentService.js';
import Alert from '../../components/Alert.jsx';
import { ButtonLink } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Icon from '../../components/ui/Icon.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { formatDate } from '../../utils/format.js';

const PAGE_SIZE = 20;

// /student/bookmarks  -> lessons the student saved, newest first
export default function Bookmarks() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1);
  const { data, loading, error, reload } = useFetch(`/bookmarks?page=${page}&limit=${PAGE_SIZE}`);
  const [removing, setRemoving] = useState('');

  async function remove(bookmark) {
    setRemoving(bookmark._id);
    try {
      await setLessonBookmark(bookmark.lesson._id, false);
      toast.info('Bookmark removed.');
      // removed the last one on this page: step back a page
      if (data.bookmarks.length === 1 && page > 1) setParams({ page: String(page - 1) });
      else reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemoving('');
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-800">Bookmarks</h1>
      <p className="mt-1 text-slate-600">Lessons you saved to come back to.</p>

      {error && (
        <div className="mt-5">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading && !data && (
        <div className="mt-5 space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {data && data.bookmarks.length === 0 && (
        <div className="mt-5">
          <EmptyState
            title="No bookmarks yet"
            text="While reading a lesson, tap the bookmark button to save it here."
            action={<ButtonLink to="/student/courses">Go to my courses</ButtonLink>}
          />
        </div>
      )}

      {data && data.bookmarks.length > 0 && (
        <>
          <p className="mt-5 text-sm text-slate-600" aria-live="polite">
            {data.total} bookmark{data.total === 1 ? '' : 's'}
          </p>
          <ul className="mt-2 space-y-3">
            {data.bookmarks.map((b) => (
              <Card as="li" key={b._id} className="flex items-center gap-3 p-4">
                <span className="shrink-0 text-gold-600">
                  <Icon name="bookmark" filled className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-lg font-bold leading-snug text-brand-800" dir="auto">
                    <Link
                      to={`/student/courses/${b.course._id}/lessons/${b.lesson._id}`}
                      className="hover:text-brand-600"
                    >
                      {b.lesson.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-slate-500">
                    <span dir="auto">{b.course.title}</span> · saved {formatDate(b.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(b)}
                  disabled={removing === b._id}
                  aria-label={`Remove bookmark: ${b.lesson.title}`}
                  title="Remove bookmark"
                  className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                >
                  <Icon name="trash" className="h-5 w-5" />
                </button>
              </Card>
            ))}
          </ul>
          <Pagination
            page={page}
            pages={data.pages}
            onChange={(next) => {
              setParams(next > 1 ? { page: String(next) } : {});
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}
    </div>
  );
}
