import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, changePassword } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';

const fieldError = (err) => {
  const data = err?.response?.data;
  if (!data) return err?.message || 'Request failed';
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  const firstKey = Object.keys(data)[0];
  const val = data[firstKey];
  if (Array.isArray(val)) return val[0];
  if (typeof val === 'string') return val;
  return 'Request failed';
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { saveTokens, setUser, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mustChange, setMustChange] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await login({ email, password });
      saveTokens(data.access, data.refresh);
      setUser(data.user);
      const role = data.user?.role;
      if (role !== 'MANAGER' && role !== 'ADMIN') {
        setError('This account is not authorized for the manager dashboard.');
        logout();
        setLoading(false);
        return;
      }
      if (data.must_change_password || data.user?.must_change_password) {
        setMustChange(true);
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(fieldError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    setLoading(true);
    try {
      await changePassword({ old_password: password, new_password: newPass });
      setPassword(newPass);
      setMustChange(false);
      setError('');
      navigate('/dashboard');
    } catch (err) {
      setError(fieldError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth">
      <h2>Manager Login</h2>
      <p className="muted">Use your email and temporary code (first login) or your password.</p>
      <label className="input-group">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {!mustChange && (
        <label className="input-group">
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
      )}
      {mustChange && (
        <label className="input-group">
          <span>New password</span>
          <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
        </label>
      )}
      {error && <div className="error">{error}</div>}
      {!mustChange ? (
        <button className="primary" onClick={handleLogin} disabled={loading}>
          {loading ? 'Working…' : 'Log in'}
        </button>
      ) : (
        <>
          <label className="input-group">
            <span>Confirm password</span>
            <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
          </label>
          <button
            className="primary"
            onClick={handleChangePassword}
            disabled={loading || !newPass || newPass !== confirmPass}
          >
            {loading ? 'Saving…' : 'Save new password'}
          </button>
        </>
      )}
    </div>
  );
}
