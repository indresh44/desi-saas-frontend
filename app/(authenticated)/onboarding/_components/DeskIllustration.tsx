// Decorative desk illustration for the left panel. Laptop, plant, coffee.
// The plant sways and the laptop screen blinks subtly. Purely decorative —
// aria-hidden.

export function DeskIllustration() {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      className="w-full max-w-[260px]"
      aria-hidden="true"
    >
      {/* desk surface */}
      <path
        d="M20 150 L220 150"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* laptop */}
      <g>
        <rect
          x="70"
          y="70"
          width="100"
          height="70"
          rx="6"
          fill="rgba(255,255,255,0.12)"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.75"
        />
        <rect
          className="illus-screen"
          x="76"
          y="76"
          width="88"
          height="55"
          rx="3"
          fill="rgba(255,255,255,0.35)"
        />
        {/* fake UI bars */}
        <rect x="82" y="82" width="28" height="4" rx="1" fill="rgba(22,119,255,0.8)" />
        <rect x="82" y="90" width="50" height="3" rx="1" fill="rgba(255,255,255,0.85)" />
        <rect x="82" y="96" width="40" height="3" rx="1" fill="rgba(255,255,255,0.7)" />
        <rect x="82" y="108" width="60" height="14" rx="2" fill="rgba(22,119,255,0.35)" />
        {/* keyboard strip */}
        <path
          d="M62 140 L178 140 L174 150 L66 150 Z"
          fill="rgba(255,255,255,0.2)"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.5"
        />
      </g>

      {/* plant on the left */}
      <g className="illus-plant">
        <rect
          x="28"
          y="128"
          width="24"
          height="22"
          rx="2"
          fill="rgba(234,138,27,0.75)"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.5"
        />
        <path
          d="M40 128 C40 115 33 108 28 110 M40 128 C40 118 47 112 52 114 M40 128 C40 120 38 112 40 104"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.75"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* coffee cup on the right */}
      <g>
        <path
          d="M190 128 L212 128 L210 146 Q208 150 201 150 Q194 150 192 146 Z"
          fill="rgba(255,255,255,0.2)"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M212 132 Q220 132 220 138 Q220 144 212 144"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* steam */}
        <path
          d="M198 118 C198 114 201 114 201 118 M205 118 C205 114 208 114 208 118"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
