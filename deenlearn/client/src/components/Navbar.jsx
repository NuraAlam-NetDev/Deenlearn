import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { homeFor } from '../utils/roles.js';
import { BrandLink } from './ui/Logo.jsx';
import Button, { ButtonLink } from './ui/Button.jsx';
import Icon from './ui/Icon.jsx';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/courses', label: 'Courses' },
  { to: '/status', label: 'Status' },
  ...(import.meta.env.DEV ? [{ to: '/design', label: 'Design' }] : []),
];

const desktopLink = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-white/15 text-gold-300' : 'text-white/85 hover:bg-white/10 hover:text-white'
  }`;

const mobileLink = ({ isActive }) =>
  `block rounded-lg px-3 py-3 text-base font-medium ${
    isActive ? 'bg-white/15 text-gold-300' : 'text-white/90 hover:bg-white/10'
  }`;

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // close the mobile menu after navigating
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const auth = loading ? null : user ? (
    <>
      <ButtonLink to={homeFor(user.role)} variant="gold" size="sm">
        Dashboard
      </ButtonLink>
      <Button variant="light" size="sm" onClick={() => logout()}>
        Logout
      </Button>
    </>
  ) : (
    <>
      <ButtonLink to="/login" variant="light" size="sm">
        Login
      </ButtonLink>
      <ButtonLink to="/register" variant="gold" size="sm">
        Register
      </ButtonLink>
    </>
  );

  return (
    <header className="pattern-star sticky top-0 z-30 border-b-2 border-gold-500 bg-brand-800">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3" aria-label="Main">
        <BrandLink />

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={desktopLink}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">{auth}</div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="rounded-lg p-2 text-white hover:bg-white/10 md:hidden"
        >
          <Icon name={open ? 'x' : 'menu'} className="h-6 w-6" />
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-white/10 px-4 pb-4 pt-2 md:hidden">
          <div className="space-y-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={mobileLink}>
                {l.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">{auth}</div>
        </div>
      )}
    </header>
  );
}
