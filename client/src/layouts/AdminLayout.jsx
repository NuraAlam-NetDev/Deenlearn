import DashboardLayout from './DashboardLayout.jsx';

const links = [
  { to: '/admin', label: 'Overview', icon: 'chart', end: true },
  { to: '/admin/users', label: 'Users', icon: 'users' },
  { to: '/admin/courses', label: 'Courses', icon: 'book' },
];

export default function AdminLayout() {
  return <DashboardLayout portal="admin" links={links} />;
}
