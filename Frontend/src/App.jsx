import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './index.css';
import HomePage from './pages/HomePage';
import AuthPage from './pages/auth/AuthPage';
import WorkoutPlanPage from './pages/WorkoutPlanPage';
import WorkoutLoggingPage from './pages/WorkoutLoggingPage';
import ProgressPage from './pages/ProgressPage';
import WorkoutLibraryPage from './pages/WorkoutLibraryPage';
import PlanBuilderPage from './pages/PlanBuilderPage';
import AuthenticatedAppLayout from './components/layout/AuthenticatedAppLayout';

import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />

        {/* Authenticated Layout Wrapper */}
        <Route element={<ProtectedRoute><AuthenticatedAppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workout-plans" element={<WorkoutPlanPage />} />
          <Route path="/workout-library" element={<WorkoutLibraryPage />} />
          <Route path="/plan-builder" element={<PlanBuilderPage />} />
          <Route path="/workout-logging" element={<WorkoutLoggingPage />} />
          <Route path="/progress" element={<ProgressPage />} />
        </Route>



        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
