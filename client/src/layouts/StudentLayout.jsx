import DashboardLayout from './DashboardLayout.jsx';

const links = [
  { to: '/student', label: 'Dashboard', icon: 'home', end: true },
  { to: '/student/courses', label: 'My courses', icon: 'book' },
  { to: '/student/bookmarks', label: 'Bookmarks', icon: 'bookmark' },
  { to: '/student/profile', label: 'Profile', icon: 'user' },
];

export default function StudentLayout() {
  return <DashboardLayout portal="student" links={links} />;
}
