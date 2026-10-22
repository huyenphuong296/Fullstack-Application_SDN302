import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { RequireAuth, RequireAdmin, GuestOnly, homePath } from './components/RouteGuards';
import DashboardLayout from './components/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Article from './pages/Article';
import UserHome from './pages/user/UserHome';
import QuizList from './pages/user/QuizList';
import QuizPlay from './pages/user/QuizPlay';
import AdminHome from './pages/admin/AdminHome';
import ManageQuestions from './pages/admin/ManageQuestions';
import ManageQuizzes from './pages/admin/ManageQuizzes';

const USER_LINKS = [
  { to: '/dashboard', label: 'Home', end: true },
  { to: '/dashboard/quiz', label: 'Quiz' },
  { to: '/dashboard/article', label: 'Article' }
];

const ADMIN_LINKS = [
  { to: '/admin', label: 'Home', end: true },
  { to: '/admin/questions', label: 'Manage Questions' },
  { to: '/admin/quizzes', label: 'Manage Quizzes' },
  { to: '/admin/articles', label: 'Manage Articles' }
];

export default function App() {
  const user = useSelector((state) => state.auth.user);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={homePath(user)} replace />} />

      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Normal users: take quizzes */}
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<DashboardLayout title="Dashboard" links={USER_LINKS} />}>
          <Route index element={<UserHome />} />
          <Route path="quiz" element={<QuizList />} />
          <Route path="quiz/:quizId" element={<QuizPlay />} />
          <Route path="article" element={<Article />} />
        </Route>
      </Route>

      {/* Admins: manage questions and quizzes */}
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<DashboardLayout title="Admin Dashboard" links={ADMIN_LINKS} />}>
          <Route index element={<AdminHome />} />
          <Route path="questions" element={<ManageQuestions />} />
          <Route path="quizzes" element={<ManageQuizzes />} />
          <Route path="articles" element={<Article admin />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
