"use client";

// Right-rail summary card — "Needs you" counts strip and Recent enquiries.
// Build plan §E: DESKTOP-ONLY (hidden on mobile via the dashboard's
// responsive grid; this component just renders its content). Tapping a
// count scrolls to that group's anchor in the action stream.
//
// Visual: Ledger §13.4. Each row = a coloured dot + label + mono count on
// a baseline, with a proportional bar below. Colours come from the
// follow-up token map so the rail stays in sync with the card stripes
// and the action-card pills.

import Link from "next/link";
import { Eyebrow, StageBadge } from "@/components/ledger";
import type { Lead } from "@/lib/types/lead";
import type { NextActionType } from "@/lib/types/next-action";
import { HOME_NEEDS_ACTION_TYPES } from "@/lib/types/next-action";

interface NeedsYouRailProps {
  countsByType: Record<NextActionType, number>;
  recentLeads: Lead[];
}

// CSS-var colour for each cascade type. Mirrors the action-card stripe
// rules so the rail visually matches the cards it summarises. "Gone
// quiet" uses the calm faint colour per §13.4.
const COLOR_FOR_TYPE: Record<
  Exclude<NextActionType, "followup_upcoming" | "none">,
  string
> = {
  followup_overdue: "var(--follow-overdue)",
  followup_due_today: "var(--color-accent)",
  no_followup_set: "var(--follow-unset)",
  gone_quiet: "var(--color-text-faint)",
};

export function NeedsYouRail({ countsByType, recentLeads }: NeedsYouRailProps) {
  // Filter to non-zero buckets so the rail stays calm when groups are
  // empty (matching the build plan's "empty groups hidden" rule).
  const visibleBuckets = HOME_NEEDS_ACTION_TYPES.filter(
    (type) => (countsByType[type] ?? 0) > 0,
  );

  // Proportional bar widths: each bar is (count / max-count) of the bar
  // track. Falls back to 0 when everything's empty (visibleBuckets is []
  // in that case and the whole block hides).
  const maxCount = visibleBuckets.reduce(
    (max, type) => Math.max(max, countsByType[type] ?? 0),
    0,
  );

  return (
    <aside
      className="sticky top-6 space-y-6 p-5"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--ledger-radius-control)",
      }}
    >
      {visibleBuckets.length > 0 ? (
        <section>
          <Eyebrow className="mb-3 block">Needs you</Eyebrow>
          <ul className="space-y-2">
            {visibleBuckets.map((type) => {
              const count = countsByType[type] ?? 0;
              const color =
                COLOR_FOR_TYPE[
                  type as Exclude<NextActionType, "followup_upcoming" | "none">
                ];
              const widthPct =
                maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
              return (
                <li key={type}>
                  <a
                    href={`#group-${type}`}
                    className="grid grid-cols-[8px_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-1.5 py-2 transition"
                    style={{ color: "var(--color-text)" }}
                  >
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full"
                      style={{ background: color }}
                    />
                    <span className="min-w-0">
                      <span
                        className="block truncate text-[13.5px] font-semibold leading-tight"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {shortLabel(type)}
                      </span>
                      <span
                        className="mt-1.5 block h-1.5 overflow-hidden rounded-full"
                        style={{ background: "var(--color-surface-raised)" }}
                      >
                        <span
                          aria-hidden
                          className="block h-full rounded-full"
                          style={{ width: `${widthPct}%`, background: color }}
                        />
                      </span>
                    </span>
                    <span
                      className="ledger-mono text-right text-[17px] font-bold leading-none tabular-nums"
                      style={{ color: "var(--color-text)" }}
                    >
                      {count}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section>
        <div className="mb-2 flex items-center justify-between gap-2">
          <Eyebrow>Recent enquiries</Eyebrow>
          <Link
            href="/leads"
            className="whitespace-nowrap text-[12.5px] font-semibold transition hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            View all →
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <p
            className="py-2 text-[12.5px]"
            style={{ color: "var(--color-text-muted)" }}
          >
            No enquiries yet.
          </p>
        ) : (
          <ul
            className="divide-y"
            style={{ borderColor: "var(--color-border-subtle)" }}
          >
            {recentLeads.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/leads/${lead.id}`}
                  className="block rounded px-1 py-2.5 transition"
                >
                  <p
                    className="truncate text-[14px] font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {lead.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    {lead.customerName ? (
                      <span
                        className="min-w-0 flex-1 truncate text-[12.5px]"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {lead.customerName}
                      </span>
                    ) : (
                      <span className="flex-1" />
                    )}
                    {lead.stageName ? (
                      <StageBadge
                        name={lead.stageName}
                        color={lead.stageColor}
                        withDot={false}
                      />
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}

// Shorter labels for the rail's narrow column. The action-list section
// headers use the full `groupLabel` ("Overdue follow-ups"); the rail
// uses one or two words.
function shortLabel(type: NextActionType): string {
  switch (type) {
    case "followup_overdue":
      return "Overdue";
    case "followup_due_today":
      return "Due today";
    case "no_followup_set":
      return "No follow-up";
    case "gone_quiet":
      return "Gone quiet";
    default:
      return type;
  }
}
