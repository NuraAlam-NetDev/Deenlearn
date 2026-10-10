import { useTranslation } from 'react-i18next';
import DashboardLayout from './DashboardLayout.jsx';

export default function StudentLayout() {
  const { t } = useTranslation();

  const links = [
    { to: '/student', label: t('student.nav.dashboard'), icon: 'home', end: true },
    { to: '/student/courses', label: t('student.nav.courses'), icon: 'book' },
    { to: '/student/bookmarks', label: t('student.nav.bookmarks'), icon: 'bookmark' },
    { to: '/student/notes', label: t('student.nav.notes'), icon: 'clipboard' },
    { to: '/student/certificates', label: t('student.nav.certificates'), icon: 'award' },
    { to: '/student/profile', label: t('student.nav.profile'), icon: 'user' },
  ];

  return <DashboardLayout portal="student" links={links} />;
}