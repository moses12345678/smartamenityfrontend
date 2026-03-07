export default function PrivacyPage() {
  return (
    <div className="card">
      <h2>Privacy & Data Protection</h2>
      <p className="muted">SmartAmenity by MEANC respects resident privacy and complies with common data standards.</p>
      <ul className="plain-list">
        <li>We collect only necessary data to operate property access and amenity utilization.</li>
        <li>Resident sessions are retained for operational history; delete requests can be submitted via support.</li>
        <li>Passwords are hashed; access tokens expire; sensitive data uses TLS in transit.</li>
        <li>Data is not sold or shared with third parties beyond sub-processors required to deliver the service.</li>
      </ul>
      <p className="muted">Questions? <a href="mailto:privacy@meanc.com">privacy@meanc.com</a></p>
    </div>
  );
}
