import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import HomePage from './pages/HomePage';
import AuthPage from './pages/auth/AuthPage';
import WorkoutPlanPage from './pages/WorkoutPlanPage';
import WorkoutLoggingPage from './pages/WorkoutLoggingPage';
import ProgressPage from './pages/ProgressPage';
import WorkoutLibraryPage from './pages/WorkoutLibraryPage';
import PlanBuilderPage from './pages/PlanBuilderPage';
import ExerciseAnalyticsPage from './pages/ExerciseAnalyticsPage';
import ExercisesPage from './pages/ExercisesPage';
import ChatPage from './pages/ChatPage';
import SetupPage from './pages/SetupPage';
import ProfilePage from './pages/ProfilePage';
import AuthenticatedAppLayout from './components/layout/AuthenticatedAppLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import ReviewsPage from './pages/ReviewsPage';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />

          {/* Authenticated Layout Wrapper */}
          <Route element={<ProtectedRoute><AuthenticatedAppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/workout-plans" element={<WorkoutPlanPage />} />
            <Route path="/workout-library" element={<WorkoutLibraryPage />} />
            <Route path="/plan-builder" element={<PlanBuilderPage />} />
            <Route path="/workout-logging" element={<WorkoutLoggingPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/exercise/:exerciseId" element={<ExerciseAnalyticsPage />} />
            <Route path="/exercises" element={<ExercisesPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="/setup" element={<ProtectedRoute><SetupPage /></ProtectedRoute>} />

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
