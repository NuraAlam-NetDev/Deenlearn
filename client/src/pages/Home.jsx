import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { homeFor } from '../utils/roles.js';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <section className="py-12 text-center">
      <h1 className="text-4xl font-bold text-brand-700">Welcome to Deenlearn</h1>
      <p className="mt-3 text-slate-600">Learn your deen, step by step.</p>

      {!loading && (
        <div className="mt-8 flex justify-center gap-3">
          {user ? (
            <Link
              to={homeFor(user.role)}
              className="rounded-md bg-brand-700 px-5 py-2 font-medium text-white hover:bg-brand-600"
            >
              Go to my dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-md bg-brand-700 px-5 py-2 font-medium text-white hover:bg-brand-600"
              >
                Get started
              </Link>
              <Link
                to="/login"
                className="rounded-md border border-brand-700 px-5 py-2 font-medium text-brand-700 hover:bg-white"
              >
                Login
              </Link>
            </>
          )}
        </div>
      )}
    </section>
  );
}