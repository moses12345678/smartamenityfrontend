import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import InvitePage from './pages/InvitePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HomePage from './pages/HomePage.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { leaveProperty } from './api/properties.js';
import { Link } from 'react-router-dom';

const MANAGER_APP_URL = import.meta.env.VITE_MANAGER_APP_URL || 'https://manager.smartamenity.net';
const isManagerRole = (user) => {
  const role = (user?.role || '').toUpperCase();
  return role === 'MANAGER' || role === 'ADMIN';
};

const RequireAuth = ({ children }) => {
  const { tokens, user, userLoading } = useAuth();
  if (!tokens?.access) return <Navigate to="/" replace />;

  if (userLoading) return <p className="muted" style={{ padding: '2rem' }}>Checking your access…</p>;

  if (isManagerRole(user)) {
    // Managers should use the manager app
    window.location.href = `${MANAGER_APP_URL}/login`;
    return null;
  }
  return children;
};

const Shell = ({ children }) => {
  const { user, tokens, logout } = useAuth();
  const location = useLocation();
  const showTopBar = location.pathname !== '/login' && location.pathname !== '/register';
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (typeof localStorage !== 'undefined') localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const isAuthed = Boolean(tokens?.access);

  return (
    <div className="page-bg">
      {showTopBar && (
        <header className="top-bar glass-topbar">
          <Link to="/" className="logo" aria-label="SmartAmenity home">
            <span className="logo-mark">SA</span>
            <span className="logo-text">SmartAmenity</span>
          </Link>
          <div className="top-actions">
            <button className="ghost-button" onClick={toggleTheme}>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            {user?.is_staff && (
              <a className="ghost-button" href="/admin/">
                Admin
              </a>
            )}
            {isAuthed && (
              <button
                className="ghost-button"
                onClick={async () => {
                try {
                  await leaveProperty({ soft: true });
                } catch (e) {
                  // ignore failures on logout
                } finally {
                  logout();
                  window.location.href = '/login';
                }
              }}
            >
              Sign out
            </button>
            )}
            {!isAuthed && (
              <a className="ghost-button" href="/login">
                Log in
              </a>
            )}
          </div>
        </header>
      )}
      <main className="content">{children}</main>
    </div>
  );
};

function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/invite/:token" element={<InvitePage />} />
        <Route path="/invite" element={<InvitePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

export default App;
