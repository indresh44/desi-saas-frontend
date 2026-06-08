import type { Outcome, ResolveChannel } from "@/lib/api/resolve-followup";
import type { PipelineStage } from "@/lib/types/pipeline";

// Single source of truth for the outcome matrix, ported from the prototype's
// `getOutcomes` + the Sales Pipeline Stage×Action×Outcome matrix. Keep the
// outcome set in lock-step with the backend `Outcome` enum + the
// `_RETRY/_AWAITING/_POSITIVE/_TERMINAL` buckets in
// app/services/lead_followup_service.py.

// Flow drives the sheet's "What next?" + "Move stage?" sections.
//   positive → suggest move to NEXT_STAGE; default Next follow-up
//   awaiting → no stage move; default Set a check-in
//   retry    → bump the negative tally; default Reschedule, alt Mark lost
//   terminal → default Mark lost (forces Lost), alt Just log
// "Call me later" rides the positive flow (amber chip, but moves things on).
export type OutcomeFlow = "positive" | "awaiting" | "retry" | "terminal";

// Chip colour. pos=teal, neu=gold/amber, neg=coral (mapped to Ledger tokens
// in the sheet/card).
export type Sentiment = "pos" | "neu" | "neg";

export interface OutcomeMeta {
  outcome: Outcome;
  flow: OutcomeFlow;
  sentiment: Sentiment;
  /** Emoji shown on the chip + the resolved/activity line. */
  icon: string;
  /** Canonical title for the resolved card / activity line. */
  title: string;
}

export const OUTCOME_META: Record<Outcome, OutcomeMeta> = {
  no_answer: { outcome: "no_answer", flow: "retry", sentiment: "neg", icon: "📵", title: "No answer" },
  busy: { outcome: "busy", flow: "retry", sentiment: "neg", icon: "📞", title: "Busy / cut-off" },
  spoke_interested: { outcome: "spoke_interested", flow: "positive", sentiment: "pos", icon: "✅", title: "Interested" },
  spoke_later: { outcome: "spoke_later", flow: "positive", sentiment: "neu", icon: "⏰", title: "Call me later" },
  spoke_not_interested: { outcome: "spoke_not_interested", flow: "terminal", sentiment: "neg", icon: "❌", title: "Not interested" },
  wa_sent: { outcome: "wa_sent", flow: "awaiting", sentiment: "neu", icon: "📤", title: "Sent · awaiting reply" },
  wa_replied: { outcome: "wa_replied", flow: "positive", sentiment: "pos", icon: "✅", title: "Replied" },
  wa_not_replied: { outcome: "wa_not_replied", flow: "retry", sentiment: "neg", icon: "⏳", title: "Not replied" },
  wa_not_interested: { outcome: "wa_not_interested", flow: "terminal", sentiment: "neg", icon: "❌", title: "Not interested" },
};

export interface OutcomeChip {
  outcome: Outcome;
  label: string;
  emoji: string;
  sentiment: Sentiment;
  flow: OutcomeFlow;
}

// Stage bucket — the matrix only distinguishes the first stage ("Enquiry")
// from any later active stage ("Interested/WIP"). Won/Lost are terminal and
// don't surface follow-ups.
export type StageBucket = "enquiry" | "active";

function chip(outcome: Outcome, label: string): OutcomeChip {
  const meta = OUTCOME_META[outcome];
  return {
    outcome,
    label,
    emoji: meta.icon,
    sentiment: meta.sentiment,
    flow: meta.flow,
  };
}

/** Ordered outcome chips for a (stage, channel) cell — mirrors the matrix.
 *  Labels are stage-dependent: `spoke_interested` reads "Interested" at the
 *  enquiry stage but "Spoke" once active; `wa_replied` reads "Interested" vs
 *  "Replied". */
export function getOutcomes(
  stage: StageBucket,
  channel: ResolveChannel,
): OutcomeChip[] {
  if (channel === "call") {
    if (stage === "enquiry") {
      return [
        chip("spoke_interested", "Interested"),
        chip("spoke_later", "Call me later"),
        chip("spoke_not_interested", "Not interested"),
        chip("no_answer", "No answer"),
        chip("busy", "Busy / cut-off"),
      ];
    }
    return [
      chip("spoke_interested", "Spoke"),
      chip("spoke_later", "Call me later"),
      chip("no_answer", "No answer"),
      chip("busy", "Busy / cut-off"),
    ];
  }
  // WhatsApp
  if (stage === "enquiry") {
    return [
      chip("wa_replied", "Interested"),
      chip("wa_not_interested", "Not interested"),
      chip("wa_sent", "Sent · awaiting reply"),
      chip("wa_not_replied", "Not replied"),
    ];
  }
  return [
    chip("wa_replied", "Replied"),
    chip("wa_sent", "Sent · awaiting reply"),
    chip("wa_not_replied", "Not replied"),
  ];
}

// ---------------------------------------------------------------------------
// Stage helpers — position-based so they survive custom / longer pipelines.
// ---------------------------------------------------------------------------

function byPosition(stages: PipelineStage[]): PipelineStage[] {
  return [...stages].sort((a, b) => a.position - b.position);
}

/** First stage (lowest position) = "Enquiry" chips; anything else = active. */
export function stageBucketOf(
  stageId: string,
  stages: PipelineStage[],
): StageBucket {
  const ordered = byPosition(stages);
  return ordered.length > 0 && ordered[0].id === stageId ? "enquiry" : "active";
}

/** NEXT_STAGE = the next stage by position (Enquiry→Interested→WIP→Won). */
export function pickNextStage(
  stages: PipelineStage[],
  currentStageId: string,
): PipelineStage | null {
  const ordered = byPosition(stages);
  const idx = ordered.findIndex((s) => s.id === currentStageId);
  if (idx < 0 || idx + 1 >= ordered.length) return null;
  return ordered[idx + 1];
}

/** The "Lost" stage — by name, else the last stage by position. */
export function pickLostStage(stages: PipelineStage[]): PipelineStage | null {
  const ordered = byPosition(stages);
  return (
    ordered.find((s) => s.name.trim().toLowerCase() === "lost") ??
    ordered[ordered.length - 1] ??
    null
  );
}
