import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import InvitePage from './pages/InvitePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HomePage from './pages/HomePage.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { leaveProperty } from './api/properties.js';

const RequireAuth = ({ children }) => {
  const { tokens } = useAuth();
  if (!tokens?.access) return <Navigate to="/" replace />;
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
        <header className="top-bar">
          <div className="logo">
            <span className="logo-mark">SA</span>
            <span className="logo-text">SmartAmenity</span>
          </div>
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
