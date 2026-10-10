import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';
import DashboardLayout from './DashboardLayout.jsx';

// Admin portal theme: the green "brand" palette becomes red. Active only while this layout is open.
const ADMIN_THEME_CSS = `
html.admin-theme {
  --color-brand-50: #fef2f2;
  --color-brand-100: #fee2e2;
  --color-brand-200: #fecaca;
  --color-brand-300: #fca5a5;
  --color-brand-400: #f87171;
  --color-brand-500: #ef4444;
  --color-brand-600: #dc2626;
  --color-brand-700: #b91c1c;
  --color-brand-800: #991b1b;
  --color-brand-900: #7f1d1d;
  --color-brand-950: #450a0a;
}`;

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Add the theme class to <html> (modals are portaled to <body>, so the class must sit on <html>)
  // and inject the CSS. Both are removed when the admin area is left.
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'admin-theme-style';
    style.textContent = ADMIN_THEME_CSS;
    document.head.appendChild(style);
    document.documentElement.classList.add('admin-theme');
    return () => {
      style.remove();
      document.documentElement.classList.remove('admin-theme');
    };
  }, []);

  const links = [
    { to: '/admin', label: t('admin.layout.overview'), icon: 'chart', end: true },
    { to: '/admin/users', label: t('admin.layout.users'), icon: 'users' },
    { to: '/admin/courses', label: t('admin.layout.courses'), icon: 'book' },
  ];
  // Only the super admin manages other admins
  if (user?.role === 'super_admin') {
    links.push({ to: '/admin/admins', label: t('admin.layout.admins'), icon: 'users' });
  }

  return <DashboardLayout portal="admin" links={links} />;
}
