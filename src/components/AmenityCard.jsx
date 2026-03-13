import { useEffect, useState } from 'react';
import {
  UsersIcon,
  PersonIcon,
  GaugeIcon,
  ClockIcon,
  DumbbellIcon,
  PoolIcon,
  BriefcaseIcon,
  TennisIcon,
  SparklesIcon
} from './Icons.jsx';

const svgUri = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

const illusByType = {
  GYM: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='140' viewBox='0 0 220 140' fill='none'>
      <rect x='30' y='70' width='160' height='16' rx='8' fill='%23dce8ff'/>
      <rect x='70' y='58' width='80' height='40' rx='12' fill='%23b8ccff'/>
      <rect x='52' y='60' width='12' height='36' rx='6' fill='%2397b2ff'/>
      <rect x='156' y='60' width='12' height='36' rx='6' fill='%2397b2ff'/>
    </svg>`
  ),
  POOL: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='140' viewBox='0 0 220 140' fill='none'>
      <rect x='20' y='40' width='180' height='70' rx='18' fill='%23c2e9ff'/>
      <path d='M40 90c10 8 20 8 30 0s20-8 30 0 20 8 30 0 20-8 30 0' stroke='%2381c7ff' stroke-width='6' stroke-linecap='round'/>
      <circle cx='90' cy='68' r='8' fill='%2359b5ff'/>
      <path d='M92 68c8-6 16-6 24 0' stroke='%234f9af5' stroke-width='5' stroke-linecap='round'/>
    </svg>`
  ),
  TENNIS: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='140' viewBox='0 0 220 140' fill='none'>
      <rect x='25' y='38' width='170' height='76' rx='14' fill='%23e7f7d3'/>
      <path d='M25 76h170' stroke='%23c8e6a1' stroke-width='6'/>
      <path d='M110 38v76' stroke='%23c8e6a1' stroke-width='6'/>
      <circle cx='70' cy='70' r='10' fill='%23a4d65e'/>
    </svg>`
  ),
  OFFICE: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='140' viewBox='0 0 220 140' fill='none'>
      <rect x='45' y='32' width='130' height='80' rx='12' fill='%23e5e7eb'/>
      <rect x='62' y='48' width='96' height='14' rx='6' fill='%23cbd5e1'/>
      <rect x='62' y='68' width='50' height='10' rx='5' fill='%23cbd5e1'/>
      <rect x='62' y='84' width='36' height='10' rx='5' fill='%23cbd5e1'/>
    </svg>`
  )
};

export default function AmenityCard({
  amenity,
  guestCount = 0,
  onGuestCountChange,
  onCheckIn,
  onCheckOut,
  refreshing,
  disabled = false,
  loading = false,
  isCheckedIn = false,
  anotherActive = false,
  activeAmenityName = '',
  timezone,
  timezoneLabel,
  checkInTime,
  lastUpdated,
  showGenerate = false,
  onGenerateQr = null
}) {
  const parseMinutes = (t) => {
    if (!t) return null;
    const [h, m] = t.split(':').map((n) => parseInt(n, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  const nowMinutes = (() => {
    const now = new Date();
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })
        .format(now)
        .split(':');
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    } catch (e) {
      return now.getHours() * 60 + now.getMinutes();
    }
  })();

  const openMin = parseMinutes(amenity.open_time);
  const closeMin = parseMinutes(amenity.close_time);
  const withinHours = (() => {
    if (openMin === null || closeMin === null) return true;
    if (closeMin >= openMin) {
      return nowMinutes >= openMin && nowMinutes <= closeMin;
    }
    // wrap past midnight
    return nowMinutes >= openMin || nowMinutes <= closeMin;
  })();

  const serverStatus = (amenity.status || '').toUpperCase();
  const isActive = amenity.is_active !== false;
  const isFull = serverStatus === 'FULL';
  const isBusy = serverStatus === 'BUSY';

  const effectiveStatus = (() => {
    if (!isActive) return 'Disabled';
    if (isFull) return 'Full';
    if (isBusy) return 'Busy';
    if (openMin !== null && closeMin !== null) {
      return withinHours ? 'Open' : 'Closed';
    }
    if (serverStatus === 'AVAILABLE') return 'Open';
    if (serverStatus === 'CLOSED') return 'Closed';
    return 'Open';
  })();

  const badgeClass = {
    Open: 'pill success',
    Busy: 'pill warning',
    Full: 'pill danger',
    Closed: 'pill danger',
    Disabled: 'pill disabled'
  }[effectiveStatus] || 'pill muted';
  const badgeLabel = effectiveStatus;

  const computedClosed =
    effectiveStatus === 'Closed' || effectiveStatus === 'Full' || !isActive;

  const capacityPct =
    amenity.capacity && Number.isFinite(amenity.capacity)
      ? Math.min(100, Math.round(((amenity.current_count ?? 0) / amenity.capacity) * 100))
      : null;

  const capacityTone = (() => {
    if (effectiveStatus === 'Closed') return 'capacity-neutral';
    if (capacityPct === null) return 'capacity-neutral';
    if (capacityPct <= 60) return 'capacity-good';
    if (capacityPct <= 85) return 'capacity-warn';
    return 'capacity-bad';
  })();

  const utilizationPct =
    amenity.capacity && Number.isFinite(amenity.capacity)
      ? Math.min(100, Math.round(((amenity.current_count ?? 0) / amenity.capacity) * 100))
      : 0;

  const perResidentLimit =
    amenity.max_guests_per_resident == null ? Infinity : Math.max(0, amenity.max_guests_per_resident);

  const fmtTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const hours12 = ((h % 12) + 12) % 12 || 12;
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${hours12}:${String(m).padStart(2, '0')} ${suffix}`;
  };
  const openText =
    amenity.open_time && amenity.close_time
      ? `Hours: ${fmtTime(amenity.open_time)} - ${fmtTime(amenity.close_time)}${timezoneLabel ? ` (${timezoneLabel})` : ''}`
      : '';

  const AmenityTypeIcon = (() => {
    switch ((amenity.type || '').toUpperCase()) {
      case 'GYM':
        return DumbbellIcon;
      case 'POOL':
        return PoolIcon;
      case 'OFFICE':
        return BriefcaseIcon;
      case 'TENNIS':
        return TennisIcon;
      default:
        return SparklesIcon;
    }
  })();

  const disableCheckIn = refreshing || disabled || (!isCheckedIn && computedClosed) || anotherActive;
  const disableGuestInput = disabled || computedClosed || isCheckedIn || anotherActive;
  const closedMessage =
    computedClosed && !anotherActive && !disabled
      ? amenity.status_reason ||
        (!isActive
          ? 'This amenity is disabled by management.'
          : 'This amenity is closed right now. Please check back during open hours.')
      : null;

  const [showClosedHint, setShowClosedHint] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [elapsedLabel, setElapsedLabel] = useState('');
  const [startLabel, setStartLabel] = useState('');
  const [showHours, setShowHours] = useState(false);

  useEffect(() => {
    if (!computedClosed) setShowClosedHint(false);
  }, [computedClosed]);

  useEffect(() => {
    if (showClosedHint && closedMessage) {
      setInfoMessage(closedMessage);
      const t = setTimeout(() => {
        setInfoMessage('Please check in/out to help everyone see real-time capacity.');
        setShowClosedHint(false);
      }, 3200);
      return () => clearTimeout(t);
    }
  }, [showClosedHint, closedMessage]);

  const handleCardEnter = () => {
    if (computedClosed) setShowClosedHint(true);
  };
  const handleCardLeave = () => setShowClosedHint(false);

  // derive start time + elapsed for active session
  useEffect(() => {
    if (!checkInTime) {
      setElapsedLabel('');
      setStartLabel('');
      return;
    }
    const compute = () => {
      const started = new Date(checkInTime);
      const opts = { hour: 'numeric', minute: '2-digit', timeZone: timezone || undefined };
      setStartLabel(started.toLocaleTimeString([], opts));
    };
    compute();
    return () => {};
  }, [checkInTime, timezone]);

  const clampGuests = (val) => {
    if (!Number.isFinite(val)) return 0;
    return Math.max(0, Math.floor(val));
  };

  const changeGuests = (delta) => {
    if (disableGuestInput) return;
    const next = clampGuests((guestCount ?? 0) + delta);
    const clamped = Math.min(perResidentLimit, next);
    onGuestCountChange(clamped);
  };

  const handleAction = () => {
    if (isCheckedIn) {
      onCheckOut(amenity);
      return;
    }
    if (computedClosed || anotherActive || disabled) {
      if (computedClosed) {
        setShowClosedHint(true);
        setTimeout(() => setShowClosedHint(false), 1800);
      }
      return;
    }
    onCheckIn(amenity);
  };

  return (
    <div
      className="card amenity-card"
      style={{
        backgroundImage: illusByType[(amenity.type || '').toUpperCase()] || illusByType.POOL,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'calc(100% - 20px) 12px',
        backgroundSize: '120px auto'
      }}
      onMouseEnter={handleCardEnter}
      onMouseLeave={handleCardLeave}
    >
      {loading ? (
        <div className="amenity-skeleton">
          <div className="skeleton pill sk-pill" />
          <div className="skeleton title" />
          <div className="skeleton row" />
          <div className="skeleton row" />
          <div className="skeleton bar" />
          <div className="skeleton bar" />
        </div>
      ) : (
        <>
          <div className="card-header row">
            <div className="amenity-title">
              <span className="amenity-icon">
                <AmenityTypeIcon />
              </span>
              <div>
                <h3>{amenity.name}</h3>
              </div>
            </div>
            <span className={`${badgeClass} pill-dot ${effectiveStatus !== 'Closed' ? capacityTone : ''}`}>
              <span className="status-dot" />
              {badgeLabel}
            </span>
          </div>
          <div className="meta">
            <div className="meta-item">
              <UsersIcon className="meta-icon" />
              <div>
                <p className="muted">Capacity</p>
                <strong className={effectiveStatus !== 'Closed' ? capacityTone : ''}>{amenity.capacity ?? '—'}</strong>
              </div>
            </div>
            <div className="meta-item">
              <PersonIcon className="meta-icon" />
              <div>
                <p className="muted">Current</p>
                <strong>{amenity.current_count ?? '—'}</strong>
              </div>
            </div>
            <div className="meta-item">
              <GaugeIcon className="meta-icon" />
              <div>
                <p className="muted">Confidence</p>
                <strong>{amenity.confidence ? `${amenity.confidence}%` : '—'}</strong>
              </div>
            </div>
          </div>
          <div className="capacity-progress">
            <div className="capacity-track">
              <div className={`capacity-fill ${capacityTone}`} style={{ width: `${utilizationPct}%` }} />
            </div>
            <div className="capacity-legend">
              <span className="muted tiny">Utilization</span>
              <strong>{utilizationPct}%</strong>
            </div>
          </div>
          <p className="muted tiny" style={{ margin: '4px 0 6px' }}>
            Updated {lastUpdated ? `${Math.max(0, Math.round((Date.now() - lastUpdated) / 1000))}s ago` : 'just now'}
          </p>
          {openText && (
            <button
              type="button"
              className="ghost-button hours-toggle"
              onClick={() => setShowHours((v) => !v)}
            >
              <ClockIcon className="meta-icon" />
              <span>{showHours ? 'Hide hours' : 'View hours'}</span>
              <span className="chevron">{showHours ? '▲' : '▼'}</span>
            </button>
          )}
          {showHours && openText && (
            <div className="hours-box">
              <p className="muted">{openText}</p>
              {amenity.quiet_hours && <p className="muted tiny">Quiet hours: {amenity.quiet_hours}</p>}
            </div>
          )}
          {isCheckedIn && checkInTime && (
            <div className="info-chip checked-in checked-in-row">
              <strong>Checked in</strong>
              <span className="muted">Since {startLabel}</span>
            </div>
          )}
          {showGenerate && onGenerateQr && (
            <div className="actions" style={{ marginTop: 6 }}>
              <button className="ghost-button" type="button" onClick={() => onGenerateQr(amenity)}>
                Generate QR
              </button>
            </div>
          )}
          <label className="input-group inline">
            <span>Guests</span>
            <div className="guest-input-wrap">
              <button
                type="button"
                className="guest-btn"
                onClick={() => changeGuests(-1)}
                disabled={disableGuestInput || guestCount <= 0}
              >
                −
              </button>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                value={guestCount}
                onChange={(e) => onGuestCountChange(clampGuests(Number(e.target.value)))}
                disabled={disableGuestInput}
              />
              <button
                type="button"
                className="guest-btn"
                onClick={() => changeGuests(1)}
                disabled={disableGuestInput}
              >
                +
              </button>
            </div>
          </label>
          <div className="actions">
            <button
              className={`primary cta-checkin ${isCheckedIn ? 'invert' : ''}`}
              onClick={handleAction}
              disabled={disableCheckIn || (isCheckedIn && refreshing)}
            >
              {isCheckedIn ? 'Check out' : 'Check in'}
            </button>
          </div>
          {showClosedHint && closedMessage && (
            <div className="warning-chip" style={{ marginTop: 8 }}>
              {closedMessage}
            </div>
          )}
          {anotherActive && !isCheckedIn && (
            <div className="warning-chip" style={{ marginTop: 8 }}>
              You are currently checked into {activeAmenityName}. Check out to switch.
            </div>
          )}
          {disabled && <div className="card-overlay">Profile inactive. Rejoin to use amenities.</div>}
        </>
      )}
    </div>
  );
}
