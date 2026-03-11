import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnalyticsIllustration } from '../components/Illustrations.jsx';
import ContactModal from '../components/ContactModal.jsx';

const gallery = [
  {
    title: 'Resort-style pool',
    src: '/pool.png'
  },
  {
    title: 'Strength & cardio',
    src: '/gym.png'
  },
  {
    title: 'Cabana lounges',
    src: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80'
  }
];

const features = [
  {
    title: 'Property-first onboarding',
    copy: 'Spin up properties, map amenities, and issue resident invites in minutes — no generic portals.',
    tag: 'Launch fast',
    icon: '🧭'
  },
  {
    title: 'Live utilization',
    copy: 'See check-ins, guest counts, and rule enforcement with a 9-second refresh cadence.',
    tag: 'Live signal',
    icon: '📡'
  },
  {
    title: 'Rules that stick',
    copy: 'Quiet hours, guest ratios, per-amenity hours, and instant disable toggles stay enforced across devices.',
    tag: 'Guardrails',
    icon: '🛡️'
  },
  {
    title: 'Operator confidence',
    copy: 'Audit trails, access tokens, and secure invite links keep managers in control.',
    tag: 'Trust built-in',
    icon: '✅'
  }
];

const steps = [
  {
    title: 'Invite residents once',
    detail: 'Share an invite link or QR, residents self-verify, and you stay in control of who gets access.'
  },
  {
    title: 'Tune guardrails per amenity',
    detail: 'Capacity, guest caps, operating hours, and exceptions are all adjustable in seconds — and instantly enforced.',
    highlight: 'Rules remembered'
  },
  {
    title: 'Watch utilization live',
    detail: 'Live cards flag overages before they become complaints, with quick disable/enable controls.',
    highlight: '9s refresh'
  }
];

export default function HomePage() {
  const barHeights = [52, 86, 64, 78, 58];
  const barLabels = ['8a', '10a', '12p', '2p', '4p'];
  const year = new Date().getFullYear();
  const [contactOpen, setContactOpen] = useState(false);

  const openContact = (e) => {
    if (e?.preventDefault) e.preventDefault();
    setContactOpen(true);
  };

  return (
    <div className="home-landing">
      <section className="home-hero hero-aurora">
        <div className="hero-left">
          <div className="pill-row">
            <span className="pill badge">MEANC • SmartAmenity</span>
            <span className="pill outline">Built for operators</span>
          </div>
          <h1>Run every amenity like your signature experience.</h1>
          <p className="muted lead">
            SmartAmenity keeps pools, gyms, courts, and lounges governed with live utilization, fairness rules, and
            resident-friendly invites — no generic portals or spreadsheets.
          </p>
          <div className="hero-actions">
            <Link className="primary primary-lg" to="/login">
              Launch manager
            </Link>
            <button className="ghost ghost-contrast" type="button" onClick={openContact}>
              Book a live walkthrough
            </button>
          </div>
          <div className="hero-meta">
            <span className="pill soft">SSO ready</span>
            <span className="pill soft">SOC2 in progress</span>
            <span className="pill soft">9s live refresh</span>
          </div>
          <div className="hero-kpi">
            <div className="kpi-card">
              <p className="muted tiny">On-time openings</p>
              <strong>99.98%</strong>
              <span className="muted tiny">Rolling 90 days</span>
            </div>
            <div className="kpi-card">
              <p className="muted tiny">Guest fairness</p>
              <strong>+34%</strong>
              <span className="muted tiny">More balanced usage</span>
            </div>
            <div className="kpi-card">
              <p className="muted tiny">Invites sent</p>
              <strong>12,480</strong>
              <span className="muted tiny">This quarter</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-orb" />
          <div className="hero-panel glass-card">
            <div className="panel-top">
              <div>
                <p className="eyebrow">Live snapshot</p>
                <strong>Rooftop pool</strong>
                <p className="muted tiny">Guest rules auto-enforced</p>
              </div>
              <span className="status-chip on">Open</span>
            </div>

            <div className="mini-bars">
              {barHeights.map((h, idx) => (
                <div key={barLabels[idx]} className="bar-col">
                  <div className="bar" style={{ height: `${h}px` }} />
                  <span className="muted tiny">{barLabels[idx]}</span>
                </div>
              ))}
            </div>

            <div className="panel-row">
              <div className="mini-stat">
                <p className="muted tiny">Checked in</p>
                <strong>22</strong>
                <span className="muted tiny">of 60 capacity</span>
              </div>
              <div className="mini-stat">
                <p className="muted tiny">Guest ratio</p>
                <strong>1.3</strong>
                <span className="muted tiny">per resident</span>
              </div>
              <div className="mini-stat">
                <p className="muted tiny">Next block</p>
                <strong>5:30p</strong>
                <span className="muted tiny">Courts reset</span>
              </div>
            </div>

            <div className="panel-tags">
              <span className="pill soft tiny-pill">Invite link ready</span>
              <span className="pill soft tiny-pill">Auto-close after 10p</span>
              <span className="pill soft tiny-pill">Noise-safe hours</span>
            </div>
          </div>

          <div className="floating-card glass-card">
            <div className="floating-row">
              <div>
                <p className="muted tiny">Invites waiting</p>
                <strong>42</strong>
                <span className="muted tiny">Residents open in 2 clicks</span>
              </div>
              <span className="pill soft tiny-pill">Share link</span>
            </div>
            <div className="floating-progress">
              <div className="floating-fill" style={{ width: '68%' }} />
            </div>
            <p className="muted tiny">Most properties launch end-to-end within 48 hours.</p>
          </div>
        </div>
      </section>

      <section className="feature-rail">
        <div className="rail-header">
          <div>
            <span className="pill badge">Confidence toolkit</span>
            <h3>Everything managers need, nothing residents feel.</h3>
          </div>
          <p className="muted">Clear guardrails, tasteful invites, and live signals so amenities stay fair.</p>
        </div>
        <div className="feature-grid">
          {features.map((item) => (
            <div key={item.title} className="feature-card">
              <div className="feature-icon">{item.icon}</div>
              <div className="feature-body">
                <div className="pill soft tiny-pill">{item.tag}</div>
                <h4>{item.title}</h4>
                <p className="muted">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-gallery wide">
        <div className="steps-header">
          <span className="pill badge">Amenity showcase</span>
          <h3>Residents see a branded, simple check-in.</h3>
        </div>
        <div className="gallery-grid lavish">
          {gallery.map((item) => (
            <figure key={item.title} className="gallery-card">
              <img src={item.src} alt={item.title} loading="lazy" />
              <figcaption>{item.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="flow-track">
        <div className="rail-header">
          <div>
            <span className="pill badge">Playbook</span>
            <h3>From invite to live guardrails in three steps.</h3>
          </div>
          <AnalyticsIllustration width={240} height={140} />
        </div>
        <div className="flow-grid">
          {steps.map((step, idx) => (
            <div key={step.title} className="flow-card">
              <div className="flow-index">0{idx + 1}</div>
              <div>
                <h4>{step.title}</h4>
                <p className="muted">{step.detail}</p>
                {step.highlight && <span className="pill soft tiny-pill">{step.highlight}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-ribbon">
        <div>
          <p className="eyebrow">Ready this week</p>
          <h3>Let us stand up your first property and hand you the keys.</h3>
          <p className="muted">We onboard with you, then your team owns it. No hardware swaps required.</p>
        </div>
        <div className="cta-actions">
          <Link className="primary primary-lg" to="/login">
            Launch manager
          </Link>
          <button className="ghost ghost-contrast" type="button" onClick={openContact}>
            Book a call
          </button>
        </div>
      </section>

      <footer className="home-footer fine-print">
        <div>
          © {year} MEANC LLC · Software company · SmartAmenity
        </div>
        <div className="footer-links">
          <button className="link-button" type="button" onClick={openContact}>
            Contact
          </button>
          <a href="/privacy">Privacy</a>
          <a href="/careers">Careers</a>
        </div>
      </footer>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} source="home" />
    </div>
  );
}
