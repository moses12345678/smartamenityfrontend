import { useEffect, useState } from 'react';
import { sendContact } from '../api/contact.js';

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  message: ''
};

export default function ContactModal({ open, onClose, source = 'home' }) {
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setError('');
      setDone('');
      setBusy(false);
    }
  }, [open]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    const required = ['first_name', 'last_name', 'email', 'message'];
    const missing = required.filter((k) => !form[k].trim());
    if (missing.length) {
      setError('Please fill first name, last name, email, and your message.');
      return;
    }
    setError('');
    setDone('');
    setBusy(true);
    try {
      await sendContact({ ...form, source });
      setDone('Thank you—message received. We typically respond within 2 business hours.');
      setForm(initialForm);
    } catch (err) {
      const payload = err?.response?.data;
      if (payload) {
        if (typeof payload === 'string') {
          setError(payload);
        } else if (Array.isArray(payload) && payload.length) {
          setError(String(payload[0]));
        } else if (typeof payload === 'object') {
          const key = Object.keys(payload)[0];
          const msg = Array.isArray(payload[key]) ? payload[key][0] : payload[key];
          setError(`${key}: ${msg}`);
        } else {
          setError('Could not send right now. Please try again.');
        }
      } else {
        setError('Could not send right now. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={() => !busy && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Talk to sales</p>
            <h4>Tell us about your property</h4>
            <p className="muted tiny">We reply fast — usually within 2 business hours.</p>
          </div>
          <button className="ghost" onClick={onClose} disabled={busy}>
            Close
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {done && <div className="success">{done}</div>}

        <div className="input-grid">
          <input
            placeholder="First name"
            value={form.first_name}
            required
            onChange={(e) => update('first_name', e.target.value)}
          />
          <input
            placeholder="Last name"
            value={form.last_name}
            required
            onChange={(e) => update('last_name', e.target.value)}
          />
          <input
            placeholder="Work email"
            type="email"
            value={form.email}
            required
            onChange={(e) => update('email', e.target.value)}
          />
          <input
            placeholder="Mobile or desk phone"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </div>

        <textarea
          placeholder="What amenities are you managing and what outcome do you need?"
          value={form.message}
          required
          onChange={(e) => update('message', e.target.value)}
        />

        <div className="modal-actions">
          <button className="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Sending…' : 'Send message'}
          </button>
        </div>
      </div>
    </div>
  );
}
