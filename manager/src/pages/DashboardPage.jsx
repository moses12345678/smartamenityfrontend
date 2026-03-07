import { useEffect, useMemo, useState } from 'react';
import {
  listProperties,
  listResidents,
  listAmenities,
  createResident,
  updateAmenity,
  updateResident
} from '../api/manager.js';
import { useAuth } from '../context/AuthContext.jsx';

const amenityIcons = {
  POOL: '🏊‍♂️',
  GYM: '🏋️',
  OFFICE: '💼',
  TENNIS: '🎾'
};

const STATE_TZ_LABEL = {
  AL: 'CST', AK: 'AKST', AZ: 'MST', AR: 'CST', CA: 'PST', CO: 'MST', CT: 'EST', DE: 'EST', FL: 'EST',
  GA: 'EST', HI: 'HST', IA: 'CST', ID: 'MST', IL: 'CST', IN: 'EST', KS: 'CST', KY: 'EST', LA: 'CST',
  MA: 'EST', MD: 'EST', ME: 'EST', MI: 'EST', MN: 'CST', MO: 'CST', MS: 'CST', MT: 'MST', NC: 'EST',
  ND: 'CST', NE: 'CST', NH: 'EST', NJ: 'EST', NM: 'MST', NV: 'PST', NY: 'EST', OH: 'EST', OK: 'CST',
  OR: 'PST', PA: 'EST', RI: 'EST', SC: 'EST', SD: 'CST', TN: 'CST', TX: 'CST', UT: 'MST', VA: 'EST',
  VT: 'EST', WA: 'PST', WI: 'CST', WV: 'EST', WY: 'MST', DC: 'EST'
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState([]);
  const [residents, setResidents] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [newTenant, setNewTenant] = useState({ email: '', first_name: '', last_name: '', unit_number: '' });
  const [residentBusy, setResidentBusy] = useState({ id: null, action: null });
  const [residentMessages, setResidentMessages] = useState({});
  const [createBusy, setCreateBusy] = useState(false);
  const [createMessage, setCreateMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('amenities');
  const [search, setSearch] = useState('');
  const [expandedResident, setExpandedResident] = useState(null);
  const [savingAmenityId, setSavingAmenityId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [props, res, ams] = await Promise.all([listProperties(), listResidents(), listAmenities()]);
        setProperties(Array.isArray(props) ? props : []);
        setResidents(Array.isArray(res) ? res : []);
        setAmenities(Array.isArray(ams) ? ams : []);
      } catch (err) {
        setError('Could not load manager data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredResidents = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return residents;
    return residents.filter((r) => {
      return (
        (r.email || '').toLowerCase().includes(q) ||
        [r.first_name, r.last_name].join(' ').toLowerCase().includes(q) ||
        (r.unit_number || '').toLowerCase().includes(q) ||
        (r.address_line1 || '').toLowerCase().includes(q)
      );
    });
  }, [residents, search]);

  const property = properties[0];
  const tzLabel = property?.city?.state?.code ? STATE_TZ_LABEL[property.city.state.code.toUpperCase()] || 'Local' : 'Local';

  const activeAmenities = useMemo(() => amenities.filter((a) => a.is_active).length, [amenities]);
  const openAmenities = useMemo(() => amenities.filter((a) => a.is_active && a.is_open_now).length, [amenities]);
  const averageUtilization = useMemo(() => {
    const withCapacity = amenities.filter(
      (a) => Number.isFinite(a.utilization) || (Number.isFinite(a.capacity) && a.capacity > 0)
    );
    if (!withCapacity.length) return 0;
    const sum = withCapacity.reduce((acc, a) => {
      const util = Number.isFinite(a.utilization)
        ? a.utilization
        : ((a.current ?? 0) / (a.capacity || 1)) * 100;
      return acc + Math.min(100, Math.max(0, Math.round(util)));
    }, 0);
    return Math.round(sum / withCapacity.length);
  }, [amenities]);

  const featuredAmenity = useMemo(
    () => amenities.find((a) => a.is_active && a.is_open_now) || amenities[0],
    [amenities]
  );

  const featuredUtilization = useMemo(() => {
    if (!featuredAmenity) return 0;
    if (Number.isFinite(featuredAmenity.utilization)) return Math.min(100, Math.round(featuredAmenity.utilization));
    if (featuredAmenity.capacity) {
      return Math.min(100, Math.round(((featuredAmenity.current ?? 0) / featuredAmenity.capacity) * 100));
    }
    return 0;
  }, [featuredAmenity]);

  const snapshotBars = useMemo(() => {
    const base = featuredUtilization || 40;
    const pattern = [0.55, 0.72, 0.64, 0.82, 0.6];
    return pattern.map((scale) => Math.min(100, Math.max(18, Math.round(base * scale))));
  }, [featuredUtilization]);

  const snapshotLabels = ['8a', '10a', '12p', '2p', '4p'];

  const handleAmenityChange = (id, key, value) => {
    setAmenities((prev) => prev.map((x) => (x.id === id ? { ...x, [key]: value } : x)));
  };

  return (
    <div className="dash-grid">
      {error && <div className="error">{error}</div>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && !property && <p className="muted">No property assigned.</p>}

      {!loading && property && (
        <>
          <section className="dash-hero card hero-aurora">
            <div className="hero-shell">
              <div className="hero-copy">
                <div className="pill-row">
                  <span className="pill badge">{property.name || 'Amenity portfolio'}</span>
                  <span className="pill outline">{tzLabel} local</span>
                  {property.city?.name && (
                    <span className="pill soft">
                      {property.city.name}
                      {property.city.state?.code ? `, ${property.city.state.code}` : ''}
                    </span>
                  )}
                </div>
                <h1>Run every amenity like your signature experience.</h1>
                <p className="lead">
                  SmartAmenity keeps pools, gyms, courts, and lounges governed with live utilization, fairness rules, and
                  resident-friendly invites — no generic portals or spreadsheets.
                </p>
                <div className="hero-actions">
                  <button className="primary primary-lg">Launch manager</button>
                  <button className="ghost ghost-contrast">Book a live walkthrough</button>
                </div>
                <div className="hero-meta">
                  <span className="pill soft tiny-pill">SSO ready</span>
                  <span className="pill soft tiny-pill">SOC2 in progress</span>
                  <span className="pill soft tiny-pill">9s live refresh</span>
                  <span className="pill soft tiny-pill">Operators first</span>
                </div>
                <div className="hero-kpi">
                  <div className="kpi-card">
                    <p className="muted tiny">Active amenities</p>
                    <strong>{activeAmenities}</strong>
                  </div>
                  <div className="kpi-card">
                    <p className="muted tiny">Open right now</p>
                    <strong>{openAmenities}</strong>
                  </div>
                  <div className="kpi-card">
                    <p className="muted tiny">Avg utilization</p>
                    <strong>{averageUtilization}%</strong>
                  </div>
                  <div className="kpi-card">
                    <p className="muted tiny">Residents</p>
                    <strong>{residents.length}</strong>
                  </div>
                </div>
                <div className="hero-invite">
                  {property.address && <p className="muted fine-print">{property.address}</p>}
                  <div className="invite-stack">
                    {property.invite_link && (
                      // normalize local backend invite links to the public domain for display/copy
                      (() => {
                        const link = property.invite_link.replace('http://localhost:3000', 'https://smartamenity.net');
                        return (
                      <div className="invite-row">
                        <span className="muted">Invite link</span>
                        <code className="invite-code">{link}</code>
                        <button className="ghost tiny" onClick={() => navigator.clipboard.writeText(link)}>
                          Copy
                        </button>
                      </div>
                        );
                      })()
                    )}
                    {property.invite_token && (
                      <div className="invite-row">
                        <span className="muted">Invite token</span>
                        <code className="invite-code">{property.invite_token}</code>
                        <button className="ghost tiny" onClick={() => navigator.clipboard.writeText(property.invite_token)}>
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="snapshot-card glass-card">
                <div className="panel-top">
                  <div>
                    <p className="eyebrow">Live snapshot</p>
                    <h4>{featuredAmenity?.name || 'Amenity'}</h4>
                    <p className="muted tiny">Guest rules auto-enforced</p>
                  </div>
                  <span className={`status-chip ${featuredAmenity?.is_open_now ? 'on' : 'off'}`}>
                    {featuredAmenity?.is_open_now ? 'Open' : 'Closed'}
                  </span>
                </div>

                <div className="mini-bars">
                  {snapshotBars.map((height, idx) => (
                    <div className="bar-col" key={idx}>
                      <div className="bar" style={{ height: `${height}%` }} />
                      <span className="muted tiny">{snapshotLabels[idx]}</span>
                    </div>
                  ))}
                </div>

                <div className="snapshot-grid">
                  <div className="snapshot-tile">
                    <p className="muted tiny">Checked in</p>
                    <strong>
                      {featuredAmenity?.current ?? 0} / {featuredAmenity?.capacity ?? '—'}
                    </strong>
                  </div>
                  <div className="snapshot-tile">
                    <p className="muted tiny">Guest ratio</p>
                    <strong>{featuredAmenity?.max_guests_per_resident ?? '—'} per resident</strong>
                  </div>
                  <div className="snapshot-tile">
                    <p className="muted tiny">Next block reset</p>
                    <strong>{featuredAmenity?.close_time || '—'}</strong>
                  </div>
                </div>

                <div className="panel-tags">
                  <button className="ghost tiny">Invite link ready</button>
                  <button className="ghost tiny">Auto-close after quiet hours</button>
                  <button className="ghost tiny">Noise-safe hours</button>
                </div>

                <div className="floating-card snapshot-footer">
                  <div className="floating-row">
                    <div>
                      <p className="muted tiny">Utilization</p>
                      <strong>{featuredUtilization}%</strong>
                    </div>
                    <div className="floating-progress">
                      <div className="floating-fill" style={{ width: `${featuredUtilization}%` }} />
                    </div>
                  </div>
                  <div className="floating-row">
                    <div>
                      <p className="muted tiny">Invites waiting</p>
                      <strong>{property.pending_invites ?? residents.filter((r) => !r.is_active).length}</strong>
                      <p className="muted tiny">Most properties launch end-to-end within 48 hours.</p>
                    </div>
                    <button className="ghost tiny">Share link</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="tabs">
            <button className={activeTab === 'amenities' ? 'tab active' : 'tab'} onClick={() => setActiveTab('amenities')}>
              Amenities
            </button>
            <button className={activeTab === 'tenants' ? 'tab active' : 'tab'} onClick={() => setActiveTab('tenants')}>
              Tenants
            </button>
          </div>

          {activeTab === 'amenities' && (
            <div className="card">
              <div className="row-space">
                <h3>Amenities</h3>
                <p className="muted">Live utilization & quick edits</p>
              </div>
              <div className="prop-list">
                {amenities.map((a) => {
                  const utilization = Number.isFinite(a.utilization)
                    ? Math.min(100, Math.round(a.utilization))
                    : a.capacity
                    ? Math.min(100, Math.round(((a.current ?? 0) / a.capacity) * 100))
                    : 0;
                  const level = utilization >= 80 ? 'danger' : utilization >= 50 ? 'warn' : 'safe';
                  const icon = amenityIcons[a.type] || '🏠';
                  const status = !a.is_active
                    ? { text: 'Disabled', cls: 'off' }
                    : a.is_open_now
                    ? { text: 'Open now', cls: 'on' }
                    : { text: 'Closed', cls: 'off' };
                  return (
                    <div key={a.id} className="prop-tile amenity-edit rich">
                      <div className="amenity-head">
                        <div className="pill">
                          <span className="icon">{icon}</span>
                          <div>
                            <strong>{a.name}</strong>
                            <p className="muted">{a.type}</p>
                          </div>
                        </div>
                        <div className={`status-dot ${status.cls}`}>
                          {status.text}
                        </div>
                      </div>

                      <div className="util-row">
                        <div className="capacity-strip">
                          <div className="strip-header">
                            <div>
                              <p className="muted tiny">Capacity</p>
                              <strong>{a.current ?? 0}</strong>
                              <span className="muted"> / {a.capacity ?? '—'}</span>
                            </div>
                            <span className={`util-chip ${level}`}>{utilization || 0}%</span>
                          </div>
                          <div className="strip-bar">
                            <div
                              className={`strip-fill ${level}`}
                              style={{ width: `${utilization}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="amenity-fields">
                        <label className="stack-label time-with-tz">
                          <span>Open</span>
                          <input
                            type="time"
                            value={a.open_time}
                            onChange={(e) => handleAmenityChange(a.id, 'open_time', e.target.value)}
                          />
                          <span className="tz-inline">{tzLabel}</span>
                        </label>
                        <label className="stack-label time-with-tz">
                          <span>Close</span>
                          <input
                            type="time"
                            value={a.close_time}
                            onChange={(e) => handleAmenityChange(a.id, 'close_time', e.target.value)}
                          />
                          <span className="tz-inline">{tzLabel}</span>
                        </label>
                        <label className="stack-label">
                          <span>Capacity</span>
                          <input
                            type="number"
                            value={a.capacity}
                            onChange={(e) => handleAmenityChange(a.id, 'capacity', Number(e.target.value))}
                          />
                        </label>
                        <label className="stack-label">
                          <span>Max guests / resident</span>
                          <input
                            type="number"
                            value={a.max_guests_per_resident ?? ''}
                            onChange={(e) =>
                              handleAmenityChange(a.id, 'max_guests_per_resident', Number(e.target.value || 0))
                            }
                          />
                        </label>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={a.is_active}
                            onChange={(e) =>
                              setAmenities((prev) =>
                                prev.map((x) => (x.id === a.id ? { ...x, is_active: e.target.checked } : x))
                              )
                            }
                          />
                          Enabled
                        </label>
                        <button
                          className={savingAmenityId === a.id ? 'primary' : 'primary'}
                          onClick={async () => {
                            setSavingAmenityId(a.id);
                            try {
                              const updated = await updateAmenity(a.id, {
                                open_time: a.open_time,
                                close_time: a.close_time,
                                capacity: a.capacity,
                                max_guests_per_resident: a.max_guests_per_resident,
                                is_active: a.is_active
                              });
                              setAmenities((prev) => prev.map((x) => (x.id === a.id ? { ...x, ...updated } : x)));
                            } catch (err) {
                              setError('Failed to update amenity');
                            } finally {
                              setSavingAmenityId(null);
                            }
                          }}
                          disabled={savingAmenityId === a.id}
                        >
                          {savingAmenityId === a.id ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'tenants' && (
            <div className="card">
              <div className="row-space">
                <h3>Tenants</h3>
                <div className="row-space">
                  <input
                    className="search"
                    placeholder="Search by email, name, unit, or address"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="primary compact" onClick={() => setShowCreateModal(true)}>
                    Add tenant
                  </button>
                </div>
              </div>
              {createMessage && <div className="success">{createMessage}</div>}
              <div className="list-scroll">
                {filteredResidents.map((r) => {
                  const fullName = [r.first_name, r.last_name].filter(Boolean).join(' ') || '—';
                  const hasSessions = r.active_sessions?.length > 0;
                  return (
                    <div key={r.id} className="resident-card">
                      <div className="resident-row-line">
                        <div className="resident-ident">
                          <strong>{r.email}</strong>
                          <p className="muted name">{fullName}</p>
                        </div>
                        <div className="resident-unit">
                          <p className="muted tiny">Unit</p>
                          <input
                            value={r.unit_number || ''}
                            onChange={(e) =>
                              setResidents((prev) =>
                                prev.map((x) => (x.id === r.id ? { ...x, unit_number: e.target.value } : x))
                              )
                            }
                          />
                        </div>
                        <div className="resident-address">
                          <p className="muted tiny">Address</p>
                          <input
                            placeholder="Address line 1"
                            value={r.address_line1 || ''}
                            onChange={(e) =>
                              setResidents((prev) =>
                                prev.map((x) => (x.id === r.id ? { ...x, address_line1: e.target.value } : x))
                              )
                            }
                          />
                        </div>
                        <div className="resident-meta-line">
                          <div>
                            <p className="muted tiny">Code</p>
                            <strong>{r.last_temp_code ? r.last_temp_code : 'Used'}</strong>
                          </div>
                          <label className="toggle inline">
                            <input
                              type="checkbox"
                              checked={r.is_active}
                              onChange={(e) =>
                                setResidents((prev) =>
                                  prev.map((x) => (x.id === r.id ? { ...x, is_active: e.target.checked } : x))
                                )
                              }
                            />
                            Active
                          </label>
                          {hasSessions && (
                            <button
                              className="ghost tiny"
                              onClick={() => setExpandedResident((prev) => (prev === r.id ? null : r.id))}
                            >
                              {expandedResident === r.id ? 'Hide sessions' : `${r.active_sessions.length} session(s)`}
                            </button>
                          )}
                        </div>
                        <div className="resident-actions inline">
                          <button
                            className="ghost tiny"
                            onClick={async () => {
                              setResidentBusy({ id: r.id, action: 'regen' });
                              setResidentMessages((prev) => ({ ...prev, [r.id]: '' }));
                              try {
                                const updated = await updateResident(r.id, { regenerate_temp_code: true });
                                const merged = {
                                  ...updated,
                                  last_temp_code: updated.temp_code || updated.last_temp_code || r.last_temp_code
                                };
                                setResidents((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...merged } : x)));
                                const msg = `New code: ${merged.last_temp_code}`;
                                setResidentMessages((prev) => ({ ...prev, [r.id]: msg }));
                                setTimeout(
                                  () =>
                                    setResidentMessages((prev) => {
                                      if (prev[r.id] !== msg) return prev;
                                      const { [r.id]: _, ...rest } = prev;
                                      return rest;
                                    }),
                                  2200
                                );
                              } catch (err) {
                                setError('Could not regenerate code');
                              } finally {
                                setResidentBusy({ id: null, action: null });
                              }
                            }}
                            disabled={residentBusy.id === r.id}
                          >
                            {residentBusy.id === r.id && residentBusy.action === 'regen' ? 'Generating…' : 'Regen'}
                          </button>
                          <button
                            className="primary compact"
                            onClick={async () => {
                              setResidentBusy({ id: r.id, action: 'save' });
                              try {
                                const updated = await updateResident(r.id, {
                                  unit_number: r.unit_number,
                                  is_active: r.is_active,
                                  address_line1: r.address_line1
                                });
                                setResidents((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...updated } : x)));
                                const msg = 'Saved';
                                setResidentMessages((prev) => ({ ...prev, [r.id]: msg }));
                                setTimeout(
                                  () =>
                                    setResidentMessages((prev) => {
                                      if (prev[r.id] !== msg) return prev;
                                      const { [r.id]: _, ...rest } = prev;
                                      return rest;
                                    }),
                                  1800
                                );
                              } catch (err) {
                                setError('Could not update resident');
                              } finally {
                                setResidentBusy({ id: null, action: null });
                              }
                            }}
                            disabled={residentBusy.id === r.id}
                          >
                            {residentBusy.id === r.id && residentBusy.action === 'save' ? 'Saving…' : 'Save'}
                          </button>
                          {residentMessages[r.id] && <div className="success small">{residentMessages[r.id]}</div>}
                        </div>
                      </div>
                      {expandedResident === r.id && hasSessions && (
                        <div className="session-list compact">
                          {r.active_sessions.map((s, idx) => (
                            <div key={idx} className="session-row">
                              <span>{s.amenity}</span>
                              <span className="muted">Guests: {s.guest_count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => !createBusy && setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Add tenant</h4>
              <button className="ghost" onClick={() => setShowCreateModal(false)} disabled={createBusy}>
                Close
              </button>
            </div>
            <div className="input-grid">
              <input
                placeholder="Email"
                value={newTenant.email}
                onChange={(e) => setNewTenant((p) => ({ ...p, email: e.target.value }))}
              />
              <input
                placeholder="First name"
                value={newTenant.first_name}
                onChange={(e) => setNewTenant((p) => ({ ...p, first_name: e.target.value }))}
              />
              <input
                placeholder="Last name"
                value={newTenant.last_name}
                onChange={(e) => setNewTenant((p) => ({ ...p, last_name: e.target.value }))}
              />
              <input
                placeholder="Unit number"
                value={newTenant.unit_number}
                onChange={(e) => setNewTenant((p) => ({ ...p, unit_number: e.target.value }))}
              />
            </div>
            {createMessage && <div className="success">{createMessage}</div>}
            <div className="modal-actions">
              <button className="ghost" onClick={() => setShowCreateModal(false)} disabled={createBusy}>
                Cancel
              </button>
              <button
                className="primary"
                onClick={async () => {
                  try {
                    setError('');
                    setCreateMessage('');
                    setCreateBusy(true);
                    const created = await createResident(newTenant);
                    setResidents((prev) => [created, ...prev]);
                    setNewTenant({ email: '', first_name: '', last_name: '', unit_number: '' });
                    if (created.temp_code || created.last_temp_code) {
                      setCreateMessage(`Tenant created. Temp code: ${created.temp_code || created.last_temp_code}`);
                    } else {
                      setCreateMessage('Tenant created.');
                    }
                    setTimeout(() => setShowCreateModal(false), 900);
                  } catch (err) {
                    setError('Could not create tenant');
                  } finally {
                    setCreateBusy(false);
                  }
                }}
                disabled={createBusy}
              >
                {createBusy ? 'Creating…' : 'Create tenant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
