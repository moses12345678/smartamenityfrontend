const base = {
  width: 22,
  height: 22,
  strokeWidth: 1.6,
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

export const BuildingIcon = (props = {}) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <rect x="4" y="4.5" width="10" height="15" rx="2" />
    <path d="M14 9h3a2 2 0 0 1 2 2v8H9" />
    <path d="M8 9h2" />
    <path d="M8 12h2" />
    <path d="M8 15h2" />
    <path d="M17 17h-2.5" />
    <circle cx="17" cy="9" r="0.9" />
  </svg>
);

export const PinIcon = (props = {}) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="M12 21s6-4.7 6-10a6 6 0 0 0-12 0c0 5.3 6 10 6 10Z" />
    <circle cx="12" cy="11" r="2.4" />
  </svg>
);

export const ShieldIcon = (props = {}) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="M12 4 5 7v5c0 4.4 3.1 7.8 7 9 3.9-1.2 7-4.6 7-9V7Z" />
    <path d="m9.5 12.5 1.7 1.7 3.3-3.9" />
  </svg>
);

export const DoorIcon = (props = {}) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="M7 20h10V6.5L10.5 4 7 5.2Z" />
    <path d="M12 13.5h.01" />
    <path d="M7 20v-6" />
  </svg>
);

export const SparklesIcon = (props = {}) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="M12 3.5 13.2 8 17.5 9.2 13.2 10.5 12 15 10.8 10.5 6.5 9.2 10.8 8Z" />
    <path d="M6.5 13 7 15 9 15.5 7 16 6.5 18 6 16 4 15.5 6 15Z" />
    <path d="M17.5 13 18 15l2 .5-2 .5-.5 2-.5-2-2-.5 2-.5Z" />
  </svg>
);

export const UserPlusIcon = (props = {}) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="M15.5 19c0-2.5-2.2-4.5-5-4.5s-5 2-5 4.5" />
    <circle cx="10.5" cy="7.5" r="3" />
    <path d="M17.5 7.5v4" />
    <path d="M15.5 9.5h4" />
  </svg>
);

export const HomeIcon = (props = {}) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="m4 10.5 7.2-5.6c.5-.4 1.2-.4 1.7 0l7.1 5.6" />
    <path d="M6 10.5V18a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7.5" />
    <path d="M9.5 19V14h5v5" />
  </svg>
);

export const ClipboardIcon = (props = {}) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="M16 5h1.5A1.5 1.5 0 0 1 19 6.5v13A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5v-13A1.5 1.5 0 0 1 6.5 5H8" />
    <rect x="8" y="3" width="8" height="4" rx="1" />
    <path d="M8.5 11h7" />
    <path d="M8.5 15h4" />
  </svg>
);

export const UsersIcon = (props = {}) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="M17 21v-2.5a3.5 3.5 0 0 0-3.5-3.5h-6A3.5 3.5 0 0 0 4 18.5V21" />
    <circle cx="10.5" cy="8" r="3" />
    <path d="M15.5 12.5a3.5 3.5 0 1 0-1.5-6.6" />
    <path d="M20 21v-1.5a3.5 3.5 0 0 0-2.3-3.3" />
  </svg>
);

export const PersonIcon = (props = {}) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="M16 19v-1a4 4 0 0 0-8 0v1" />
    <circle cx="12" cy="8" r="3.2" />
  </svg>
);

export const GaugeIcon = (props = {}) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="M5 20a9 9 0 1 1 14 0Z" />
    <path d="m12 12 3-3" />
    <path d="M7 17h2" />
    <path d="M15 17h2" />
  </svg>
);

export const ClockIcon = (props = {}) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l2.5 1.5" />
  </svg>
);

export const MailIcon = (props = {}) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <rect x="4" y="6" width="16" height="12" rx="2" />
    <path d="m5 8 7 5 7-5" />
  </svg>
);

export const DumbbellIcon = (props = {}) => (
  <span role="img" aria-label="gym" className="emoji-icon" {...props}>
    🏋️
  </span>
);

export const PoolIcon = (props = {}) => (
  <span role="img" aria-label="pool" className="emoji-icon" {...props}>
    🏊‍♂️
  </span>
);

export const BriefcaseIcon = (props = {}) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <rect x="4" y="7" width="16" height="12" rx="2" />
    <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" />
    <path d="M4 12h5.5" />
    <path d="M14.5 12H20" />
    <path d="M10 10v4" />
    <path d="M14 10v4" />
  </svg>
);

export const TennisIcon = (props = {}) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="7.5" />
    <path d="M8.5 5.5c2 2 2 11 0 13" />
    <path d="M15.5 5.5c-2 2-2 11 0 13" />
  </svg>
);

export default {
  BuildingIcon,
  PinIcon,
  ShieldIcon,
  DoorIcon,
  SparklesIcon,
  UserPlusIcon,
  HomeIcon,
  ClipboardIcon,
  UsersIcon,
  PersonIcon,
  GaugeIcon,
  ClockIcon,
  MailIcon,
  DumbbellIcon,
  PoolIcon,
  BriefcaseIcon,
  TennisIcon
};
