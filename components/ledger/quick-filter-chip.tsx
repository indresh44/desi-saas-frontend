"use client";

import { cn } from "@/lib/utils";

/**
 * Quick-filter chip — §7.11. Horizontal-scroll friendly. Three
 * visual states: default, selected (terracotta fill), danger
 * (overdue red text + tinted border).
 *
 * Use inside a `<LedgerChipScroller>` to get the right scroll
 * shadows + gap on mobile.
 */
export function LedgerQuickFilterChip({
  label,
  count,
  selected = false,
  danger = false,
  onClick,
  className,
}: {
  label: React.ReactNode;
  count?: number;
  selected?: boolean;
  danger?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const baseStyle: React.CSSProperties = selected
    ? {
        background: "var(--color-accent)",
        borderColor: "var(--color-accent)",
        color: "var(--color-accent-contrast)",
      }
    : danger
      ? {
          background: "var(--color-surface)",
          borderColor: "color-mix(in oklch, var(--follow-overdue) 30%, var(--color-border))",
          color: "var(--follow-overdue)",
        }
      : {
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
          color: "var(--color-text-secondary)",
        };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex shrink-0 items-center gap-[6px] whitespace-nowrap text-[13px] font-semibold transition-colors",
        className,
      )}
      style={{
        height: 32,
        padding: "0 13px",
        borderRadius: "var(--ledger-radius-pill)",
        border: "1px solid",
        ...baseStyle,
      }}
    >
      {label}
      {count != null && (
        <span
          className="ledger-mono text-[12px] font-semibold"
          style={{
            color: selected
              ? "color-mix(in oklch, var(--color-accent-contrast) 75%, transparent)"
              : danger
                ? "var(--follow-overdue)"
                : "var(--color-text-faint)",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/** Horizontal scroller for chips — clips edge-to-edge on mobile. */
export function LedgerChipScroller({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex gap-2 overflow-x-auto", className)}
      style={{
        // Hide native scrollbars across browsers — long chip rows
        // belong to the visual rhythm, not the scroll metaphor.
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {children}
    </div>
  );
}
