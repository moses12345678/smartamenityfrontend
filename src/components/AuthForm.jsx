import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, changePassword } from '../api/auth.js';
import { joinProperty } from '../api/properties.js';
import { fetchCurrentUser } from '../api/users.js';
import { useAuth } from '../context/AuthContext.jsx';

const MANAGER_APP_URL = import.meta.env.VITE_MANAGER_APP_URL || 'https://manager.smartamenity.net';
const isManagerRole = (user) => {
  const role = (user?.role || '').toUpperCase();
  return role === 'MANAGER' || role === 'ADMIN';
};

const fieldError = (error) => {
  if (!error) return 'Request failed. Please try again.';
  if (typeof error === 'string') return error;
  if (error.detail) return error.detail;
  if (Array.isArray(error)) return error[0];
  if (typeof error === 'object') {
    const firstKey = Object.keys(error)[0];
    const firstVal = error[firstKey];
    if (Array.isArray(firstVal)) return firstVal[0];
    if (typeof firstVal === 'string') return firstVal;
  }
  return 'Something went wrong.';
};

export default function AuthForm({ mode = 'login', inviteToken, onSuccess, compact = false }) {
  const navigate = useNavigate();
  const {
    pendingInvite,
    savePendingInvite,
    saveTokens,
    saveUser,
    saveJoinedProperty,
    logout
  } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [changeError, setChangeError] = useState('');
  const [changing, setChanging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const tokenForJoin = inviteToken || pendingInvite || '';

  const finishJoin = async (authResponse, currentUser) => {
    let joinedProperty = null;
    if (tokenForJoin) {
      try {
        const joinResponse = await joinProperty({
          invite_token: tokenForJoin
        });
        const property = joinResponse?.property || joinResponse;
        const resident = joinResponse?.resident || joinResponse?.resident_profile;
        joinedProperty = { ...property, resident };
        saveJoinedProperty(joinedProperty);
      } catch (joinErr) {
        const status = joinErr?.response?.status;
        const msg = fieldError(joinErr?.response?.data || joinErr?.message || '');
        const alreadyLinked = status === 400 && msg.toLowerCase().includes('already linked');
        if (alreadyLinked) {
          // Fetch the user profile to hydrate the resident/property and proceed.
          const me = currentUser || (await fetchCurrentUser().catch(() => null));
          const resident = me?.resident || me?.resident_profile;
          const property = resident?.property;
          if (property) {
            joinedProperty = { ...property, resident };
            saveJoinedProperty(joinedProperty);
          }
        } else {
          throw joinErr;
        }
      }
    }
    if (onSuccess) {
      onSuccess(joinedProperty, authResponse);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { email: form.email, password: form.password };
      const authResponse = await loginUser(payload);
      const { access, refresh, user } = authResponse;
      if (access) saveTokens(access, refresh);
      if (user) saveUser(user);

      // Managers should authenticate via the manager portal, not the resident app
      if (isManagerRole(user)) {
        logout();
        window.location.href = `${MANAGER_APP_URL}/login`;
        return;
      }

      // Persist invite token if present
      if (tokenForJoin) savePendingInvite(tokenForJoin);

      const me = await fetchCurrentUser().catch(() => null);
      if (me) saveUser(me);

      if (me?.must_change_password) {
        setMustChangePassword(true);
        setLoading(false);
        return;
      }

      await finishJoin(authResponse, me);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setError('Invite not found or expired.');
      } else {
        const apiError = err?.response?.data;
        setError(fieldError(apiError));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={`card auth-card ${compact ? 'compact' : ''}`} onSubmit={handleSubmit}>
      <div className="card-header auth-header">
        <span className="pill badge">Resident sign-in</span>
        <h3>Sign in to SmartAmenity</h3>
        <p className="muted">
          Check capacity, add guests, and jump into your building amenities without lines.
        </p>
      </div>
      <label className="input-group">
        <span>Email</span>
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />
      </label>
      {!mustChangePassword && (
        <>
          <label className="input-group">
            <span>Password</span>
            <input
              name="password"
              type="password"
              placeholder="Password (or first-time code)"
              value={form.password}
              onChange={handleChange}
            required
          />
        </label>
        {error && <div className="error-chip">{error}</div>}
          <div className="auth-actions">
            <button className="primary" type="submit" disabled={loading}>
              {loading ? 'Working…' : 'Log in'}
            </button>
          </div>
        </>
      )}

      {mustChangePassword && (
        <>
          <div className="info-chip" style={{ marginTop: 0 }}>
            Enter a new password to finish setting up your account.
          </div>
          <label className="input-group">
            <span>New password</span>
            <input
              name="new_password"
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              required
            />
          </label>
          <label className="input-group">
            <span>Confirm new password</span>
            <input
              name="confirm_password"
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
            />
          </label>
          {changeError && <div className="error-chip">{changeError}</div>}
          <button
            className="primary"
            type="button"
            disabled={changing || !newPass || newPass !== confirmPass}
            onClick={async () => {
              setChangeError('');
              setChanging(true);
              try {
                await changePassword({ old_password: form.password, new_password: newPass });
                setForm((prev) => ({ ...prev, password: newPass }));
                setMustChangePassword(false);
                setChanging(false);
                await finishJoin({}, await fetchCurrentUser().catch(() => null));
              } catch (err) {
                const msg = fieldError(err?.response?.data || err?.message || '');
                setChangeError(msg);
                setChanging(false);
              }
            }}
          >
            {changing ? 'Saving…' : 'Save new password'}
          </button>
        </>
      )}
    </form>
  );
}
