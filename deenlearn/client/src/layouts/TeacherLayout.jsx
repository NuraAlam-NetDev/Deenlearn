import DashboardLayout from './DashboardLayout.jsx';

const links = [
  { to: '/teacher', label: 'Dashboard', icon: 'home', end: true },
  { to: '/teacher/courses', label: 'Courses', icon: 'book' },
];

export default function TeacherLayout() {
  return <DashboardLayout portal="teacher" links={links} />;
}
