import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchInvite, joinProperty } from '../api/properties.js';
import AuthModal from '../components/AuthModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchCurrentUser } from '../api/users.js';
import {
  BuildingIcon,
  ClipboardIcon,
  DoorIcon,
  HomeIcon,
  PinIcon,
  ShieldIcon,
  SparklesIcon,
  UserPlusIcon
} from '../components/Icons.jsx';

export default function InvitePage() {
  const params = useParams();
  const token = params?.token;
  const navigate = useNavigate();
  const { tokens, savePendingInvite, saveJoinedProperty, logout } = useAuth();

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [unitNumber, setUnitNumber] = useState('');

  const extractError = (err) => {
    const data = err?.response?.data;
    if (typeof data === 'string') return data;
    if (data?.detail) return data.detail;
    if (Array.isArray(data)) return data[0];
    if (data && typeof data === 'object') {
      const firstKey = Object.keys(data)[0];
      const firstVal = data[firstKey];
      if (Array.isArray(firstVal)) return firstVal[0];
      if (typeof firstVal === 'string') return firstVal;
    }
    return err?.message || 'Could not join this property';
  };

  const cityLabel = (() => {
    const city = invite?.city;
    if (!city) return '';
    if (typeof city === 'string') return city;
    if (typeof city === 'object') {
      const name = city.name || city.city || '';
      const state =
        typeof city.state === 'string'
          ? city.state
          : city.state?.name || city.state?.code || city.state?.abbr || '';
      const country =
        typeof city.country === 'string'
          ? city.country
          : city.country?.name || city.country?.code || '';
      return [name, state || country].filter(Boolean).join(', ');
    }
    return '';
  })();

  useEffect(() => {
    if (!token) {
      setInvite(null);
      setError('No invite token found.');
      setLoading(false);
      savePendingInvite('');
      return;
    }
    savePendingInvite(token);
    const load = async () => {
      try {
        const data = await fetchInvite(token);
        setInvite(data);
        setError('');
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
          setError('Invite not found or expired.');
        } else if (err?.message === 'Network Error') {
          setError('Could not fetch invite (network/CORS).');
        } else {
          setError(err?.response?.data?.detail || 'Could not fetch invite.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, savePendingInvite]);

  const handleJoin = async () => {
    if (!tokens?.access) {
      setShowAuth(true);
      return;
    }
    if (!invite) return;
    setJoining(true);
    setError('');
    try {
      const joined = await joinProperty({
        invite_token: token,
        unit_number: unitNumber
      });
      const property = joined?.property || joined;
      const resident = joined?.resident || joined?.resident_profile;
      saveJoinedProperty({ ...property, resident });
      savePendingInvite(token);
      navigate('/dashboard');
    } catch (err) {
      const status = err?.response?.status;
      const msg = extractError(err);
      const alreadyLinked = status === 400 && msg?.toLowerCase().includes('already linked');
      if (alreadyLinked) {
        // Treat as success: hydrate current user and proceed.
        const me = await fetchCurrentUser().catch(() => null);
        const resident = me?.resident || me?.resident_profile;
        const property = resident?.property || invite;
        if (property) {
          saveJoinedProperty({ ...property, resident });
        }
        savePendingInvite(token);
        navigate('/dashboard');
        return;
      }
      if (status === 404) {
        setError('Invite not found or expired.');
      } else {
        setError(msg);
      }
    } finally {
      setJoining(false);
    }
  };

  const handleSwitchAccount = () => {
    logout();
    setError('');
    // Send the user to the login screen with the invite preserved in the URL.
    const suffix = token ? `?invite=${token}` : '';
    navigate(`/login${suffix}`);
  };

  const linkedError = error?.toLowerCase().includes('already linked');

  // Auto-dismiss invite errors after a short delay
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 4500);
    return () => clearTimeout(t);
  }, [error]);

  if (loading) {
    return (
      <div className="center-stack">
        <div className="skeleton" />
        <p className="muted">Fetching invite…</p>
      </div>
    );
  }

  const steps = [
    {
      icon: SparklesIcon,
      title: 'Review the property',
      copy: 'Confirm the building name and location match your invite.'
    },
    {
      icon: ClipboardIcon,
      title: 'Add your unit (optional)',
      copy: 'Helps staff route amenity requests faster.'
    },
    {
      icon: ShieldIcon,
      title: 'Join securely',
      copy: 'This one-time link keeps your access private.'
    }
  ];

  return (
    <div className="invite-page">
      <div className="card invite-hero">
        <div className="icon-chip">
          <BuildingIcon />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">SmartAmenity invite</p>
          <h2>{invite ? `Join ${invite.name}` : 'Smart Property invite'}</h2>
          <p className="muted">
            Step into a smoother amenity experience—confirm the details and join with one click.
          </p>
          <div className="hero-tags">
            <span className="tag">
              <PinIcon /> {cityLabel || 'City coming soon'}
            </span>
            <span className="tag success">
              <ShieldIcon /> Secure, one-time link
            </span>
            {invite?.total_units !== undefined && (
              <span className="tag subtle">
                <HomeIcon /> {invite.total_units} total units
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="invite-grid">
        <div className="card info-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Property at a glance</p>
              <h3>{invite?.name || 'Awaiting property name'}</h3>
            </div>
            <div className="icon-chip muted-bg small">
              <SparklesIcon />
            </div>
          </div>
          {invite && (
            <div className="stat-tiles">
              <div className="stat-tile">
                <div className="tile-icon primary">
                  <HomeIcon />
                </div>
                <div>
                  <p className="muted">Property</p>
                  <strong>{invite.name}</strong>
                </div>
              </div>
              <div className="stat-tile">
                <div className="tile-icon amber">
                  <PinIcon />
                </div>
                <div>
                  <p className="muted">City</p>
                  <strong>{cityLabel || 'Not provided'}</strong>
                </div>
              </div>
              <div className="stat-tile">
                <div className="tile-icon teal">
                  <ClipboardIcon />
                </div>
                <div>
                  <p className="muted">Total units</p>
                  <strong>{invite.total_units ?? '—'}</strong>
                </div>
              </div>
            </div>
          )}

          <div className="step-list">
            {steps.map((step) => (
              <div className="step" key={step.title}>
                <div className="icon-chip subtle-bg small">
                  <step.icon />
                </div>
                <div>
                  <p className="step-title">{step.title}</p>
                  <p className="muted">{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card action-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Ready to join?</p>
              <h3>Connect to your building</h3>
            </div>
            <div className="icon-chip primary-bg small">
              <DoorIcon />
            </div>
          </div>

          {invite && (
            <label className="input-group decorated">
              <span>Unit number (optional)</span>
              <div className="input-shell">
                <span className="field-icon">
                  <HomeIcon />
                </span>
                <input
                  type="text"
                  placeholder="e.g., 5B"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                />
              </div>
            </label>
          )}

          {error && <div className="error-chip">{error}</div>}

          <div className="actions">
            <button
              className="primary with-icon"
              onClick={handleJoin}
              disabled={joining || !invite || !!error}
            >
              <DoorIcon /> {joining ? 'Joining…' : 'Join property'}
            </button>
            {!tokens?.access && invite && (
              <button className="ghost with-icon" onClick={() => setShowAuth(true)}>
                <UserPlusIcon /> Log in to join
              </button>
            )}
            {linkedError && (
              <button className="ghost with-icon" onClick={handleSwitchAccount}>
                <UserPlusIcon /> Use another account
              </button>
            )}
          </div>

          <div className="helper-note">
            <ShieldIcon />
            <div>
              <p className="step-title">Your invite stays private</p>
              <p className="muted">We only share your details with verified property staff.</p>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        open={showAuth}
        inviteToken={token}
        onClose={() => setShowAuth(false)}
        onComplete={() => navigate('/dashboard')}
      />
    </div>
  );
}
