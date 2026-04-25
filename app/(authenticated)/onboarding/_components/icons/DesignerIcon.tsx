// Couch + floor lamp. The lampshade group uses `.lens` so it picks up the
// existing `.onboarding-theme .group:hover .icon-anim .lens` pulse rule in
// globals.css.

export function DesignerIcon() {
  return (
    <svg
      className="icon-anim"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* picture frame on the wall */}
      <rect x="4.4" y="4" width="7" height="6" rx="0.5" />
      {/* mountain + sun detail inside frame */}
      <path d="M5.5 8.5 L7.5 6.5 L9 8 L10.5 6.5 L11.5 8.5" />

      {/* lamp shade (animated pulse on hover) */}
      <g className="lens">
        <path d="M24 8 L28 8 L29.5 13 L22.5 13 Z" />
      </g>

      {/* lamp pole */}
      <path d="M26 13 L26 24" />

      {/* lamp base */}
      <path d="M24 24 L28 24" />

      {/* couch backrest with rounded top */}
      <path d="M5 19 L5 15 Q5 13 7 13 L17 13 Q19 13 19 15 L19 19" />

      {/* backrest cushion divider */}
      <path d="M12 13 L12 19" />

      {/* seat + armrests (extends wider than backrest) */}
      <path d="M3 19 L3 22 Q3 24 5 24 L19 24 Q21 24 21 22 L21 19 Z" />

      {/* seat cushion divider */}
      <path d="M12 19 L12 24" />

      {/* legs */}
      <path d="M5 24 L5 26" />
      <path d="M19 24 L19 26" />
    </svg>
  );
}
