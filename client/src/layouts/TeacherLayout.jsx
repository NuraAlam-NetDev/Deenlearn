import { useTranslation } from 'react-i18next';
import DashboardLayout from './DashboardLayout.jsx';

export default function TeacherLayout() {
  const { t } = useTranslation();

  const links = [
    { to: '/teacher', label: t('teacher.nav.dashboard'), icon: 'home', end: true },
    { to: '/teacher/courses', label: t('teacher.nav.courses'), icon: 'book' },
  ];

  return <DashboardLayout portal="teacher" links={links} />;
}