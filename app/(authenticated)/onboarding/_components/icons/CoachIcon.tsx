// Graduation cap + swaying tassel. .cap bounces, .tassel rotates.

export function CoachIcon() {
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
      {/* cap group — bounces as a whole */}
      <g className="cap">
        {/* mortarboard */}
        <path d="M4 13 L16 7 L28 13 L16 19 Z" />
        {/* top button */}
        <circle cx="16" cy="13" r="0.7" fill="currentColor" stroke="none" />
        {/* cap base (below mortarboard) */}
        <path d="M10 15.7 L10 20 Q10 22 16 22 Q22 22 22 20 L22 15.7" />
      </g>

      {/* tassel cord — static */}
      <path d="M23.5 13 L23.5 17" />

      {/* tassel fringe — sways */}
      <g className="tassel">
        <path d="M23.5 17 L22.5 20.5" />
        <path d="M23.5 17 L23.5 20.5" />
        <path d="M23.5 17 L24.5 20.5" />
      </g>
    </svg>
  );
}
