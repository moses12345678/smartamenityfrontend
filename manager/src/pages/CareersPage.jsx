const roles = [
  { title: 'Customer Success Manager', location: 'Remote (US)', type: 'Full-time' },
  { title: 'Frontend Engineer', location: 'Remote / Columbus, OH', type: 'Full-time' },
  { title: 'Partnerships Lead', location: 'Remote (US)', type: 'Full-time' }
];

export default function CareersPage() {
  return (
    <div className="card">
      <h2>Careers at MEANC • SmartAmenity</h2>
      <p className="muted">Join us to modernize property amenity access.</p>
      <div className="careers-grid">
        {roles.map((r) => (
          <div key={r.title} className="career-card">
            <h4>{r.title}</h4>
            <p className="muted">{r.location}</p>
            <span className="pill">{r.type}</span>
          </div>
        ))}
      </div>
      <p className="muted">Don’t see a fit? Email <a href="mailto:careers@meanc.com">careers@meanc.com</a></p>
    </div>
  );
}
