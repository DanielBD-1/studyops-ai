import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import AppShell from './components/layout/AppShell.jsx';
import Landing from './pages/Landing.jsx';
import RegisterPage from './pages/Register.jsx';
import DashboardStub from './pages/DashboardStub.jsx';
import CoursesList from './pages/CoursesList.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import TasksPage from './pages/TasksPage.jsx';
import FlashcardsPage from './pages/FlashcardsPage.jsx';
import TrelloSyncPage from './pages/TrelloSyncPage.jsx';
import FocusPage from './pages/FocusPage.jsx';
import StudyMaterialDetail from './pages/StudyMaterialDetail.jsx';
import AdminRoute from './components/auth/AdminRoute.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';

/**
 * @param {{ children: import('react').ReactNode }} props
 */
function AuthenticatedPage({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <AuthenticatedPage>
              <DashboardStub />
            </AuthenticatedPage>
          }
        />
        <Route
          path="/courses"
          element={
            <AuthenticatedPage>
              <CoursesList />
            </AuthenticatedPage>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <AuthenticatedPage>
              <CourseDetail />
            </AuthenticatedPage>
          }
        />
        <Route
          path="/tasks"
          element={
            <AuthenticatedPage>
              <TasksPage />
            </AuthenticatedPage>
          }
        />
        <Route
          path="/flashcards"
          element={
            <AuthenticatedPage>
              <FlashcardsPage />
            </AuthenticatedPage>
          }
        />
        <Route
          path="/trello"
          element={
            <AuthenticatedPage>
              <TrelloSyncPage />
            </AuthenticatedPage>
          }
        />
        <Route
          path="/focus/:taskId"
          element={
            <AuthenticatedPage>
              <FocusPage />
            </AuthenticatedPage>
          }
        />
        <Route
          path="/study-materials/:materialId"
          element={
            <AuthenticatedPage>
              <StudyMaterialDetail />
            </AuthenticatedPage>
          }
        />
        <Route
          path="/admin"
          element={
            <AuthenticatedPage>
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            </AuthenticatedPage>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
