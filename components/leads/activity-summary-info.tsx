"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info, Sparkles } from "lucide-react";

// "i" button that reveals a lead's AI activity summary. Opens on hover
// (mouse) and on tap (touch), with click-outside / Escape to dismiss.
// Rendered in a portal so it isn't clipped by `overflow-hidden` ancestors
// (the dashboard card) or table cells. Shared by the enquiry list (desktop
// table + mobile card).

export function ActivitySummaryInfo({ summary }: { summary: string }) {
  const [pinned, setPinned] = useState(false); // tap / click toggled
  const [hovered, setHovered] = useState(false); // mouse hover (desktop)
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const showing = pinned || hovered;

  // Position the portal under the button; keep it on-screen on narrow
  // viewports. Re-anchor on scroll/resize while open.
  useEffect(() => {
    if (!showing) return;
    function place() {
      const el = btnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.min(320, window.innerWidth * 0.9);
      const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
      setPos({ top: r.bottom + 6, left });
    }
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [showing]);

  // Dismiss the tap-pinned popover on outside click / Escape.
  useEffect(() => {
    if (!pinned) return;
    function onDown(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setPinned(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPinned(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [pinned]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="Activity summary"
        aria-expanded={showing}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPinned((p) => !p);
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setHovered(false);
        }}
        className="inline-flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full transition-colors"
        style={{
          color: showing ? "var(--color-accent)" : "var(--color-text-faint)",
          background: showing ? "var(--color-accent-soft)" : "transparent",
        }}
      >
        <Info className="h-[13px] w-[13px]" strokeWidth={2} />
      </button>
      {showing && pos && typeof document !== "undefined"
        ? createPortal(
            <div
              role="tooltip"
              className="fixed z-[60] rounded-lg border p-3 text-[12.5px] leading-relaxed shadow-lg"
              style={{
                top: pos.top,
                left: pos.left,
                width: "min(320px, 90vw)",
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-secondary)",
              }}
            >
              <p
                className="mb-1 flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.06em]"
                style={{ color: "var(--color-accent)" }}
              >
                <Sparkles className="h-3 w-3" /> Activity summary
              </p>
              {summary}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
