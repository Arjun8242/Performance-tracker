import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './index.css';
import HomePage from './pages/HomePage';
import AuthPage from './pages/auth/AuthPage';
import WorkoutPlanPage from './pages/WorkoutPlanPage';
import WorkoutLoggingPage from './pages/WorkoutLoggingPage';
import ProgressPage from './pages/ProgressPage';
import { Activity, LogOut, Dumbbell, ClipboardList, TrendingUp } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const Dashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-emerald-500" />
              <span className="text-xl font-bold tracking-tight">AI-Fitness</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-500/10 hover:text-red-400 border border-slate-700 hover:border-red-500/20 transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
            Welcome to your <span className="text-emerald-500">Dashboard</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Track your progress, manage your workout plans, and reach your fitness goals with AI precision.
          </p>
        </div>

        {/* Grid Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/workout-plans" className="group">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 h-full">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Workout Plans</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Create and manage personalized fitness routines tailored to your goals.
              </p>
            </div>
          </Link>

          <Link to="/workout-logging" className="group">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 h-full">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ClipboardList className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Workout Logging</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Record your daily sessions, sets, and reps to track your consistency.
              </p>
            </div>
          </Link>

          <Link to="/progress" className="group">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300 h-full">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Progress Analytics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Visualize your gains over time with detailed charts and statistics.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Landing Page */}
        <Route path="/" element={<HomePage />} />

        {/* Auth Routes */}
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/workout-plans" element={<ProtectedRoute><WorkoutPlanPage /></ProtectedRoute>} />
        <Route path="/workout-logging" element={<ProtectedRoute><WorkoutLoggingPage /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
