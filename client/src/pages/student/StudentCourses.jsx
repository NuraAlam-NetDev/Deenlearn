import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useFetch } from '../../hooks/useFetch.js';
import Alert from '../../components/Alert.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button, { ButtonLink } from '../../components/ui/Button.jsx';
import { CourseCard } from '../../components/ui/Card.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Icon from '../../components/ui/Icon.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { CourseCardSkeleton } from '../../components/ui/Skeleton.jsx';
import { lessonLink } from '../../utils/progress.js';

const PAGE_SIZE = 9;
const TABS = [
  { value: '', label: 'All' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

const chip = (active) =>
  `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
    active
      ? 'border-brand-700 bg-brand-700 text-white'
      : 'border-brand-200 bg-white text-brand-800 hover:bg-brand-50'
  }`;

// /student/courses?status=in_progress&q=fiqh&page=2  (filters live in the URL, so back button works)
export default function StudentCourses() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const status = TABS.some((t) => t.value && t.value === params.get('status')) ? params.get('status') : '';
  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1);

  const [search, setSearch] = useState(q);
  const debounced = useDebounce(search.trim(), 350);

  function update(changes, { replace = false } = {}) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      },
      { replace }
    );
  }

  // typing -> (after a short pause) -> URL
  useEffect(() => {
    if (debounced !== q) update({ q: debounced, page: '' }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // URL changed from outside (back button) -> update the box
  useEffect(() => {
    if (q !== debounced) setSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (q) query.set('q', q);
  if (status) query.set('status', status);
  const { data, loading, error } = useFetch(`/enrollments/mine?${query}`);

  // e.g. an old link to page 9 when there are only 2 pages
  useEffect(() => {
    if (data && data.pages > 0 && page > data.pages) update({ page: '' }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, page]);

  const filtered = !!(q || status);
  function clearFilters() {
    setSearch('');
    setParams({}, { replace: true });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-800">My courses</h1>
      <p className="mt-1 text-slate-600">Every course you have joined, and how far you are in each.</p>

      <div className="relative mt-5">
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-slate-400">
          <Icon name="search" />
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search my courses"
          aria-label="Search my courses"
          dir="auto"
          className="h-12 w-full rounded-xl border border-brand-200 bg-white ps-11 pe-10 text-base outline-none placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label="Clear search"
            className="absolute inset-y-0 end-2 my-auto h-8 rounded-md px-1.5 text-slate-400 hover:text-brand-700"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by progress">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            className={chip(status === t.value)}
            aria-pressed={status === t.value}
            onClick={() => update({ status: t.value, page: '' })}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex min-h-8 items-center justify-between gap-3" aria-live="polite">
        <p className="text-sm text-slate-600">
          {data && `${data.total} course${data.total === 1 ? '' : 's'}`}
        </p>
        {filtered && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading && !data && Array.from({ length: 6 }, (_, i) => <CourseCardSkeleton key={i} />)}
        {data?.enrollments.map((e) => (
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

      {data && data.enrollments.length === 0 && (
        <EmptyState
          title={filtered ? 'No courses match' : 'No courses yet'}
          text={
            filtered
              ? 'Try a different word, or remove a filter.'
              : 'You have not enrolled in any course yet. Find one and start today.'
          }
          action={
            filtered ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <ButtonLink to="/courses">Browse courses</ButtonLink>
            )
          }
        />
      )}

      {data && (
        <Pagination
          page={page}
          pages={data.pages}
          onChange={(next) => {
            update({ page: next > 1 ? String(next) : '' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}
