"use client";

import { forwardRef } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Form controls — §7.4 (Search · Select · DateRange) and §7.5
 * (segmented control). All share the 42px height + 8px radius
 * line so they sit on the same toolbar baseline.
 */

// ── Search input ──────────────────────────────────────────────
export interface LedgerSearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  className?: string;
}

export const LedgerSearchInput = forwardRef<HTMLInputElement, LedgerSearchInputProps>(
  function LedgerSearchInput({ className, placeholder = "Search…", ...props }, ref) {
    return (
      <div
        className={cn("flex items-center gap-[10px]", className)}
        style={{
          height: 42,
          padding: "0 14px",
          borderRadius: "var(--ledger-radius-control)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <Search
          aria-hidden
          className="size-[17px] shrink-0"
          strokeWidth={1.8}
          style={{ color: "var(--color-text-faint)" }}
        />
        <input
          ref={ref}
          type="search"
          placeholder={placeholder}
          className="min-w-0 flex-1 border-none bg-transparent text-[14px] outline-none placeholder:opacity-100"
          style={{
            color: "var(--color-text)",
            fontFamily: "var(--ledger-font-sans)",
          }}
          {...props}
        />
      </div>
    );
  },
);

// ── Select box (display-only trigger; wire up to your menu lib) ─
export function LedgerSelectBox({
  label,
  className,
  onClick,
  height = 42,
}: {
  label: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** 42 (toolbar) or 34 (sub-bar). */
  height?: 34 | 42;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("inline-flex items-center gap-2 text-[13.5px] font-medium", className)}
      style={{
        height,
        padding: "0 13px",
        borderRadius: "var(--ledger-radius-control)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text-secondary)",
      }}
    >
      {label}
      <ChevronDown
        aria-hidden
        className="size-[14px]"
        strokeWidth={1.8}
        style={{ color: "var(--color-text-faint)" }}
      />
    </button>
  );
}

// ── Date range trigger ────────────────────────────────────────
export function LedgerDateRange({
  label = "Added",
  value = "dd/mm/yy → dd/mm/yy",
  onClick,
  className,
}: {
  label?: string;
  value?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("inline-flex items-center gap-2 text-[12px]", className)}
      style={{
        height: 42,
        padding: "0 13px",
        borderRadius: "var(--ledger-radius-control)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text-faint)",
        fontFamily: "var(--ledger-font-mono)",
      }}
    >
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.04em]"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </span>
      {value}
    </button>
  );
}

// ── Segmented control (group / sort) ──────────────────────────
export interface SegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export function LedgerSegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (next: T) => void;
  options: SegmentOption<T>[];
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex gap-[2px]", className)}
      style={{
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--ledger-radius-control)",
        padding: 3,
      }}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={selected}
            type="button"
            onClick={() => onChange(opt.value)}
            className="text-[13px] font-medium transition-colors"
            style={{
              padding: "5px 12px",
              borderRadius: "var(--ledger-radius-sm)",
              background: selected ? "var(--color-surface)" : "transparent",
              color: selected ? "var(--color-text)" : "var(--color-text-muted)",
              boxShadow: selected ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
