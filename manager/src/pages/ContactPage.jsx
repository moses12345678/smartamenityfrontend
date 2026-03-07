import { useState } from 'react';
import ContactModal from '../components/ContactModal.jsx';

export default function ContactPage() {
  const [open, setOpen] = useState(false);
  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  return (
    <>
      <div className="card">
        <h2>Contact MEANC • SmartAmenity</h2>
        <p className="muted">We respond within one business day.</p>
        <div className="contact-grid">
          <div>
            <h4>Sales & Demos</h4>
            <p className="muted">Book a walkthrough for your property team.</p>
            <button className="primary compact" type="button" onClick={openModal}>
              Talk to sales
            </button>
          </div>
          <div>
            <h4>Support</h4>
            <p className="muted">Questions about onboarding or resident invites.</p>
            <button className="ghost" type="button" onClick={openModal}>
              Open form
            </button>
          </div>
          <div>
            <h4>Partnerships</h4>
            <p className="muted">Integrations, channel, or co-marketing.</p>
            <button className="ghost" type="button" onClick={openModal}>
              Share details
            </button>
          </div>
        </div>
        <div className="contact-grid">
          <div>
            <h4>Headquarters</h4>
            <p className="muted">MEANC, 123 Market Street, Suite 500<br />Columbus, OH</p>
          </div>
          <div>
            <h4>Phone</h4>
            <p className="muted">+1 (555) 123-4400</p>
          </div>
          <div>
            <h4>Status</h4>
            <p className="muted">All systems normal</p>
          </div>
        </div>
      </div>
      <ContactModal open={open} onClose={closeModal} source="contact-page" />
    </>
  );
}
