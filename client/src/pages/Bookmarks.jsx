import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage } from '../../services/api.js';
import { removeBookmark } from '../../services/studentService.js';
import Alert from '../../components/Alert.jsx';
import Button, { ButtonLink } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Icon from '../../components/ui/Icon.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';

const PAGE_SIZE = 12;

// /student/bookmarks  -> lessons the student saved, newest first
export default function Bookmarks() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [removingId, setRemovingId] = useState(null);
  const { data, loading, error, reload } = useFetch(`/bookmarks?page=${page}&limit=${PAGE_SIZE}`);

  async function handleRemove(bookmark) {
    setRemovingId(bookmark._id);
    try {
      await removeBookmark(bookmark.lesson._id);
      toast.success('Bookmark removed');
      if (data.bookmarks.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-brand-800">Bookmarks</h1>

      {error && <Alert>{error}</Alert>}
      {loading && !data && (
        <div className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      )}

      {data && data.bookmarks.length === 0 && (
        <EmptyState
          title="No bookmarks yet"
          text="Tap the bookmark icon in a lesson to save it here."
          action={<ButtonLink to="/student/courses">Go to my courses</ButtonLink>}
        />
      )}

      {data && data.bookmarks.length > 0 && (
        <>
          <ul className="space-y-2">
            {data.bookmarks.map((b) => (
              <Card as="li" key={b._id} className="flex items-center gap-3 p-3">
                <Icon name="bookmark" className="h-5 w-5 shrink-0 fill-current text-gold-500" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/student/courses/${b.course._id}/lessons/${b.lesson._id}`}
                    dir="auto"
                    className="block truncate font-semibold text-brand-800 hover:text-brand-600"
                  >
                    {b.lesson.title}
                  </Link>
                  <p className="truncate text-sm text-slate-500" dir="auto">
                    {b.course.title}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={removingId === b._id}
                  onClick={() => handleRemove(b)}
                  aria-label={`Remove bookmark: ${b.lesson.title}`}
                >
                  <Icon name="trash" className="h-4 w-4 text-red-600" />
                </Button>
              </Card>
            ))}
          </ul>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
