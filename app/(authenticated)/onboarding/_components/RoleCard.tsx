"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";

// Role card rendered as a <button role="radio"> inside a parent radiogroup.
// Keyboard accessible, focus ring visible, hover + selected animations via CSS.
//
// Props:
// - index: 0..n — sets --i for the staggered entrance animation
// - selected: drives aria-checked + visual state
// - icon: an SVG React element (expected to use currentColor so it inverts
//   to white on selected state via text-white)

type Props = {
  index: number;
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function RoleCard({
  index,
  id,
  title,
  description,
  icon,
  selected,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(id)}
      data-selected={selected ? "true" : "false"}
      className={[
        "group role-card-enter",
        "relative flex w-full items-center gap-4 rounded-2xl border-[1.5px] p-4 text-left transition-all duration-200",
        "min-h-[72px] cursor-pointer",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--brand-blue-glow)]",
        selected
          ? "border-[color:var(--brand-blue)] shadow-[0_0_0_3px_var(--brand-blue-glow)] scale-[1.015]"
          : "border-gray-300 hover:-translate-y-[3px] hover:border-[color:var(--brand-blue)] hover:shadow-sm",
      ].join(" ")}
      style={
        {
          // selection tint background without hardcoding hex
          background: selected ? "var(--brand-blue-tint)" : "white",
          "--i": index,
        } as React.CSSProperties
      }
    >
      {/* Icon container */}
      <div
        className={[
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
          selected ? "text-white" : "text-[color:var(--brand-blue)]",
          "group-hover:scale-[1.08] group-hover:-rotate-[3deg]",
        ].join(" ")}
        style={{
          background: selected ? "var(--brand-blue)" : "var(--brand-blue-tint)",
        }}
        aria-hidden="true"
      >
        <div className="h-8 w-8">{icon}</div>
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold text-gray-900">{title}</div>
        <div className="mt-0.5 text-[13px] text-gray-500">{description}</div>
      </div>

      {/* Check mark (only when selected) */}
      {selected ? (
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: "var(--brand-blue)" }}
          aria-hidden="true"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </div>
      ) : null}
    </button>
  );
}
