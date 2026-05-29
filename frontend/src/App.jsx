import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardStub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CoursesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute>
              <CourseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flashcards"
          element={
            <ProtectedRoute>
              <FlashcardsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trello"
          element={
            <ProtectedRoute>
              <TrelloSyncPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/focus/:taskId"
          element={
            <ProtectedRoute>
              <FocusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study-materials/:materialId"
          element={
            <ProtectedRoute>
              <StudyMaterialDetail />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
