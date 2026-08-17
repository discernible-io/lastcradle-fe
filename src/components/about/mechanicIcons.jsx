/** Inline stroke icons for About / Game mechanic lists. */

function Icon({ children, label }) {
  return (
    <svg
      className="about-mechanic-icon-svg"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {children}
    </svg>
  );
}

const icons = {
  channels: (
    <Icon>
      <path d="M4 12h2.5" />
      <path d="M17.5 12H20" />
      <circle cx="12" cy="12" r="2.25" />
      <path d="M7.2 8.2a6.2 6.2 0 0 1 0 7.6" />
      <path d="M16.8 8.2a6.2 6.2 0 0 0 0 7.6" />
      <path d="M4.8 5.5a10 10 0 0 1 0 13" />
      <path d="M19.2 5.5a10 10 0 0 0 0 13" />
    </Icon>
  ),
  identity: (
    <Icon>
      <rect x="4" y="5" width="16" height="14" rx="1.5" />
      <circle cx="9.2" cy="11" r="2.1" />
      <path d="M13.2 9.5h5.3" />
      <path d="M13.2 12.5h4.2" />
      <path d="M13.2 15.5h3.2" />
    </Icon>
  ),
  negotiate: (
    <Icon>
      <path d="M4 7.5h8.5a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5H9l-2.5 2.2V14.5H5.5A1.5 1.5 0 0 1 4 13V7.5z" />
      <path d="M11.5 5.5h7a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-.8" />
    </Icon>
  ),
  commitments: (
    <Icon>
      <path d="M8 5.5h11" />
      <path d="M8 12h11" />
      <path d="M8 18.5h11" />
      <path d="M4 5.5l1.4 1.4L7.6 4.7" />
      <path d="M4 12l1.4 1.4L7.6 11.2" />
      <circle cx="5.5" cy="18.5" r="1.4" />
    </Icon>
  ),
  strategy: (
    <Icon>
      <circle cx="6.5" cy="6.5" r="2" />
      <circle cx="17.5" cy="6.5" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M8.2 7.8 10.4 15.2" />
      <path d="M15.8 7.8 13.6 15.2" />
      <path d="M8.5 6.5h7" />
    </Icon>
  ),
  reputation: (
    <Icon>
      <path d="M12 3.8l1.7 3.6 4 .6-2.9 2.8.7 4-3.5-1.9-3.5 1.9.7-4-2.9-2.8 4-.6z" />
    </Icon>
  ),
  persistence: (
    <Icon>
      <path d="M12 4.5v3.2" />
      <path d="M12 16.3v3.2" />
      <path d="M7.2 6.5A7 7 0 0 0 5.2 14" />
      <path d="M16.8 6.5A7 7 0 0 1 18.8 14" />
      <path d="M8.2 17.2a5.8 5.8 0 0 0 7.6 0" />
      <circle cx="12" cy="12" r="2.1" />
    </Icon>
  ),
  learn: (
    <Icon>
      <path d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3" />
      <path d="M17.2 4.8v3.2h-3.2" />
      <path d="M19.5 12a7.5 7.5 0 0 1-12.8 5.3" />
      <path d="M6.8 19.2v-3.2h3.2" />
      <path d="M9.5 12h5" />
      <path d="M12 9.5v5" />
    </Icon>
  ),
  cradles: (
    <Icon>
      <path d="M12 3.2 19 7.2v9.6L12 20.8 5 16.8V7.2z" />
      <circle cx="12" cy="10" r="1.15" />
      <circle cx="9.4" cy="14.2" r="1.15" />
      <circle cx="14.6" cy="14.2" r="1.15" />
    </Icon>
  ),
  espionage: (
    <Icon>
      <path d="M2.8 12s3.4-5.5 9.2-5.5S21.2 12 21.2 12s-3.4 5.5-9.2 5.5S2.8 12 2.8 12z" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M5 19 19 5" />
    </Icon>
  ),
  tradeoffs: (
    <Icon>
      <path d="M7.5 5.5 4.5 8.5 7.5 11.5" />
      <path d="M4.5 8.5h10.5a3.5 3.5 0 0 1 0 7H14" />
      <path d="M16.5 18.5 19.5 15.5 16.5 12.5" />
      <path d="M19.5 15.5H9a3.5 3.5 0 0 1 0-7h1.2" />
    </Icon>
  ),
  cycles: (
    <Icon>
      <circle cx="12" cy="12" r="7.2" />
      <path d="M12 7.2v5.1l3.2 1.9" />
      <path d="M18.8 6.2 20.2 9.4 17 10.2" />
    </Icon>
  ),
  phases: (
    <Icon>
      <path d="M4 8.5h9.5" />
      <path d="M11.2 5.8 14.2 8.5 11.2 11.2" />
      <path d="M10.5 15.5H20" />
      <path d="M16.8 12.8 19.8 15.5 16.8 18.2" />
      <circle cx="4" cy="8.5" r="1.2" />
      <circle cx="20" cy="15.5" r="1.2" />
    </Icon>
  ),
  wakes: (
    <Icon>
      <path d="M8.2 10.2a3.8 3.8 0 0 1 7.6 0c0 3.4 1.4 4.4 1.4 4.4H6.8s1.4-1 1.4-4.4z" />
      <path d="M10.2 18.2a1.8 1.8 0 0 0 3.6 0" />
      <path d="M12 4.2v1.4" />
    </Icon>
  ),
  trade: (
    <Icon>
      <path d="M7 8h10.5" />
      <path d="M14.8 5.2 17.8 8 14.8 10.8" />
      <path d="M17 16H6.5" />
      <path d="M9.2 13.2 6.2 16 9.2 18.8" />
      <path d="M12 10.5v3" />
    </Icon>
  ),
  ending: (
    <Icon>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 5.2a6.8 6.8 0 1 1-4.8 11.6" />
      <path d="M12 8.2a3.8 3.8 0 1 1-2.7 6.5" />
      <path d="M14.8 4.8 16.8 7.4 13.8 8" />
    </Icon>
  ),
  premise: (
    <Icon>
      <path d="M5 19.2V6.2a1.5 1.5 0 0 1 1.5-1.5h8.2L19 8.9v10.3a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 19.2z" />
      <path d="M14.7 4.7v3.4h3.4" />
      <path d="M8.2 12h7.6" />
      <path d="M8.2 15.2h5.2" />
    </Icon>
  ),
  beliefs: (
    <Icon>
      <path d="M12 3.8 18.5 7v5.4c0 3.6-2.5 5.9-6.5 7.8-4-1.9-6.5-4.2-6.5-7.8V7z" />
      <path d="M12 10.2v4.2" />
      <circle cx="12" cy="8.2" r="0.9" fill="currentColor" stroke="none" />
    </Icon>
  ),
  setting: (
    <Icon>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.2" />
      <path d="M12 18.3v2.2" />
      <path d="M3.5 12h2.2" />
      <path d="M18.3 12h2.2" />
      <path d="M6.2 6.2l1.6 1.6" />
      <path d="M16.2 16.2l1.6 1.6" />
      <path d="M17.8 6.2l-1.6 1.6" />
      <path d="M7.8 16.2l-1.6 1.6" />
    </Icon>
  ),
  conflict: (
    <Icon>
      <path d="M6.2 4.5 9.8 12 6.2 19.5" />
      <path d="M17.8 4.5 14.2 12 17.8 19.5" />
      <path d="M9.2 12h5.6" />
    </Icon>
  ),
  resolution: (
    <Icon>
      <path d="M4.5 12h15" />
      <path d="M12 4.5v15" />
      <circle cx="12" cy="12" r="6.5" />
    </Icon>
  ),
  discovery: (
    <Icon>
      <circle cx="10.5" cy="10.5" r="5.2" />
      <path d="M14.5 14.5 19.2 19.2" />
    </Icon>
  ),
  application: (
    <Icon>
      <circle cx="12" cy="12" r="1.6" />
      <path d="M12 5a7 7 0 1 1-7 7" />
      <path d="M12 8.2a3.8 3.8 0 1 1-3.8 3.8" />
    </Icon>
  ),
  whiteHole: (
    <Icon>
      <circle cx="12" cy="12" r="1.6" />
      <path d="M12 5a7 7 0 1 1-7 7" />
      <path d="M12 8.2a3.8 3.8 0 1 1-3.8 3.8" />
    </Icon>
  ),
  prizeOrder: (
    <Icon>
      <path d="M8.5 4.5h7v3.2a3.5 3.5 0 0 1-7 0z" />
      <path d="M8.5 5.2H6.2a2.2 2.2 0 0 0 2.2 2.2" />
      <path d="M15.5 5.2h2.3a2.2 2.2 0 0 1-2.3 2.2" />
      <path d="M10.2 10.8h3.6v2.2H10.2z" />
      <path d="M9 13h6v6.5H9z" />
    </Icon>
  ),
};

const TONES = ["energy", "water", "compute"];

export function MechanicIcon({ name, toneIndex = 0 }) {
  const glyph = icons[name];
  if (!glyph) return null;
  const tone = TONES[toneIndex % TONES.length];
  return (
    <span className={`about-mechanic-icon about-mechanic-icon--${tone}`} aria-hidden="true">
      {glyph}
    </span>
  );
}
