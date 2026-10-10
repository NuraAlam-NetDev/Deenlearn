import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import Alert from '../../components/Alert.jsx';
import EnrolledCourseCard from '../../components/EnrolledCourseCard.jsx';
import { ButtonLink } from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { CourseCardSkeleton } from '../../components/ui/Skeleton.jsx';

const PAGE_SIZE = 9;
const TABS = [
  ['', 'All'],
  ['in_progress', 'In progress'],
  ['completed', 'Completed'],
];

const chip = (active) =>
  `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
    active
      ? 'border-brand-700 bg-brand-700 text-white'
      : 'border-brand-200 bg-white text-brand-800 hover:bg-brand-50'
  }`;

// /student/courses  -> every course the student joined
export default function MyLearning() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounce(search.trim(), 350);

  const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (status) query.set('status', status);
  if (q) query.set('q', q);
  const { data, loading, error } = useFetch(`/enrollments/mine?${query}`);

  const filtering = !!(status || q);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-brand-800">My courses</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Filter by progress">
          {TABS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={chip(status === value)}
              aria-pressed={status === value}
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search my courses"
          aria-label="Search my courses"
          dir="auto"
          className="h-10 w-full rounded-lg border border-brand-200 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 sm:w-64"
        />
      </div>

      {error && <Alert>{error}</Alert>}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      )}

      {data && data.enrollments.length === 0 && (
        <EmptyState
          title={filtering ? 'No courses match' : 'You have not enrolled in a course yet'}
          text={filtering ? 'Try a different filter or search.' : 'Browse the catalogue and join a course to start learning.'}
          action={!filtering && <ButtonLink to="/courses">Browse courses</ButtonLink>}
        />
      )}

      {data && data.enrollments.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.enrollments.map((e) => (
              <EnrolledCourseCard key={e._id} enrollment={e} />
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
