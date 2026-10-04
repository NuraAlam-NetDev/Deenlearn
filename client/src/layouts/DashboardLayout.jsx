import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const linkClass = ({ isActive }) =>
  `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-brand-700 text-white' : 'text-slate-700 hover:bg-brand-50'
  }`;

// links: [{ to: '/student', label: 'Dashboard', end: true }, ...]
export default function DashboardLayout({ title, links }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    navigate('/', { replace: true }); // leave the protected area first
    await logout();
  }

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-slate-200 bg-white md:w-56 md:border-b-0 md:border-r">
        <div className="p-4">
          <Link to="/" className="text-lg font-bold text-brand-700">
            Deenlearn
          </Link>
          <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-0">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <p className="text-sm text-slate-600">
            Signed in as <span className="font-semibold text-slate-800">{user.name}</span>
          </p>
          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
          >
            Logout
          </button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 