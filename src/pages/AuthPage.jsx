import { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import poolBackground from '../assets/images/pool-backgrouund.jpg';

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const inviteToken = params.get('invite') || '';
  const { savePendingInvite } = useAuth();

  useEffect(() => {
    if (inviteToken) savePendingInvite(inviteToken);
  }, [inviteToken, savePendingInvite]);

  return (
    <div
      className="auth-page"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.60), rgba(15,23,42,0.60)), url(${poolBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="auth-topbar">
        <Link to="/" className="logo" aria-label="SmartAmenity home">
          <span className="logo-mark">SA</span>
          <span className="logo-text">SmartAmenity</span>
        </Link>
        <Link className="ghost-button ghost-light" to="/">
          ← Back to home
        </Link>
      </div>

      <div className="auth-shell">
        <div className="card wide glass-card">
          <div className="card-header">
            <p className="eyebrow">SmartAmenity</p>
            <h2>Log in</h2>
            <p className="muted">Access amenities with your invite.</p>
          </div>
          <AuthForm
            mode="login"
            inviteToken={inviteToken}
            onSuccess={() => navigate('/dashboard')}
          />
          <div className="switcher muted">Don’t have an account? Ask property staff to invite you.</div>
        </div>
      </div>
    </div>
  );
}
