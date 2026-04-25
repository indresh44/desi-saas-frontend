"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import sellNSettleIcon from "@/app/sellnsettle-icon.png";
import { LeftPanel } from "./LeftPanel";

// Two-column split: left panel (hidden on mobile, shown ≥ md), right panel
// fills the rest. Mobile falls back to a compact blue header rendered inside
// the right-panel content via `mobileHeader` if provided.

type Props = {
  leftHeading: ReactNode;
  leftDescription: string;
  stepLabel: string;
  stepNumber: 1 | 2 | 3;
  totalSteps?: number;
  children: ReactNode;
};

export function OnboardingShell({
  leftHeading,
  leftDescription,
  stepLabel,
  stepNumber,
  totalSteps = 3,
  children,
}: Props) {
  return (
    <div className="onboarding-theme flex min-h-dvh flex-col md:flex-row">
      {/* Desktop left panel (md+). Hidden on mobile via its own class. */}
      <LeftPanel
        heading={leftHeading}
        description={leftDescription}
        stepLabel={stepLabel}
        stepNumber={stepNumber}
        totalSteps={totalSteps}
      />

      {/* Mobile-only compact header — stacks above the main content */}
      <MobileHeader
        heading={leftHeading}
        stepLabel={stepLabel}
        stepNumber={stepNumber}
        totalSteps={totalSteps}
      />

      <main className="flex min-w-0 flex-1 flex-col md:justify-center">
        <div className="mx-auto w-full max-w-[560px] px-6 py-10 md:px-12">
          {children}
        </div>
      </main>
    </div>
  );
}

function MobileHeader({
  heading,
  stepLabel,
  stepNumber,
  totalSteps,
}: {
  heading: ReactNode;
  stepLabel: string;
  stepNumber: 1 | 2 | 3;
  totalSteps: number;
}) {
  const percent = Math.round((stepNumber / totalSteps) * 100);
  return (
    <div
      className="relative w-full overflow-hidden px-6 pb-6 pt-8 text-white md:hidden"
      style={{
        background:
          "linear-gradient(135deg, var(--brand-blue-deep) 0%, var(--brand-blue) 100%)",
      }}
    >
      <div className="flex items-center gap-2">
        <Image
          src={sellNSettleIcon}
          alt="SellNSettle"
          width={24}
          height={24}
          priority
        />
        <span
          className="text-base font-black tracking-tight"
          style={{ color: "#E8862E" }}
        >
          SellNSettle
        </span>
      </div>
      <h1
        className="mt-3 text-2xl font-semibold leading-tight tracking-tight"
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" , color: "var(--brand-blue-light)" }}
      >
        {heading}
      </h1>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
          {stepLabel}
        </span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
          <div
            className="progress-fill h-full rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
