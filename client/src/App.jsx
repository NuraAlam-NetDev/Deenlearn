import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import StudentLayout from './layouts/StudentLayout.jsx';
import TeacherLayout from './layouts/TeacherLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import GuestRoute from './components/GuestRoute.jsx';
import Placeholder from './components/Placeholder.jsx';
import ApprovedTeacherRoute from './components/ApprovedTeacherRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Courses from './pages/Courses.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import Status from './pages/Status.jsx';
import Design from './pages/Design.jsx';
import NotFound from './pages/NotFound.jsx';
import StudentHome from './pages/student/StudentHome.jsx';
import StudentCourses from './pages/student/StudentCourses.jsx';
import LessonReader from './pages/student/LessonReader.jsx';
import Bookmarks from './pages/student/Bookmarks.jsx';
import Profile from './pages/student/Profile.jsx';
import Notes from './pages/student/Notes.jsx';
import Certificates from './pages/student/Certificates.jsx';
import VerifyCertificate from './pages/VerifyCertificate.jsx';
import TeacherHome from './pages/teacher/TeacherHome.jsx';
import MyCourses from './pages/teacher/MyCourses.jsx';
import CourseForm from './pages/teacher/CourseForm.jsx';
import CourseManage from './pages/teacher/CourseManage.jsx';
import LessonEditor from './pages/teacher/LessonEditor.jsx';
import QuizEditor from './pages/teacher/QuizEditor.jsx';
import LessonDiscussion from './pages/teacher/LessonDiscussion.jsx';
import AdminHome from './pages/admin/AdminHome.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="status" element={<Status />} />
        <Route path="verify" element={<VerifyCertificate />} />
        <Route path="verify/:code" element={<VerifyCertificate />} />
        {import.meta.env.DEV && <Route path="design" element={<Design />} />}

        {/* Only for logged-out users */}
        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* /student/* */}
      <Route element={<ProtectedRoute roles={['student']} />}>
        <Route path="student" element={<StudentLayout />}>
          <Route index element={<StudentHome />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="courses/:courseId/lessons/:lessonId" element={<LessonReader />} />
          <Route path="bookmarks" element={<Bookmarks />} />
          <Route path="notes" element={<Notes />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      {/* /teacher/* */}
      <Route element={<ProtectedRoute roles={['teacher']} />}>
        <Route path="teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherHome />} />
          <Route element={<ApprovedTeacherRoute />}>
            <Route path="courses" element={<MyCourses />} />
            <Route path="courses/new" element={<CourseForm />} />
            <Route path="courses/:id" element={<CourseManage />} />
            <Route path="courses/:id/edit" element={<CourseForm />} />
            <Route path="courses/:courseId/lessons/new" element={<LessonEditor />} />
            <Route path="courses/:courseId/lessons/:lessonId" element={<LessonEditor />} />
            <Route path="courses/:courseId/lessons/:lessonId/quiz" element={<QuizEditor />} />
            <Route path="courses/:courseId/lessons/:lessonId/discussion" element={<LessonDiscussion />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      {/* /admin/* */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="users" element={<Placeholder title="Users" />} />
          <Route path="courses" element={<Placeholder title="Courses" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
