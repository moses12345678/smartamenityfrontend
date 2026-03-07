import AuthForm from './AuthForm.jsx';

export default function AuthModal({ open, onClose, inviteToken, onComplete }) {

  return (
    <div
      className="modal-backdrop"
      style={{ display: open ? 'grid' : 'none' }}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-tabs">
          <button className="active">Login</button>
        </div>
        <AuthForm compact mode="login" inviteToken={inviteToken} onSuccess={onComplete} />
      </div>
    </div>
  );
}
