"use client";

// Forward-facing AI panel slot. Build plan §F: distinct visual treatment,
// two card kinds (Approve / Result), HIDDEN when empty.
//
// Wiring to a real source (agent_tasks awaiting-approval / recently-done)
// is OUT OF SCOPE for this pass — the build plan explicitly parks it.
// Component takes typed props so the swap is a one-line change at the
// dashboard call site once the AI-task surface lands.
//
// Hide-when-empty is enforced by returning null. Don't show a "no items"
// state — empty rail is calm, not anxiety-inducing.
//
// Visual: Ledger §13.2 — the one large accent-tinted surface in the
// system. Warm terracotta tint, sparkles tile, mono count chip.

import { Sparkles } from "lucide-react";
import { LedgerButton } from "@/components/ledger";

export type AiPanelKind = "approve" | "result";

export interface AiPanelItem {
  id: string;
  kind: AiPanelKind;
  title: string;
  subtitle?: string;
  /** Primary CTA (e.g. "Review & send"). Optional — `kind:"result"` rows
   *  may only need a "Review" affordance. */
  primaryAction?: { label: string; onClick: () => void };
  /** Secondary CTA (e.g. "Dismiss"). Optional. */
  secondaryAction?: { label: string; onClick: () => void };
}

interface AiPanelProps {
  items: AiPanelItem[];
}

export function AiPanel({ items }: AiPanelProps) {
  if (items.length === 0) return null;

  return (
    <section
      className="p-[18px]"
      style={{
        background: "var(--color-accent-soft)",
        border: "1px solid color-mix(in oklch, var(--color-accent) 20%, transparent)",
        borderRadius: "var(--ledger-radius-control)",
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <div
          className="flex h-[30px] w-[30px] items-center justify-center"
          style={{
            background: "var(--color-accent)",
            color: "var(--color-accent-contrast)",
            borderRadius: "9px",
          }}
        >
          <Sparkles className="size-[16px]" strokeWidth={1.8} />
        </div>
        <h2
          className="text-[15px] font-bold"
          style={{ color: "var(--color-text)" }}
        >
          Your assistant
        </h2>
        <span
          className="ledger-mono ml-auto text-[11px] font-semibold"
          style={{
            color: "color-mix(in oklch, var(--color-accent) 78%, var(--color-text))",
            background: "color-mix(in oklch, var(--color-accent-soft) 60%, var(--color-surface))",
            border: "1px solid color-mix(in oklch, var(--color-accent) 22%, transparent)",
            padding: "2px 8px",
            borderRadius: "var(--ledger-radius-pill)",
          }}
        >
          {items.length}
        </span>
      </div>

      <ul
        className="space-y-2 border-t pt-3"
        style={{
          borderColor: "color-mix(in oklch, var(--color-accent) 16%, transparent)",
        }}
      >
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center"
            style={{
              background: "var(--color-surface)",
              border: "1px solid color-mix(in oklch, var(--color-accent) 18%, transparent)",
              borderRadius: "var(--ledger-radius-control)",
            }}
          >
            <span
              className="inline-flex w-fit items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]"
              style={{
                color:
                  item.kind === "approve"
                    ? "var(--follow-unset)"
                    : "var(--color-accent)",
                background:
                  item.kind === "approve"
                    ? "color-mix(in oklch, var(--follow-unset) 14%, var(--color-surface))"
                    : "var(--color-accent-soft)",
                borderRadius: "var(--ledger-radius-sm)",
              }}
            >
              {item.kind === "approve" ? "Approve" : "Result"}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="text-[14px] font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                {item.title}
              </p>
              {item.subtitle ? (
                <p
                  className="mt-0.5 text-[12.5px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {item.subtitle}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {item.primaryAction ? (
                <LedgerButton
                  variant="primary"
                  size="sm"
                  onClick={item.primaryAction.onClick}
                >
                  {item.primaryAction.label}
                </LedgerButton>
              ) : null}
              {item.secondaryAction ? (
                <LedgerButton
                  variant="action"
                  size="sm"
                  onClick={item.secondaryAction.onClick}
                >
                  {item.secondaryAction.label}
                </LedgerButton>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
