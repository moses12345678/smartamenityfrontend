import { Link } from 'react-router-dom';
import { HomeIcon, ShieldIcon } from '../components/Icons.jsx';

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

export default function HomePage() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <span className="pill badge">A MEANC service</span>
          <h1>SmartAmenity for modern properties</h1>
          <p className="muted">
            Give residents a smooth way to book, check in, and respect capacity limits—while your team keeps full control
            from the manager dashboard.
          </p>
          <div className="hero-actions">
            <a className="primary cta" href="http://localhost:4000/login">
              Create property account
            </a>
            <a className="ghost-button" href="mailto:hello@meanc.com">
              Talk to sales
            </a>
          </div>
          <div className="hero-meta">
            <div>
              <ShieldIcon className="meta-icon" />
              <span>Roles & permissions for staff</span>
            </div>
            <div>
              <HomeIcon className="meta-icon" />
              <span>Built for apartments, condos, clubs</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-card">
            <p className="muted tiny">Live snapshot</p>
            <h3>Pool</h3>
            <div className="visual-metrics">
              <div><strong>13</strong><span className="muted tiny"> capacity</span></div>
              <div><strong>9</strong><span className="muted tiny"> checked-in</span></div>
              <div><strong>5</strong><span className="muted tiny"> guests</span></div>
            </div>
            <div className="visual-bar">
              <div className="visual-fill" style={{ width: '70%' }} />
            </div>
            <div className="visual-badges">
              <span className="pill success">Open</span>
              <span className="pill warning">70% full</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-grid">
        <FeatureCard
          title="Property-first onboarding"
          body="Your business is with the property, not the tenant. Sign up once, then invite residents with secure tokens."
          icon="🏢"
        />
        <FeatureCard
          title="Capacity confidence"
          body="Live utilization, guest limits, and automatic reminders keep amenities fair and compliant."
          icon="📈"
        />
        <FeatureCard
          title="Zero friction for residents"
          body="Residents open the invite link, join, and start checking in—no training or long forms needed."
          icon="✨"
        />
      </section>

      <section className="home-steps">
        <div className="steps-header">
          <span className="pill badge">How it works</span>
          <h3>Launch in three steps</h3>
        </div>
        <div className="steps-grid">
          <Step
            num="01"
            title="Create your property"
            body="Sign in on the manager dashboard and add your amenities with hours and guest rules."
          />
          <Step
            num="02"
            title="Invite residents"
            body="Share the auto-generated invite link or token. Residents join instantly—no admin help needed."
          />
          <Step
            num="03"
            title="Stay in control"
            body="See live check-ins, utilization, and confidence. Disable amenities or adjust limits any time."
          />
        </div>
      </section>

      <section className="home-cta">
        <div>
          <h3>Ready to move amenities into the future?</h3>
          <p className="muted">Create your property account or book a quick call with MEANC.</p>
        </div>
        <div className="cta-buttons">
          <a className="primary cta" href="http://localhost:4000/login">
            Join here
          </a>
          <a className="ghost-button" href="mailto:hello@meanc.com">
            Book a call
          </a>
        </div>
      </section>
    </div>
  );
}
