"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import sellNSettleIcon from "@/app/sellnsettle-icon.png";
import { DeskIllustration } from "./DeskIllustration";

// Left panel with blue gradient, decorative orbs, desk illustration, heading,
// description, and a progress strip at the bottom.
//
// `heading` can include a `<em>...</em>` segment which we style as italic +
// brand-orange to match the prototype's accent word (e.g. "workspace.").

type Props = {
  heading: ReactNode;
  description: string;
  stepLabel: string;
  stepNumber: 1 | 2 | 3;
  totalSteps?: number;
};

export function LeftPanel({
  heading,
  description,
  stepLabel,
  stepNumber,
  totalSteps = 3,
}: Props) {
  const percent = Math.round((stepNumber / totalSteps) * 100);

  return (
    <aside
      className="relative hidden overflow-hidden px-10 py-12 text-white md:flex md:w-2/5 md:shrink-0 md:flex-col md:justify-between"
      style={{
        background:
          "linear-gradient(135deg, var(--brand-blue-deep) 0%, var(--brand-blue-dark) 45%, var(--brand-blue) 100%)",
      }}
    >
      {/* Decorative orbs */}
      <div
        aria-hidden="true"
        className="orb pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--brand-orange-soft)" }}
      />
      <div
        aria-hidden="true"
        className="orb pointer-events-none absolute -right-10 bottom-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--brand-blue-soft)", animationDelay: "3s" }}
      />

      {/* Top — branding (matches login/forgot-password treatment) */}
      <div className="relative z-10 flex items-center gap-2">
        <Image
          src={sellNSettleIcon}
          alt="SellNSettle"
          width={32}
          height={32}
          priority
        />
        <span
          className="text-lg font-black tracking-tight"
          style={{ color: "#E8862E" }}
        >
          SellNSettle
        </span>
      </div>

      {/* Middle — heading + description + illustration */}
      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex justify-center">
          <DeskIllustration />
        </div>

        <div>
          <h1
            className="text-4xl font-bold leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "var(--brand-blue-light)" }}
          >
            {heading}
          </h1>
          <p className="mt-3 text-md leading-relaxed text-white/80">
            {description}
          </p>
        </div>
      </div>

      {/* Bottom — progress strip */}
      <div className="relative z-10">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
          {stepLabel}
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="progress-fill h-full rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </aside>
  );
}

// Helper to render the heading with an italic orange accent segment, e.g.:
//   renderAccentHeading("Let's set up your ", "workspace.")
export function renderAccentHeading(prefix: string, accent: string) {
  return (
    <>
      {prefix}
      <em
        className="not-italic"
        style={{
          fontStyle: "italic",
          color: "var(--brand-orange)",
        }}
      >
        {accent}
      </em>
    </>
  );
}
