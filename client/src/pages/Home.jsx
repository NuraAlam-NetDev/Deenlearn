import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useFetch } from '../hooks/useFetch.js';
import { homeFor } from '../utils/roles.js';
import { ButtonLink } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { CourseCardSkeleton } from '../components/ui/Skeleton.jsx';
import CatalogCourseCard from '../components/CatalogCourseCard.jsx';
import ArabicText from '../components/ui/ArabicText.jsx';
import Icon from '../components/ui/Icon.jsx';

const features = [
  { icon: 'chart', title: 'Learn at your pace', text: 'Follow a course lesson by lesson and watch your progress grow.' },
  { icon: 'shield', title: 'Trusted teachers', text: 'Every teacher is approved by an administrator before publishing.' },
  { icon: 'book', title: 'Text, PDF and audio', text: 'Lessons can include readings, documents, images and recitations.' },
  { icon: 'home', title: 'Works on every screen', text: 'Study on your phone, tablet or computer, in left-to-right or right-to-left text.' },
];

const steps = [
  { title: 'Create your account', text: 'Register as a student in less than a minute.' },
  { title: 'Choose a course', text: 'Search or filter the catalog and open a course to see its lessons.' },
  { title: 'Enroll and learn', text: 'Join the course and work through the lessons in order.' },
  { title: 'Track your progress', text: 'Mark lessons complete and see your percentage in your dashboard.' },
];

function PopularCourses() {
  const { data, loading, error } = useFetch('/courses?sort=popular&limit=3');

  // No courses yet (or the API is down): skip the section instead of showing an empty box
  if (error || (data && data.courses.length === 0)) return null;

  return (
    <section className="mt-14" aria-labelledby="popular-heading">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 id="popular-heading" className="text-3xl font-bold text-brand-800">
            Popular courses
          </h2>
          <p className="text-slate-600">The courses most learners have joined.</p>
        </div>
        <Link to="/courses" className="shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-600">
          View all
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && !data
          ? [0, 1, 2].map((i) => <CourseCardSkeleton key={i} />)
          : data.courses.map((c) => <CatalogCourseCard key={c._id} course={c} />)}
      </div>
    </section>
  );
}

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <>
      {/* Hero */}
      <section className="pattern-star rounded-3xl bg-brand-800 px-6 py-14 text-center text-white sm:py-20">
        <ArabicText size="lg" className="text-gold-300">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </ArabicText>
        <h1 className="mt-4 text-4xl font-bold sm:text-6xl">Learn your deen, step by step</h1>
        <p className="mx-auto mt-4 max-w-xl text-brand-100 sm:text-lg">
          Structured Islamic courses taught by approved teachers, at your own pace.
        </p>

        {!loading && (
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <ButtonLink to="/courses" variant="gold" size="lg">
              Browse courses
            </ButtonLink>
            {user ? (
              <ButtonLink to={homeFor(user.role)} variant="light" size="lg">
                My dashboard
              </ButtonLink>
            ) : (
              <ButtonLink to="/register" variant="light" size="lg">
                Create an account
              </ButtonLink>
            )}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="mt-12" aria-labelledby="features-heading">
        <h2 id="features-heading" className="mb-5 text-3xl font-bold text-brand-800">
          Why Deenlearn
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="p-5">
              <span className="inline-flex rounded-lg bg-brand-50 p-2 text-brand-700">
                <Icon name={f.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-3 text-xl font-bold text-brand-800">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Popular courses */}
      <PopularCourses />

      {/* How it works */}
      <section className="mt-14" aria-labelledby="how-heading">
        <h2 id="how-heading" className="mb-5 text-3xl font-bold text-brand-800">
          How it works
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title}>
              <Card className="h-full p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 font-display text-xl font-bold text-brand-950">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-xl font-bold text-brand-800">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.text}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Final call to action (logged-out visitors only) */}
      {!loading && !user && (
        <section className="pattern-star mt-14 rounded-3xl bg-brand-900 px-6 py-10 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to begin?</h2>
          <p className="mx-auto mt-2 max-w-md text-brand-100">
            Create an account and start your first course today.
          </p>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <ButtonLink to="/register" variant="gold" size="lg">
              Get started
            </ButtonLink>
            <ButtonLink to="/login" variant="light" size="lg">
              I already have an account
            </ButtonLink>
          </div>
        </section>
      )}
    </>
  );
}
