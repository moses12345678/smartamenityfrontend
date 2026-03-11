import { Link } from 'react-router-dom';
import poolImage from '../assets/images/pool.png';
import gymImage from '../assets/images/gym.png';

const FeatureCard = ({ title, body, icon }) => (
  <div className="home-card feature-card">
    <div className="feature-icon">{icon}</div>
    <h4>{title}</h4>
    <p className="muted">{body}</p>
  </div>
);

const Step = ({ num, title, body }) => (
  <div className="home-step">
    <div className="step-num">{num}</div>
    <div>
      <h5>{title}</h5>
      <p className="muted">{body}</p>
    </div>
  </div>
);

const gallery = [
  { title: 'Pool check-in', src: poolImage },
  { title: 'Fitness center', src: gymImage }
];

export default function HomePage() {
  return (
    <div className="home">
      <section className="hero resident-hero">
        <div className="hero-copy">
          <span className="pill badge">For residents</span>
          <h1>Your building amenities, at a glance.</h1>
          <p className="muted">
            Check into the pool or gym in seconds. See capacity live, add guests, and head out without lines.
          </p>
          <div className="hero-actions">
            <Link className="primary cta" to="/invite">Open my invite</Link>
            <Link className="ghost-button" to="/login">Log in</Link>
          </div>
          <div className="hero-meta">
            <span>Live capacity • Guest passes • Quiet hours honored</span>
          </div>
        </div>
        <div className="hero-visual resident-visual">
          <div
            className="visual-card photo-card"
            style={{ backgroundImage: `url(${poolImage})` }}
          >
            <div className="photo-overlay">
              <p className="muted tiny">Live now</p>
              <h3>Pool</h3>
              <p className="muted">13 capacity · 9 inside</p>
              <div className="visual-badges">
                <span className="pill success">Open</span>
                <span className="pill warning">70% full</span>
              </div>
            </div>
          </div>
          <div
            className="visual-card photo-card"
            style={{ backgroundImage: `url(${gymImage})` }}
          >
            <div className="photo-overlay">
              <p className="muted tiny">Next up</p>
              <h3>Fitness center</h3>
              <p className="muted">Cap 20 · 6 inside</p>
              <div className="visual-badges">
                <span className="pill success">Open</span>
                <span className="pill muted">Plenty of space</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-grid">
        <FeatureCard title="Tap to check in" body="Arrive and tap once to log your spot—no kiosks or clipboards." icon="✅" />
        <FeatureCard title="See the crowd" body="Live fill bars show if the pool or gym is busy before you go." icon="📊" />
        <FeatureCard title="Bring a guest" body="Add guest counts when you check in so rules stay fair." icon="👥" />
        <FeatureCard title="Quiet hours respected" body="We’ll remind you when it’s time to wrap up." icon="🌙" />
      </section>

      <section className="home-steps">
        <div className="steps-header">
          <span className="pill badge">How it works</span>
          <h3>From invite to pool time</h3>
        </div>
        <div className="steps-grid">
          <Step num="01" title="Open your invite" body="Tap the link from your property email or scan the QR in the lobby." />
          <Step num="02" title="Log in once" body="Use your email + code to secure your account." />
          <Step num="03" title="Check in" body="Pick an amenity, add guests, and you’re set. Check out when you leave." />
        </div>
      </section>

      <section className="home-gallery">
        <div className="gallery-header">
          <span className="pill badge">See the vibe</span>
          <h3>Pool and gym—ready when you are.</h3>
        </div>
        <div className="gallery-grid">
          {gallery.map((item) => (
            <figure key={item.title} className="gallery-card">
              <img src={item.src} alt={item.title} loading="lazy" />
              <figcaption>{item.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div>
          <h3>Have an invite?</h3>
          <p className="muted">Open it here and start checking in today.</p>
        </div>
        <div className="cta-buttons">
          <Link className="primary cta" to="/invite">Enter invite</Link>
          <Link className="ghost-button" to="/login">Return to login</Link>
        </div>
      </section>

      <section className="home-footer">
        <p className="muted">
          © {new Date().getFullYear()} MEANC LLC · Software company ·{' '}
          <a href="https://meanc.net" target="_blank" rel="noreferrer">meanc.net</a>
        </p>
      </section>
    </div>
  );
}
