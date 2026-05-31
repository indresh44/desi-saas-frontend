/**
 * Ledger Design System — TypeScript token map.
 *
 * Pure data, no React. Use these to drive component variants
 * without re-spelling token names across the codebase. Anything
 * a designer might tweak (label, icon, colour token name) lives
 * here, not inside individual components.
 *
 * Spec: Docs/../design_handoff_ledger/Ledger Design System.md
 * Sections: §3.2 (stage status) · §3.3 (follow-up status) · §8.
 */

// ── Pipeline stage ────────────────────────────────────────────
// Spec §3.2, §8. The five stages a lead can be in.

export type StageId = "new" | "interested" | "visit" | "wip" | "completed";

export interface StageSpec {
  id: StageId;
  label: string;
  /** CSS var for foreground colour. */
  fg: string;
  /** CSS var for background tint. */
  bg: string;
}

export const STAGES: Record<StageId, StageSpec> = {
  new: {
    id: "new",
    label: "New Enquiry",
    fg: "var(--stage-new-fg)",
    bg: "var(--stage-new-bg)",
  },
  interested: {
    id: "interested",
    label: "Interested",
    fg: "var(--stage-interested-fg)",
    bg: "var(--stage-interested-bg)",
  },
  visit: {
    id: "visit",
    label: "Site Visit Scheduled",
    fg: "var(--stage-visit-fg)",
    bg: "var(--stage-visit-bg)",
  },
  wip: {
    id: "wip",
    label: "WIP",
    fg: "var(--stage-wip-fg)",
    bg: "var(--stage-wip-bg)",
  },
  completed: {
    id: "completed",
    label: "Completed",
    fg: "var(--stage-done-fg)",
    bg: "var(--stage-done-bg)",
  },
};

// ── Follow-up status ──────────────────────────────────────────
// Spec §3.3, §7.7, §8. The seven follow-up states. "Due today"
// reuses --color-accent intentionally — the most actionable item
// shares the brand colour.

export type FollowupKind =
  | "overdue"
  | "unset"
  | "today"
  | "scheduled"
  | "quiet"
  | "closed"
  | "none";

export interface FollowupSpec {
  kind: FollowupKind;
  /** Default label when callers don't provide their own copy. */
  defaultLabel: string;
  /** CSS var driving the foreground colour. */
  color: string;
  /** Optional CSS var for a soft background tint. */
  bg?: string;
  /** Lucide-style icon name — caller picks the actual icon component. */
  icon: "alarm" | "calendar" | "clock" | "check" | "nudge" | "x";
  /** Whether this state earns a left status-stripe. Spec §7.13. */
  stripe: boolean;
}

export const FOLLOWUPS: Record<FollowupKind, FollowupSpec> = {
  overdue: {
    kind: "overdue",
    defaultLabel: "Overdue",
    color: "var(--follow-overdue)",
    bg: "var(--follow-overdue-bg)",
    icon: "alarm",
    stripe: true,
  },
  unset: {
    kind: "unset",
    defaultLabel: "Set a follow-up",
    color: "var(--follow-unset)",
    icon: "calendar",
    stripe: true,
  },
  today: {
    kind: "today",
    defaultLabel: "Follow up today",
    color: "var(--color-accent)",
    icon: "clock",
    stripe: true,
  },
  scheduled: {
    kind: "scheduled",
    defaultLabel: "Follow-up scheduled",
    color: "var(--color-text-muted)",
    icon: "calendar",
    stripe: false,
  },
  quiet: {
    kind: "quiet",
    defaultLabel: "Gone quiet — nudge?",
    color: "var(--color-text-faint)",
    icon: "nudge",
    stripe: false,
  },
  closed: {
    kind: "closed",
    defaultLabel: "Closed",
    color: "var(--follow-done)",
    icon: "check",
    stripe: false,
  },
  none: {
    kind: "none",
    defaultLabel: "No follow-up",
    color: "var(--color-text-faint)",
    icon: "calendar",
    stripe: false,
  },
};

// ── Radius shorthands ─────────────────────────────────────────
// Inline-style helpers so non-Tailwind consumers can read tokens
// without re-typing the var() expression.

export const RADIUS = {
  card: "var(--ledger-radius-card)",
  control: "var(--ledger-radius-control)",
  badge: "var(--ledger-radius-badge)",
  pill: "var(--ledger-radius-pill)",
  sm: "var(--ledger-radius-sm)",
} as const;
