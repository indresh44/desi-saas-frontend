import React from "react";

interface LandingBadgeProps {
  children: React.ReactNode;
}

export function LandingBadge({ children }: LandingBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 border border-teal-200 text-xs font-semibold text-teal-700 uppercase tracking-wide opacity-0 animate-fadeUp [animation-delay:100ms]">
      <span className="inline-block w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
      {children}
    </div>
  );
}
