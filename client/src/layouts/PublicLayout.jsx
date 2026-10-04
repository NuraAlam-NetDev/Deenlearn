import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { homeFor } from '../utils/roles.js';

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-1 text-sm font-medium ${
    isActive ? 'bg-white text-brand-700' : 'text-white/90 hover:bg-white/10'
  }`;

export default function PublicLayout() {
  const { user, loading, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-brand-700">
        <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <Link to="/" className="text-lg font-bold text-gold-500">
            Deenlearn
          </Link>
          <div className="flex items-center gap-2">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/status" className={linkClass}>
              Status
            </NavLink>
            {!loading && user && (
              <>
                <NavLink to={homeFor(user.role)} className={linkClass}>
                  Dashboard
                </NavLink>
                <button
                  onClick={logout}
                  className="rounded-md px-3 py-1 text-sm font-medium text-white/90 hover:bg-white/10"
                >
                  Logout
                </button>
              </>
            )}
            {!loading && !user && (
              <>
                <NavLink to="/login" className={linkClass}>
                  Login
                </NavLink>
                <Link
                  to="/register"
                  className="rounded-md bg-gold-500 px-3 py-1 text-sm font-semibold text-brand-700 hover:opacity-90"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 p-6">
        <Outlet />
      </main>

      <footer className="p-4 text-center text-sm text-slate-500">© Deenlearn</footer>
    </div>
  );
}