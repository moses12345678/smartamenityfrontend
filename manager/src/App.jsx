import { Navigate, Route, Routes, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import CareersPage from './pages/CareersPage.jsx';
import { useAuth } from './context/AuthContext.jsx';

const RequireAuth = ({ children }) => {
  const { tokens, user } = useAuth();
  if (!tokens?.access) return <Navigate to="/login" replace />;
  if (user && user.role && user.role !== 'MANAGER' && user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const Shell = ({ children }) => {
  const { tokens, logout } = useAuth();
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('manager-theme') || 'light';
    document.documentElement.setAttribute('data-theme', stored);
    return stored;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('manager-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  const showTopBar = true; // keep header visible for theme toggle on all screens

  return (
    <div className="page">
      {showTopBar && (
        <header className="topbar">
          <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
            SmartAmenity Manager
          </Link>
          <div className="actions">
            <button className="ghost theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? '🌙 Dark' : '🌞 Light'}
            </button>
            {tokens?.access && (
              <button className="ghost" onClick={logout}>
                Sign out
              </button>
            )}
          </div>
        </header>
      )}
      <main className="content">{children}</main>
    </div>
  );
};

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
