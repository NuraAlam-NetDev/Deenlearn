import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import GuestRoute from './components/GuestRoute.jsx';
import Placeholder from './components/Placeholder.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Status from './pages/Status.jsx';
import NotFound from './pages/NotFound.jsx';
import StudentHome from './pages/student/StudentHome.jsx';
import TeacherHome from './pages/teacher/TeacherHome.jsx';
import AdminHome from './pages/admin/AdminHome.jsx';

const studentLinks = [
  { to: '/student', label: 'Dashboard', end: true },
  { to: '/student/courses', label: 'My courses' },
];
const teacherLinks = [
  { to: '/teacher', label: 'Dashboard', end: true },
  { to: '/teacher/courses', label: 'Courses' },
];
const adminLinks = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/courses', label: 'Courses' },
];

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="status" element={<Status />} />

        {/* Only for logged-out users */}
        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* /student/* */}
      <Route element={<ProtectedRoute roles={['student']} />}>
        <Route path="student" element={<DashboardLayout title="Student" links={studentLinks} />}>
          <Route index element={<StudentHome />} />
          <Route path="courses" element={<Placeholder title="My courses" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      {/* /teacher/* */}
      <Route element={<ProtectedRoute roles={['teacher']} />}>
        <Route path="teacher" element={<DashboardLayout title="Teacher" links={teacherLinks} />}>
          <Route index element={<TeacherHome />} />
          <Route path="courses" element={<Placeholder title="Manage courses" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      {/* /admin/* */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="admin" element={<DashboardLayout title="Admin" links={adminLinks} />}>
          <Route index element={<AdminHome />} />
          <Route path="users" element={<Placeholder title="Users" />} />
          <Route path="courses" element={<Placeholder title="Courses" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}