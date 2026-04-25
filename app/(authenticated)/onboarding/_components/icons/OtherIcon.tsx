// Four pulsing dots + center spinning spark. Each dot animates with
// a 120ms stagger. .spark rotates.

export function OtherIcon() {
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
      {/* four orbiting dots */}
      <g>
        <circle className="dot-a" cx="16" cy="7" r="1.6" fill="currentColor" stroke="none" />
        <circle className="dot-b" cx="25" cy="16" r="1.6" fill="currentColor" stroke="none" />
        <circle className="dot-c" cx="16" cy="25" r="1.6" fill="currentColor" stroke="none" />
        <circle className="dot-d" cx="7" cy="16" r="1.6" fill="currentColor" stroke="none" />
      </g>

      {/* center sparkle */}
      <g className="spark">
        <path d="M16 12 L16 20" />
        <path d="M12 16 L20 16" />
        <path d="M13.5 13.5 L18.5 18.5" />
        <path d="M18.5 13.5 L13.5 18.5" />
      </g>
    </svg>
  );
}
