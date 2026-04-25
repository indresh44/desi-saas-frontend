// Camera body + pulsing lens + blinking flash. Named groups .lens and
// .flash are animated from the parent card's hover state.

export function PhotographerIcon() {
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
      {/* hot-shoe + flash bump */}
      <path d="M13 9 L13 7 L18 7 L18 9" />
      <g className="flash">
        <path d="M14.5 5.5 L17 5.5" />
        <path d="M15 4 L16.5 4" />
      </g>

      {/* camera body */}
      <rect x="5" y="9" width="22" height="15" rx="2" />

      {/* small viewfinder LED */}
      <circle cx="8" cy="12" r="0.7" />

      {/* outer lens ring */}
      <circle cx="16" cy="17" r="5" />

      {/* inner lens (pulses) */}
      <g className="lens">
        <circle cx="16" cy="17" r="3" />
        <circle cx="16" cy="17" r="1.3" />
      </g>
    </svg>
  );
}
