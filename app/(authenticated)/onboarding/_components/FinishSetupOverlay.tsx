"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import sellNSettleIcon from "@/app/sellnsettle-icon.png";

// Premium "Finish Setup" transition. Sequenced animation:
//  ─ overlay fades in over a brand-blue mesh
//  ─ logo blooms with a halo
//  ─ "Setting up your workspace" appears
//  ─ glassmorphism card surfaces; three steps tick on with halo-pulse
//  ─ progress bar fills, "Welcome, {name}." appears
//  ─ "Start your journey" CTA appears — user clicks to leave
//
// Total ~3s of animation, then the user controls the redirect. This keeps the
// final moment readable instead of auto-bouncing past the welcome.
//
// Props:
// - apiReady: parent indicates the backend `complete` call has resolved. While
//   false, the CTA shows a spinner instead of being clickable.
// - onContinue: fires when the user clicks the CTA. Parent does the redirect.

type Props = {
  userName?: string | null;
  apiReady: boolean;
  onContinue: () => void;
};

const STEPS: { id: string; label: string }[] = [
  { id: "workspace", label: "Workspace created" },
  { id: "pipeline", label: "Pipeline ready" },
  { id: "language", label: "Language preferences saved" },
];

export function FinishSetupOverlay({ userName, apiReady, onContinue }: Props) {
  const [tickedCount, setTickedCount] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    // Animation timeline. After the CTA appears, we wait for the user to click.
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setTickedCount(1), 1000));
    timers.push(setTimeout(() => setTickedCount(2), 1450));
    timers.push(setTimeout(() => setTickedCount(3), 1900));
    timers.push(setTimeout(() => setShowWelcome(true), 2400));
    timers.push(setTimeout(() => setShowCta(true), 2750));
    return () => timers.forEach(clearTimeout);
  }, []);

  const firstName = (userName ?? "").trim().split(" ")[0] || null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Setting up your workspace"
    >
      {/* Mesh backdrop — animated radial gradients on top of base blue */}
      <div className="finish-overlay-backdrop absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-[460px] flex-col items-center gap-6 px-6 text-white">
        {/* Logo with halo */}
        <div className="finish-overlay-logo relative">
          <div className="finish-overlay-logo-halo" aria-hidden="true" />
          <Image
            src={sellNSettleIcon}
            alt=""
            width={56}
            height={56}
            priority
            aria-hidden="true"
          />
        </div>

        <h1
          className="finish-overlay-heading text-center text-2xl font-semibold leading-tight tracking-tight md:text-3xl"
          style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
        >
          Setting up your workspace
        </h1>

        {/* Glassmorphism card */}
        <div className="finish-overlay-card w-full">
          <ul className="flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <Row
                key={step.id}
                label={step.label}
                ticked={tickedCount > i}
              />
            ))}
          </ul>

          {/* Progress strip — shimmer stops once all steps are checked. */}
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="finish-overlay-progress h-full rounded-full"
              data-complete={tickedCount === STEPS.length ? "true" : "false"}
              style={{
                width: `${Math.round((tickedCount / STEPS.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Welcome message */}
        <div className="flex min-h-[3rem] flex-col items-center justify-center text-center">
          {showWelcome ? (
            <p
              className="finish-overlay-welcome text-lg font-medium md:text-xl"
              style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
            >
              {firstName ? (
                <>
                  Welcome, <span style={{ color: "#FFD4A8" }}>{firstName}</span>.
                </>
              ) : (
                <>You&rsquo;re all set.</>
              )}
            </p>
          ) : null}
        </div>

        {/* CTA — appears after the choreography. While the API call is still
            in flight (apiReady=false), show a spinner instead of letting the
            user click into a half-finished setup. */}
        {showCta ? (
          <button
            type="button"
            onClick={onContinue}
            disabled={!apiReady}
            className="finish-overlay-cta inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all hover:translate-y-[-1px] disabled:cursor-wait disabled:opacity-80"
            style={{
              background: "#ffffff",
              color: "var(--brand-blue-deep)",
              boxShadow: "0 12px 28px rgba(0, 0, 0, 0.18)",
              minWidth: "240px",
            }}
          >
            {apiReady ? (
              <>
                Start your journey <span aria-hidden="true">→</span>
              </>
            ) : (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Finishing setup…
              </>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Row({ label, ticked }: { label: string; ticked: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <div
        className={
          "finish-overlay-badge relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full " +
          (ticked ? "is-ticked" : "")
        }
        aria-hidden="true"
      >
        {/* Halo pulse ring */}
        <span className="finish-overlay-badge-halo" />

        {/* Stroke-drawn checkmark */}
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path className="finish-overlay-badge-check" d="M5 12.5 L10 17 L19 7" />
        </svg>
      </div>
      <span
        className={
          "text-[15px] transition-opacity duration-300 " +
          (ticked ? "text-white" : "text-white/55")
        }
      >
        {label}
      </span>
    </li>
  );
}
