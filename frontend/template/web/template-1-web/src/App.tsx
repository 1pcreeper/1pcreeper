import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import UsersPage from '@/pages/UsersPage';
import GradesPage from '@/pages/GradesPage';
import TopicsPage from '@/pages/TopicsPage';
import SubtopicsPage from '@/pages/SubtopicsPage';
import WordsPage from '@/pages/WordsPage';
import QuestionsPage from '@/pages/QuestionsPage';
import SubscriptionsPage from '@/pages/SubscriptionsPage';
import ExerciseRoundsPage from '@/pages/ExerciseRoundsPage';
import LogoutPage from './pages/LogoutPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="grades" element={<GradesPage />} />
            <Route path="topics" element={<TopicsPage />} />
            <Route path="subtopics" element={<SubtopicsPage />} />
            <Route path="words" element={<WordsPage />} />
            <Route path="questions" element={<QuestionsPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="exercise-rounds" element={<ExerciseRoundsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
