import type { Outcome, ResolveChannel } from "@/lib/api/resolve-followup";

// Bucket = how the backend `resolve_followup` classifies the outcome.
// Keep this enum in lock-step with the service-side switch in
// app/services/lead_followup_service.py. The UI uses the bucket to pick
// which Stage-2 layout to render (stage block, note field, action chips).
export type OutcomeBucket =
  | "positive"
  | "neutral"
  | "sent"
  | "no_contact"
  | "wa_no_number"
  | "terminal"
  | "wrong_number";

export type LifecyclePill =
  | { key: "done"; label: "✓ Follow-up done"; tone: "ok" }
  | { key: "new"; label: "+ Next follow-up"; tone: "ok" }
  | { key: "reschedule"; label: "↻ Reschedule (stays open)"; tone: "warn" }
  | { key: "lost"; label: "✕ Move to Lost"; tone: "bad" };

export interface OutcomeMeta {
  outcome: Outcome;
  channel: ResolveChannel;
  bucket: OutcomeBucket;
  /** Title shown at the top of Stage-2 + on the resolved card. */
  title: string;
  /** Compact label used in the Stage-1 chip. */
  chipLabel: string;
  /** Emoji icon used in resolved-state activity log line. */
  icon: string;
  /** One-line guidance under the title in Stage-2. */
  suggestion: string;
  /** Lifecycle pills shown in Stage-2 (read-only info). */
  lifecycle: LifecyclePill[];
}

export const OUTCOME_META: Record<Outcome, OutcomeMeta> = {
  // -- Call: didn't connect --
  no_answer: {
    outcome: "no_answer",
    channel: "call",
    bucket: "no_contact",
    title: "No answer",
    chipLabel: "No answer",
    icon: "📞",
    suggestion: "Couldn't reach — follow-up stays open, just moved.",
    lifecycle: [{ key: "reschedule", label: "↻ Reschedule (stays open)", tone: "warn" }],
  },
  busy: {
    outcome: "busy",
    channel: "call",
    bucket: "no_contact",
    title: "Busy / cut off",
    chipLabel: "Busy / cut off",
    icon: "📞",
    suggestion: "Couldn't reach — follow-up stays open, just moved.",
    lifecycle: [{ key: "reschedule", label: "↻ Reschedule (stays open)", tone: "warn" }],
  },
  wrong_number: {
    outcome: "wrong_number",
    channel: "call",
    bucket: "wrong_number",
    title: "Wrong number",
    chipLabel: "Wrong number",
    icon: "⚠️",
    suggestion: "Flag this number and close.",
    lifecycle: [
      { key: "done", label: "✓ Follow-up done", tone: "ok" },
      { key: "lost", label: "✕ Move to Lost", tone: "bad" },
    ],
  },
  // -- Call: spoke to them --
  spoke_interested: {
    outcome: "spoke_interested",
    channel: "call",
    bucket: "positive",
    title: "Interested",
    chipLabel: "Interested",
    icon: "💬",
    suggestion: "Great — line up the next step.",
    lifecycle: [
      { key: "done", label: "✓ Follow-up done", tone: "ok" },
      { key: "new", label: "+ Next follow-up", tone: "ok" },
    ],
  },
  spoke_later: {
    outcome: "spoke_later",
    channel: "call",
    bucket: "neutral",
    title: "Call me later",
    chipLabel: "Call me later",
    icon: "💬",
    suggestion: "Stage unchanged — set when to come back.",
    lifecycle: [
      { key: "done", label: "✓ Follow-up done", tone: "ok" },
      { key: "new", label: "+ Next follow-up", tone: "ok" },
    ],
  },
  spoke_not_interested: {
    outcome: "spoke_not_interested",
    channel: "call",
    bucket: "terminal",
    title: "Not interested",
    chipLabel: "Not interested",
    icon: "🚫",
    suggestion: "Close it out — capture the why if you can.",
    lifecycle: [
      { key: "done", label: "✓ Follow-up done", tone: "ok" },
      { key: "lost", label: "✕ Move to Lost", tone: "bad" },
    ],
  },
  // -- WhatsApp --
  wa_sent: {
    outcome: "wa_sent",
    channel: "whatsapp",
    bucket: "sent",
    title: "Sent — awaiting reply",
    chipLabel: "Sent — awaiting reply",
    icon: "📨",
    suggestion: "Awaiting reply — resurfaces in 2 days.",
    lifecycle: [
      { key: "done", label: "✓ Follow-up done", tone: "ok" },
      { key: "new", label: "+ Next follow-up", tone: "ok" },
    ],
  },
  wa_replied: {
    outcome: "wa_replied",
    channel: "whatsapp",
    bucket: "positive",
    title: "Replied — interested",
    chipLabel: "Replied — interested",
    icon: "💬",
    suggestion: "Great — line up the next step.",
    lifecycle: [
      { key: "done", label: "✓ Follow-up done", tone: "ok" },
      { key: "new", label: "+ Next follow-up", tone: "ok" },
    ],
  },
  wa_later: {
    outcome: "wa_later",
    channel: "whatsapp",
    bucket: "neutral",
    title: "Replied — not now",
    chipLabel: "Replied — not now",
    icon: "💬",
    suggestion: "Stage unchanged — set when to come back.",
    lifecycle: [
      { key: "done", label: "✓ Follow-up done", tone: "ok" },
      { key: "new", label: "+ Next follow-up", tone: "ok" },
    ],
  },
  wa_no_number: {
    outcome: "wa_no_number",
    channel: "whatsapp",
    bucket: "wa_no_number",
    title: "Number not on WhatsApp",
    chipLabel: "Number not on WhatsApp",
    icon: "⚠️",
    suggestion: "Not on WhatsApp — switch to a call?",
    lifecycle: [{ key: "reschedule", label: "↻ Reschedule (stays open)", tone: "warn" }],
  },
};

// Stage-1 chip groups, ordered to match the spec layout.
export const CHIP_GROUPS: Record<
  ResolveChannel,
  { heading: string; outcomes: Outcome[] }[]
> = {
  call: [
    { heading: "Didn't connect", outcomes: ["no_answer", "busy", "wrong_number"] },
    {
      heading: "Spoke to them",
      outcomes: ["spoke_interested", "spoke_later", "spoke_not_interested"],
    },
  ],
  whatsapp: [
    {
      heading: " ", // single block, no heading
      outcomes: ["wa_sent", "wa_replied", "wa_later", "wa_no_number"],
    },
  ],
};
