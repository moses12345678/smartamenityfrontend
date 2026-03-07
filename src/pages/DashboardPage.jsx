import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AmenityCard from '../components/AmenityCard.jsx';
import { checkInAmenity, checkOutAmenity, fetchAmenityStatus } from '../api/amenities.js';
import { fetchInvite, fetchPropertyAmenities, joinProperty, leaveProperty } from '../api/properties.js';
import { fetchCurrentUser } from '../api/users.js';
import { useAuth } from '../context/AuthContext.jsx';
import { MailIcon, HomeIcon, ShieldIcon, PinIcon } from '../components/Icons.jsx';

const STATE_TIMEZONE = {
  AL: 'America/Chicago',
  AK: 'America/Anchorage',
  AZ: 'America/Phoenix',
  AR: 'America/Chicago',
  CA: 'America/Los_Angeles',
  CO: 'America/Denver',
  CT: 'America/New_York',
  DE: 'America/New_York',
  FL: 'America/New_York',
  GA: 'America/New_York',
  HI: 'Pacific/Honolulu',
  IA: 'America/Chicago',
  ID: 'America/Boise',
  IL: 'America/Chicago',
  IN: 'America/New_York',
  KS: 'America/Chicago',
  KY: 'America/New_York',
  LA: 'America/Chicago',
  MA: 'America/New_York',
  MD: 'America/New_York',
  ME: 'America/New_York',
  MI: 'America/New_York',
  MN: 'America/Chicago',
  MO: 'America/Chicago',
  MS: 'America/Chicago',
  MT: 'America/Denver',
  NC: 'America/New_York',
  ND: 'America/Chicago',
  NE: 'America/Chicago',
  NH: 'America/New_York',
  NJ: 'America/New_York',
  NM: 'America/Denver',
  NV: 'America/Los_Angeles',
  NY: 'America/New_York',
  OH: 'America/New_York',
  OK: 'America/Chicago',
  OR: 'America/Los_Angeles',
  PA: 'America/New_York',
  RI: 'America/New_York',
  SC: 'America/New_York',
  SD: 'America/Chicago',
  TN: 'America/Chicago',
  TX: 'America/Chicago',
  UT: 'America/Denver',
  VA: 'America/New_York',
  VT: 'America/New_York',
  WA: 'America/Los_Angeles',
  WI: 'America/Chicago',
  WV: 'America/New_York',
  WY: 'America/Denver',
  DC: 'America/New_York'
};

const guessTimeZone = (property) => {
  const explicit = property?.timezone || property?.time_zone;
  if (explicit) return explicit;
  const city = property?.city;
  let stateCode = '';
  if (typeof city === 'string') {
    const parts = city.split(',').map((p) => p.trim());
    if (parts.length > 1) stateCode = parts[1].toUpperCase();
  } else if (city?.state) {
    stateCode =
      (city.state.code || city.state.abbr || city.state.name || city.state || '').toString().toUpperCase();
  }
  if (!stateCode && property?.state) {
    stateCode = (property.state.code || property.state.abbr || property.state).toString().toUpperCase();
  }
  if (stateCode && STATE_TIMEZONE[stateCode]) return STATE_TIMEZONE[stateCode];
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    joinedProperty,
    pendingInvite,
    saveJoinedProperty,
    savePendingInvite,
    user,
    saveUser,
    tokens
  } = useAuth();
  const [property, setProperty] = useState(joinedProperty);
  const [amenities, setAmenities] = useState(joinedProperty?.amenities || []);
  const [guestCounts, setGuestCounts] = useState({});
  const [checkInTimes, setCheckInTimes] = useState({});
  const [loading, setLoading] = useState(!joinedProperty);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [activeSessions, setActiveSessions] = useState({});
  const [rejoining, setRejoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [amenitiesSlugLoaded, setAmenitiesSlugLoaded] = useState(null);
  const [loadedMe, setLoadedMe] = useState(false);
  const sessionTimers = useRef({});
  const residentActive = property?.resident ? property.resident.active !== false : true;
  const residentStatusLabel = residentActive ? 'Active' : 'Inactive';
  const residentStatusClass = residentActive ? 'pill success' : 'pill danger';
  const propertyTimezone = useMemo(() => guessTimeZone(property), [property]);
  const propertyTimezoneLabel = useMemo(() => {
    if (!propertyTimezone) return '';
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: propertyTimezone,
        timeZoneName: 'short'
      }).formatToParts(new Date());
      const tzPart = parts.find((p) => p.type === 'timeZoneName');
      return tzPart?.value || propertyTimezone;
    } catch (e) {
      return propertyTimezone;
    }
  }, [propertyTimezone]);

  const activeAmenityId = useMemo(() => {
    const id = Object.entries(activeSessions).find(([, v]) => v)?.[0];
    return id ? Number(id) : null;
  }, [activeSessions]);

  const activeAmenityName = useMemo(() => {
    if (!activeAmenityId) return '';
    const found = amenities.find((a) => a.id === activeAmenityId);
    return found?.name || 'this amenity';
  }, [activeAmenityId, amenities]);

  // Auto-dismiss transient errors
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 4500);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (joinedProperty) {
      setProperty(joinedProperty);
      setAmenities(joinedProperty.amenities || []);
      setLoading(false);
      return;
    }
    const loadFallback = async () => {
      if (!pendingInvite) {
        setError('No invite token found. Open your invite link to continue.');
        setLoading(false);
        return;
      }
      try {
        const data = await fetchInvite(pendingInvite);
        setProperty(data);
        setAmenities(data.amenities || []);
        if (data?.slug) {
          loadAmenitiesForProperty(data.slug);
        }
      } catch (err) {
        if (err?.response?.status === 404) {
          setError('Invite not found or expired. Open a valid invite link to continue.');
        } else if (err?.message === 'Network Error') {
          setError('Could not load property (network/CORS).');
        } else {
          setError('Could not load property.');
        }
      } finally {
        setLoading(false);
      }
    };
    loadFallback();
  }, [joinedProperty, pendingInvite]);

  useEffect(() => {
    const loadMe = async () => {
      if (!tokens?.access || loadedMe) return;
      try {
        const me = await fetchCurrentUser();
        if (me) {
          saveUser(me);
          const resident = me.resident || me.resident_profile || property?.resident;
          const prop = resident?.property || property || joinedProperty;
          if (prop) {
            const merged = { ...prop, resident };
            setProperty(merged);
            saveJoinedProperty(merged);
            if (merged?.slug) {
              loadAmenitiesForProperty(merged.slug);
            }
          }
        }
      } catch (err) {
        // ignore; rely on invite fallback
      } finally {
        setLoadedMe(true);
      }
    };
    loadMe();
  }, [tokens?.access, loadedMe, property, joinedProperty]);

  const refreshAmenity = async (id) => {
    const status = await fetchAmenityStatus(id);
    setAmenities((prev) => prev.map((a) => (a.id === id ? { ...a, ...status } : a)));
    if (typeof status.user_has_active_session === 'boolean') {
      setActiveSessions((prev) => ({ ...prev, [id]: status.user_has_active_session }));
    }
    if (status.user_check_in_time) {
      setCheckInTimes((prev) => ({ ...prev, [id]: status.user_check_in_time }));
    } else {
      setCheckInTimes((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const loadAmenitiesForProperty = async (slug) => {
    if (!slug || amenitiesSlugLoaded === slug) return;
    try {
      const list = await fetchPropertyAmenities(slug);
      if (Array.isArray(list)) {
        setAmenities(list);
        setAmenitiesSlugLoaded(slug);
      }
    } catch (err) {
      setError('Could not load amenities for this property.');
    }
  };

  const hydrateFromInvite = async () => {
    const token = pendingInvite || property?.invite_token;
    if (!token) return;
    try {
      const data = await fetchInvite(token);
      if (data?.amenities?.length) {
        setAmenities(data.amenities);
      }
      if (data && !property) {
        setProperty(data);
      } else if (data && property) {
        setProperty((prev) => ({ ...(prev || {}), ...data, resident: prev?.resident }));
      }
    } catch (err) {
      // ignore; fallback remains
    }
  };

  useEffect(() => {
    if (!amenities?.length && property?.slug) {
      loadAmenitiesForProperty(property.slug);
    } else if (!amenities?.length) {
      hydrateFromInvite();
    }
  }, [amenities?.length, property?.slug, pendingInvite]);

  useEffect(() => {
    if (!amenities?.length) return;
    const run = async () => {
      for (const a of amenities) {
        if (!a?.id) continue;
        try {
          await refreshAmenity(a.id);
        } catch (err) {
          // ignore individual failures
        }
      }
    };
    run();
  }, [amenities.length]);

  const handleCheckIn = async (amenity) => {
    if (activeAmenityId && activeAmenityId !== amenity.id) {
      setError(`You are already checked into ${activeAmenityName}. Please check out first.`);
      return;
    }
    const perResidentLimit =
      amenity.max_guests_per_resident == null ? Infinity : Math.max(0, amenity.max_guests_per_resident);
    const count = guestCounts[amenity.id] ?? 0;
    if (count > perResidentLimit) {
      const detail =
        perResidentLimit === Infinity
          ? 'Guest limit exceeded.'
          : `Guest limit is ${perResidentLimit}. Reduce guest count or update limits.`;
      setError(detail);
      return;
    }
    setBusyId(amenity.id);
    try {
      const session = await checkInAmenity(amenity.id, count);
      if (session?.check_in_time) {
        setCheckInTimes((prev) => ({ ...prev, [amenity.id]: session.check_in_time }));
      }
      setActiveSessions((prev) => ({ ...prev, [amenity.id]: true }));
      await refreshAmenity(amenity.id);
      // schedule reminder at +90 min and auto-checkout at +120 min
      clearTimeout(sessionTimers.current[`reminder_${amenity.id}`]);
      clearTimeout(sessionTimers.current[`autocheckout_${amenity.id}`]);
      sessionTimers.current[`reminder_${amenity.id}`] = setTimeout(() => {
        alert(`Are you still at ${amenity.name}? Please check out if you have left.`);
      }, 90 * 60 * 1000);
      sessionTimers.current[`autocheckout_${amenity.id}`] = setTimeout(async () => {
        try {
          await checkOutAmenity(amenity.id);
          await refreshAmenity(amenity.id);
        } catch (err) {
          // ignore auto checkout failure
        }
      }, 120 * 60 * 1000);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Check-in failed (guest limits may apply).');
    } finally {
      setBusyId(null);
    }
  };

  const handleCheckOut = async (amenity) => {
    setBusyId(amenity.id);
    try {
      await checkOutAmenity(amenity.id);
      setActiveSessions((prev) => ({ ...prev, [amenity.id]: false }));
      setCheckInTimes((prev) => {
        const next = { ...prev };
        delete next[amenity.id];
        return next;
      });
      await refreshAmenity(amenity.id);
      clearTimeout(sessionTimers.current[`reminder_${amenity.id}`]);
      clearTimeout(sessionTimers.current[`autocheckout_${amenity.id}`]);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Check-out failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleRejoin = async () => {
    const inviteToUse = pendingInvite || property?.invite_token;
    if (!inviteToUse) {
      setError('No invite token available. Please open your invite link again.');
      navigate('/invite/example');
      return;
    }
    setRejoining(true);
    setError('');
    try {
      const joined = await joinProperty({ invite_token: inviteToUse });
      const prop = joined?.property || joined;
      const resident = joined?.resident || joined?.resident_profile;
      const merged = { ...prop, resident };
      setProperty(merged);
      if (merged.amenities?.length) {
        setAmenities(merged.amenities);
      } else {
        setAmenities(prop?.amenities || []);
      }
      saveJoinedProperty(merged);
      savePendingInvite(inviteToUse);
      await loadAmenitiesForProperty(merged.slug);
      if (!merged.amenities?.length) {
        await hydrateFromInvite();
      }
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not rejoin this property.');
    } finally {
      setRejoining(false);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    setError('');
    try {
      await leaveProperty();
      saveJoinedProperty(null);
      setProperty(null);
      setAmenities([]);
      setActiveSessions({});
      // clear timers
      Object.keys(sessionTimers.current).forEach((k) => clearTimeout(sessionTimers.current[k]));
      const target = pendingInvite ? `/invite/${pendingInvite}` : '/login';
      navigate(target);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not leave the property right now.');
    } finally {
      setLeaving(false);
    }
  };

  if (loading) {
    return (
      <div className="center-stack">
        <div className="skeleton" />
        <p className="muted">Loading dashboard…</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="card">
        <h2>Join a property</h2>
        <p className="muted">We need an invite link before showing amenities.</p>
        <button className="primary" onClick={() => navigate('/invite')}>Go to invite</button>
      </div>
    );
  }

  const cityLabel = (() => {
    if (!property?.city) return '';
    if (typeof property.city === 'string') return property.city;
    const c = property.city;
    const stateText =
      typeof c.state === 'string'
        ? c.state
        : c.state?.code || c.state?.abbr || c.state?.name;
    return [c.city || c.name, stateText].filter(Boolean).join(', ');
  })();

  return (
    <div className="dashboard">
      <div className="card">
        <div className="card-header row">
          <div>
            <p className="eyebrow">Property</p>
            <h2>{property.name}</h2>
            <p className="muted meta-inline">
              <PinIcon className="meta-icon" />
              <span>{cityLabel || 'Location pending'}</span>
            </p>
          </div>
          <div className="meta">
            <div className="meta-item">
              <MailIcon className="meta-icon" />
              <div>
                <p className="muted">Email</p>
                <strong>{property?.resident?.email || user?.email || '—'}</strong>
              </div>
            </div>
            <div className="meta-item">
              <HomeIcon className="meta-icon" />
              <div>
                <p className="muted">Apartment</p>
                <strong>
                  {property?.resident?.address_line1 || property?.resident?.unit_number || '—'}
                </strong>
              </div>
            </div>
            <div className="meta-item">
              <ShieldIcon className="meta-icon" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p className="muted" style={{ margin: 0 }}>Resident</p>
                <span className={residentStatusClass}>{residentStatusLabel}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="actions">
          {!residentActive && (
            <button className="primary" onClick={handleRejoin} disabled={rejoining}>
              {rejoining ? 'Rejoining…' : 'Reactivate & join'}
            </button>
          )}
        </div>
        {!residentActive && (
          <div className="warning-chip">
            Resident profile is inactive. Rejoin with your invite to resume amenity access.
          </div>
        )}
        {error && <div className="error-chip">{error}</div>}
      </div>

      <div className="section-header">
        <div>
          <p className="eyebrow">{activeAmenityId ? 'Currently checked in' : 'Choose your spot'}</p>
          <h3>
            {activeAmenityId
              ? `You are at ${activeAmenityName} right now`
              : 'Where do you want to go today?'}
          </h3>
          {activeAmenityId && (
            <p className="muted meta-inline">
              <ShieldIcon className="meta-icon" />
              <span>Check out to switch to another amenity.</span>
            </p>
          )}
        </div>
      </div>

      <div className="grid">
        {amenities && amenities.length > 0 ? (
          amenities
            .slice()
            .sort((a, b) => {
              const statusRank = (s) => {
                const x = (s || '').toUpperCase();
                if (x === 'AVAILABLE' || x === 'OPEN') return 0;
                if (x === 'BUSY') return 1;
                if (x === 'FULL') return 2;
                return 3; // closed or unknown
              };
              return statusRank(a.status) - statusRank(b.status);
            })
            .map((amenity) => (
              <AmenityCard
                key={amenity.id || amenity.name}
                amenity={amenity}
                guestCount={guestCounts[amenity.id] ?? 0}
                onGuestCountChange={(count) =>
                  setGuestCounts((prev) => ({ ...prev, [amenity.id]: count }))
                }
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                refreshing={busyId === amenity.id}
                loading={!amenity.status}
                disabled={!residentActive}
                isCheckedIn={Boolean(activeSessions[amenity.id])}
                anotherActive={Boolean(activeAmenityId && activeAmenityId !== amenity.id)}
                activeAmenityName={activeAmenityName}
                timezone={propertyTimezone}
                timezoneLabel={propertyTimezoneLabel}
                checkInTime={checkInTimes[amenity.id]}
              />
            ))
        ) : (
          <div className="card">
            <p className="muted">No amenities attached to this property yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
