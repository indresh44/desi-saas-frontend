// Presentation helpers for the lead-detail activity timeline.
//
// The timeline row is the same markup for every activity type — these
// helpers decide what to show:
//   * activityLabel(a)             → the uppercase eyebrow label
//   * activityFallbackDescription  → muted line shown when row has no
//                                    typed description
//   * activityAccentColor(a)       → optional tint colour for the icon /
//                                    label on outcome rows; null = default
//   * isResolutionActivity(a)      → true for rows emitted by
//                                    resolve_followup (have a result_action
//                                    in payload). Used to gate the pencil.
//   * statusChangeTransition       → resolves status_change rows to a
//                                    "{from} → {to}" string using stageMap;
//                                    returns null if either side is unknown.
//
// All inputs come straight from the lead_activities row — particularly
// `payload`, which resolve_followup snapshots into so the timeline can
// render without joining lead_followups. NO join anywhere.

import type { LeadActivity } from "@/lib/types/activity";
import type { PipelineStage } from "@/lib/types/pipeline";

// ---------------------------------------------------------------------------
// Outcome → display label. Keep in sync with the backend Outcome enum in
// app/models/enums.py and OUTCOME_META in components/followup-card.
// ---------------------------------------------------------------------------

type Outcome =
  | "no_answer"
  | "busy"
  | "wrong_number"
  | "spoke_interested"
  | "spoke_later"
  | "spoke_not_interested"
  | "wa_sent"
  | "wa_replied"
  | "wa_later"
  | "wa_no_number";

type ResultAction =
  | "rescheduled"
  | "next_followup"
  | "closed"
  | "marked_done";

// Channel-prefixed labels per the spec. For no_answer we suffix with
// "(×N)" when attempt > 1 so the timeline shows the streak inline.
const OUTCOME_LABEL: Record<Outcome, { channel: "CALL" | "WHATSAPP"; suffix: string }> = {
  no_answer:            { channel: "CALL",     suffix: "NO ANSWER" },
  busy:                 { channel: "CALL",     suffix: "BUSY" },
  wrong_number:         { channel: "CALL",     suffix: "WRONG NUMBER" },
  spoke_interested:     { channel: "CALL",     suffix: "SPOKE — INTERESTED" },
  spoke_later:          { channel: "CALL",     suffix: "CALL ME LATER" },
  spoke_not_interested: { channel: "CALL",     suffix: "NOT INTERESTED" },
  wa_sent:              { channel: "WHATSAPP", suffix: "SENT" },
  wa_replied:           { channel: "WHATSAPP", suffix: "REPLIED" },
  wa_later:             { channel: "WHATSAPP", suffix: "REPLIED — NOT NOW" },
  wa_no_number:         { channel: "WHATSAPP", suffix: "NO NUMBER" },
};

const RESULT_ACTION_FALLBACK: Record<ResultAction, string> = {
  rescheduled:   "Rescheduled, follow-up still open",
  next_followup: "Next follow-up created",
  closed:        "Follow-up closed",
  marked_done:   "Marked done, no next step",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function payloadOf(a: LeadActivity): Record<string, unknown> | null {
  return a.payload ?? null;
}

function readString(p: Record<string, unknown> | null, key: string): string | null {
  if (!p) return null;
  const v = p[key];
  return typeof v === "string" ? v : null;
}

function readNumber(p: Record<string, unknown> | null, key: string): number | null {
  if (!p) return null;
  const v = p[key];
  return typeof v === "number" ? v : null;
}

function outcomeFrom(a: LeadActivity): Outcome | null {
  const raw = readString(payloadOf(a), "outcome");
  return raw && raw in OUTCOME_LABEL ? (raw as Outcome) : null;
}

function resultActionFrom(a: LeadActivity): ResultAction | null {
  const raw = readString(payloadOf(a), "result_action");
  if (raw === "rescheduled" || raw === "next_followup" || raw === "closed" || raw === "marked_done") {
    return raw;
  }
  return null;
}

/** True for rows emitted by `resolve_followup` (carry a result_action in
 *  payload). These are part of an audit trail and must not be editable. */
export function isResolutionActivity(a: LeadActivity): boolean {
  return resultActionFrom(a) !== null;
}

/** Uppercase eyebrow label. Falls back to the existing ACTIVITY_TYPE_LABELS
 *  behaviour (via the optional `fallback` arg) for ad-hoc rows and any
 *  unknown type so we never regress an existing label. */
export function activityLabel(
  a: LeadActivity,
  fallback: string,
): string {
  if (a.type === "status_change") return "STAGE CHANGED";

  const outcome = outcomeFrom(a);
  if (outcome) {
    const { channel, suffix } = OUTCOME_LABEL[outcome];
    if (outcome === "no_answer") {
      const attempt = readNumber(payloadOf(a), "attempt");
      if (attempt !== null && attempt > 1) {
        return `${channel} · ${suffix} (×${attempt})`;
      }
    }
    return `${channel} · ${suffix}`;
  }

  // Ad-hoc call/whatsapp/note (no outcome in payload) — preserve the
  // existing uppercase label, e.g. "CALL" / "WHATSAPP" / "NOTE".
  return fallback;
}

/** Subtle accent colour for the icon tile / label. Returns a Ledger CSS
 *  variable (already in the palette) for outcome rows; null = default. */
export function activityAccentColor(a: LeadActivity): string | null {
  if (a.type === "status_change") return null;
  const outcome = outcomeFrom(a);
  if (!outcome) return null;

  // positive — teal accent
  if (outcome === "spoke_interested" || outcome === "wa_replied") {
    return "var(--follow-done)";
  }
  // terminal — red accent
  if (outcome === "spoke_not_interested" || outcome === "wrong_number") {
    return "var(--follow-overdue)";
  }
  // no-contact — amber accent
  if (outcome === "no_answer" || outcome === "busy" || outcome === "wa_no_number") {
    return "var(--follow-unset)";
  }
  // neutral / sent — default colour
  return null;
}

/** Muted fallback line for resolution rows with no typed note. Returns
 *  null when there's nothing useful to fall back on (caller renders
 *  nothing in that case). */
export function activityFallbackDescription(a: LeadActivity): string | null {
  if (a.description && a.description.trim()) return null;
  const action = resultActionFrom(a);
  return action ? RESULT_ACTION_FALLBACK[action] : null;
}

/** Resolve a status_change row to "{from} → {to}" using stageMap. The
 *  backend snapshots `to_stage_name` directly but only `from_stage_id`
 *  for the source, so we look the source name up in the cached stage
 *  map. Returns null if either side is unknown so the caller can fall
 *  back to the row's existing description ("Stage moved to {name}"). */
export function statusChangeTransition(
  a: LeadActivity,
  stageMap: Record<string, PipelineStage>,
): string | null {
  if (a.type !== "status_change") return null;
  const p = payloadOf(a);
  if (!p) return null;
  const fromId = readString(p, "from_stage_id");
  const toName =
    readString(p, "to_stage_name") ??
    (readString(p, "to_stage_id")
      ? stageMap[readString(p, "to_stage_id") as string]?.name ?? null
      : null);
  const fromName = fromId ? stageMap[fromId]?.name ?? null : null;
  if (fromName && toName) return `${fromName} → ${toName}`;
  if (toName) return `→ ${toName}`;
  return null;
}
