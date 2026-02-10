import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './index.css';
import HomePage from './pages/HomePage';
import AuthPage from './pages/auth/AuthPage';
import WorkoutPlanPage from './pages/WorkoutPlanPage';
import WorkoutLoggingPage from './pages/WorkoutLoggingPage';
import ProgressPage from './pages/ProgressPage';
import WorkoutLibraryPage from './pages/WorkoutLibraryPage';
import AuthenticatedAppLayout from './components/layout/AuthenticatedAppLayout';

import { Dumbbell, ClipboardList, TrendingUp, Library } from 'lucide-react';


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

/**
 * Dashboard Component
 * Refactored to act as a page child within the AuthenticatedAppLayout.
 * Redundant navigation and background layers removed.
 */
const Dashboard = () => {
  return (
    <>
      {/* Hero Content */}
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4 text-black">
          Welcome to your <span className="text-orange-500">Dashboard</span>
        </h1>
        <p className="text-neutral-500 text-lg max-w-2xl font-medium">
          Track your progress, manage your workout plans, and reach your fitness goals with AI precision.
        </p>
      </div>

      {/* Grid Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/workout-plans" className="group">
          <div className="bg-white border border-neutral-200 p-8 rounded-[2rem] hover:border-orange-500/50 hover:bg-orange-50/50 transition-all duration-300 h-full shadow-sm hover:shadow-md">
            <div className="w-14 h-14 bg-orange-500/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-orange-500/10">
              <Dumbbell className="w-7 h-7 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-black">Workout Plans</h3>
            <p className="text-neutral-500 text-sm leading-relaxed font-medium">
              Create and manage personalized fitness routines tailored to your goals.
            </p>
          </div>
        </Link>

        <Link to="/workout-logging" className="group">
          <div className="bg-white border border-neutral-200 p-8 rounded-[2rem] hover:border-orange-500/50 hover:bg-orange-50/50 transition-all duration-300 h-full shadow-sm hover:shadow-md">
            <div className="w-14 h-14 bg-orange-500/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-orange-500/10">
              <ClipboardList className="w-7 h-7 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-black">Workout Logging</h3>
            <p className="text-neutral-500 text-sm leading-relaxed font-medium">
              Record your daily sessions, sets, and reps to track your consistency.
            </p>
          </div>
        </Link>

        <Link to="/progress" className="group">
          <div className="bg-white border border-neutral-200 p-8 rounded-[2rem] hover:border-orange-500/50 hover:bg-orange-50/50 transition-all duration-300 h-full shadow-sm hover:shadow-md">
            <div className="w-14 h-14 bg-orange-500/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-orange-500/10">
              <TrendingUp className="w-7 h-7 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-black">Progress Analytics</h3>
            <p className="text-neutral-500 text-sm leading-relaxed font-medium">
              Visualize your gains over time with detailed charts and statistics.
            </p>
          </div>
        </Link>

        <Link to="/workout-library" className="group">
          <div className="bg-white border border-neutral-200 p-8 rounded-[2rem] hover:border-orange-500/50 hover:bg-orange-50/50 transition-all duration-300 h-full shadow-sm hover:shadow-md">
            <div className="w-14 h-14 bg-orange-500/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-orange-500/10">
              <Library className="w-7 h-7 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-black">Workout Library</h3>
            <p className="text-neutral-500 text-sm leading-relaxed font-medium">
              Browse exercises and pick the best ones for your routine.
            </p>
          </div>
        </Link>
      </div>

    </>
  );
};



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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workout-plans" element={<WorkoutPlanPage />} />
          <Route path="/workout-library" element={<WorkoutLibraryPage />} />
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
