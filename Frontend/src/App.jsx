import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './index.css';
import SignupPage from './pages/SignupPage';

const Dashboard = () => (
  <div className="diagnostic-container">
    <h1>Backend Verification UI</h1>
    <p>Select a verification module to begin.</p>
    <nav style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
      <Link to="/signup">
        <button style={{ padding: '2rem', fontSize: '1.2rem', borderColor: 'var(--accent)' }}>
          Auth: Signup Verification
        </button>
      </Link>
    </nav>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </Router>
  );
}

export default App;
