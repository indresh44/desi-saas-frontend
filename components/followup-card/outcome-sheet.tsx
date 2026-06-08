"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import type {
  Outcome,
  ResolveChannel,
  ResolveFollowupRequest,
} from "@/lib/api/resolve-followup";
import type { LeadFollowUp, NegativeAttempts } from "@/lib/types/followup";
import type { Lead } from "@/lib/types/lead";
import type { PipelineStage } from "@/lib/types/pipeline";
import { cn } from "@/lib/utils";

import {
  getOutcomes,
  OUTCOME_META,
  pickLostStage,
  pickNextStage,
  stageBucketOf,
  type OutcomeChip,
  type OutcomeFlow,
  type Sentiment,
} from "./outcome-config";

const DAY = 24 * 60 * 60 * 1000;

// --- "What next?" options per flow -------------------------------------

type NextActionId = "reschedule" | "newfu" | "checkin" | "lost" | "done";

interface NextOption {
  id: NextActionId;
  label: string;
  sub: string;
  danger?: boolean;
}

/** Per-flow "What next?" segment options; first entry is the default. */
function nextOptionsFor(flow: OutcomeFlow): NextOption[] {
  switch (flow) {
    case "retry":
      return [
        { id: "reschedule", label: "Reschedule", sub: "Try again later" },
        { id: "done", label: "Just log it", sub: "Keep follow-up open" },
        { id: "lost", label: "Mark lost", sub: "Stop chasing", danger: true },
      ];
    case "terminal":
      return [
        { id: "lost", label: "Mark lost", sub: "Not a fit", danger: true },
        { id: "done", label: "Just log it", sub: "No next step" },
      ];
    case "awaiting":
      // "Sent · awaiting reply" is a pure holding state — note only, no next
      // step. Saving keeps the follow-up open & flagged; the card then shows
      // an "Awaiting reply" button to log the resolution later.
      return [];
    case "positive":
    default:
      return [
        { id: "newfu", label: "Next follow-up", sub: "Schedule + topic" },
        { id: "done", label: "Done for now", sub: "No next step" },
      ];
  }
}

const NEEDS_SCHEDULE: ReadonlySet<NextActionId> = new Set([
  "reschedule",
  "newfu",
  "checkin",
]);

// --- Date chips --------------------------------------------------------

interface DateChip {
  label: string;
  days: number | null; // null = open the calendar picker
}

const DATE_CHIPS: DateChip[] = [
  { label: "Tomorrow", days: 1 },
  { label: "In 2 days", days: 2 },
  { label: "Next week", days: 7 },
  { label: "Pick date", days: null },
];

// --- Styling helpers ---------------------------------------------------

function chipClass(sentiment: Sentiment, selected: boolean): string {
  if (selected) {
    if (sentiment === "pos") return "border-teal-600 bg-teal-600 text-white";
    if (sentiment === "neu") return "border-amber-500 bg-amber-500 text-white";
    return "border-rose-500 bg-rose-500 text-white";
  }
  if (sentiment === "pos")
    return "border-teal-200 bg-background text-teal-700 hover:bg-teal-50";
  if (sentiment === "neu")
    return "border-amber-200 bg-background text-amber-700 hover:bg-amber-50";
  return "border-rose-200 bg-background text-rose-700 hover:bg-rose-50";
}

const NEG_LABELS: Record<keyof Omit<NegativeAttempts, "total">, string> = {
  no_answer: "No answer",
  busy: "Busy",
  wa_not_replied: "Not replied",
};

function earlierAttemptsText(neg: NegativeAttempts | null | undefined): string | null {
  if (!neg || !neg.total) return null;
  const parts = (Object.keys(NEG_LABELS) as (keyof typeof NEG_LABELS)[])
    .filter((k) => neg[k] > 0)
    .map((k) => `${NEG_LABELS[k]} ×${neg[k]}`);
  return parts.length ? `Earlier attempts — ${parts.join(" · ")}` : null;
}

// --- Component ---------------------------------------------------------

export interface OutcomeSheetProps {
  open: boolean;
  onClose: () => void;
  channel: ResolveChannel;
  followup: LeadFollowUp;
  lead: Lead;
  stages: PipelineStage[];
  onSubmit: (request: ResolveFollowupRequest) => Promise<void>;
}

export function OutcomeSheet({
  open,
  onClose,
  channel,
  followup,
  lead,
  stages,
  onSubmit,
}: OutcomeSheetProps) {
  const [picked, setPicked] = useState<Outcome | null>(null);
  const [note, setNote] = useState("");
  const [nextAction, setNextAction] = useState<NextActionId | null>(null);
  const [schedDays, setSchedDays] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedDate, setPickedDate] = useState(""); // datetime-local
  const [regarding, setRegarding] = useState("");
  const [moveStage, setMoveStage] = useState(false);
  const [targetStageId, setTargetStageId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = (lead.customerName ?? "this lead").split(" ")[0];
  const lostStage = useMemo(() => pickLostStage(stages), [stages]);
  const nextStage = useMemo(
    () => pickNextStage(stages, lead.stageId),
    [stages, lead.stageId],
  );
  const chips: OutcomeChip[] = useMemo(() => {
    const all = getOutcomes(stageBucketOf(lead.stageId, stages), channel);
    // Once the follow-up is already awaiting a reply, drop the
    // "Sent · awaiting reply" chip — the next log is the resolution
    // (Replied / Not replied / Not interested), not another "sent".
    if (followup.lastOutcome === "wa_sent") {
      return all.filter((c) => c.outcome !== "wa_sent");
    }
    return all;
  }, [lead.stageId, stages, channel, followup.lastOutcome]);

  const flow: OutcomeFlow | null = picked ? OUTCOME_META[picked].flow : null;

  // Reset everything when the sheet opens or the channel switches.
  useEffect(() => {
    if (!open) return;
    setPicked(null);
    setNote("");
    setNextAction(null);
    setSchedDays(null);
    setPickerOpen(false);
    setPickedDate("");
    setRegarding("");
    setMoveStage(false);
    setTargetStageId(null);
    setError(null);
  }, [open, channel]);

  // When an outcome is chosen, seed the default "What next?" + stage block.
  function selectOutcome(outcome: Outcome) {
    setPicked(outcome);
    setError(null);
    setNote("");
    setRegarding("");
    setPickerOpen(false);
    setPickedDate("");

    const f = OUTCOME_META[outcome].flow;
    const opts = nextOptionsFor(f);
    if (opts.length > 0) {
      applyNextAction(opts[0].id, f);
    } else {
      // Awaiting — note-only, no next step / stage change.
      setNextAction(null);
      setSchedDays(null);
      setPickerOpen(false);
      setMoveStage(false);
      setTargetStageId(null);
    }
  }

  // Apply a "What next?" choice + cascade its schedule/stage defaults.
  function applyNextAction(id: NextActionId, f: OutcomeFlow) {
    setNextAction(id);

    // Schedule defaults.
    if (NEEDS_SCHEDULE.has(id)) {
      setSchedDays((prev) => prev ?? (id === "checkin" ? 2 : 1));
    } else {
      setSchedDays(null);
      setPickerOpen(false);
    }

    // Stage defaults.
    if (id === "lost") {
      setMoveStage(true);
      setTargetStageId(lostStage?.id ?? null);
    } else if (f === "positive") {
      setMoveStage(Boolean(nextStage));
      setTargetStageId(nextStage?.id ?? null);
    } else {
      setMoveStage(false);
      setTargetStageId(null);
    }
  }

  function handleDateChip(chip: DateChip) {
    if (chip.days === null) {
      setPickerOpen(true);
      return;
    }
    setPickerOpen(false);
    setSchedDays(chip.days);
  }

  function resolveNextDt(): string | null {
    if (!nextAction || !NEEDS_SCHEDULE.has(nextAction)) return null;
    if (pickerOpen) {
      return pickedDate ? new Date(pickedDate).toISOString() : null;
    }
    if (schedDays === null) return null;
    return new Date(Date.now() + schedDays * DAY).toISOString();
  }

  const stageName = (id: string | null): string | null =>
    id ? (stages.find((s) => s.id === id)?.name ?? null) : null;

  // Save is ready once an outcome is picked AND any required date is set.
  const needsSchedule = nextAction ? NEEDS_SCHEDULE.has(nextAction) : false;
  const scheduleReady = !needsSchedule || resolveNextDt() !== null;
  const canSave = Boolean(picked) && scheduleReady && !submitting;

  async function handleSave() {
    if (!picked) return; // nextAction may be null for awaiting (note-only)
    const nextDt = resolveNextDt();
    if (needsSchedule && !nextDt) {
      setError("Pick when to follow up.");
      return;
    }

    const stageTo =
      nextAction === "lost"
        ? (stageName(targetStageId) ?? lostStage?.name ?? "Lost")
        : moveStage
          ? stageName(targetStageId)
          : null;

    const request: ResolveFollowupRequest = {
      channel,
      outcome: picked,
      note: note.trim() ? note.trim() : null,
      next_dt: nextDt,
      next_regarding: regarding.trim() ? regarding.trim() : null,
      stage_to: stageTo,
      set_no_followup: !needsSchedule,
    };

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(request);
      onClose();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Couldn't save — try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // --- Save button label -------------------------------------------------
  const saveLabel = useMemo(() => {
    if (!picked) return "Pick an outcome to save";
    const bits: string[] = [`Log "${OUTCOME_META[picked].title}"`];
    if (nextAction === "reschedule") bits.push("reschedule");
    else if (nextAction === "newfu") bits.push("new follow-up");
    else if (nextAction === "checkin") bits.push("check-in");
    else if (nextAction === "lost") bits.push("mark lost");
    const tgt = nextAction === "lost" ? lostStage?.name : moveStage ? stageName(targetStageId) : null;
    if (tgt) bits.push(`→ ${tgt}`);
    return bits.join(" · ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, nextAction, moveStage, targetStageId, lostStage]);

  // --- Render ------------------------------------------------------------

  const channelTitle = channel === "call" ? "Log call outcome" : "Log WhatsApp outcome";
  const actionLine =
    channel === "call"
      ? `You called ${firstName}`
      : `You messaged ${firstName} on WhatsApp`;
  const earlier = earlierAttemptsText(followup.negativeAttempts);
  const isLost = nextAction === "lost";

  return (
    <Dialog open={open} onClose={onClose} ariaLabel={channelTitle} className="max-h-[92vh]">
      <DialogHeader title={channelTitle} onClose={onClose} />
      <DialogBody className="space-y-5">
        {/* Header context */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{actionLine}</p>
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            {lead.customerName ?? lead.title}
          </h3>
          {earlier ? (
            <p className="inline-flex rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
              {earlier}
            </p>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {/* Block 1 — outcome chips */}
        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            How did it go?
          </h4>
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c.outcome}
                type="button"
                onClick={() => selectOutcome(c.outcome)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors md:min-h-9",
                  chipClass(c.sentiment, picked === c.outcome),
                )}
              >
                <span aria-hidden>{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {picked && flow ? (
          <>
            {/* Block 2 — note */}
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Add a note{" "}
                <span className="font-medium normal-case text-muted-foreground/70">
                  · optional · saved to activity log
                </span>
              </h4>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What happened?"
                rows={2}
                className="min-h-[64px] w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
              <p className="text-[11px] font-medium text-muted-foreground/70">
                📝 Goes to activity log, not the follow-up topic
              </p>
            </section>

            {/* Blocks 3 + 4 are skipped for the awaiting flow — it's
                note-only; saving keeps the follow-up open & flagged. */}
            {flow !== "awaiting" ? (
              <>
            {/* Block 3 — what next */}
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                What next?{" "}
                <span className="font-medium normal-case text-muted-foreground/70">· optional</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {nextOptionsFor(flow).map((opt) => {
                  const active = nextAction === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => applyNextAction(opt.id, flow)}
                      className={cn(
                        "flex min-w-[140px] flex-1 items-start gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors",
                        active && !opt.danger && "border-primary bg-primary/10",
                        active && opt.danger && "border-rose-400 bg-rose-50",
                        !active && "border-border bg-background hover:bg-muted",
                      )}
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {opt.label}
                        <span className="block text-[11px] font-medium text-muted-foreground">
                          {opt.sub}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Schedule mini-form */}
              {needsSchedule ? (
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap gap-2">
                    {DATE_CHIPS.map((chip) => {
                      const active =
                        chip.days === null
                          ? pickerOpen
                          : !pickerOpen && schedDays === chip.days;
                      return (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => handleDateChip(chip)}
                          className={cn(
                            "rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                            active
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-background hover:bg-muted",
                          )}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                  {pickerOpen ? (
                    <input
                      type="datetime-local"
                      value={pickedDate}
                      onChange={(e) => setPickedDate(e.target.value)}
                      className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm md:min-h-9"
                    />
                  ) : null}
                  <input
                    value={regarding}
                    onChange={(e) => setRegarding(e.target.value)}
                    placeholder="Regarding… e.g. send revised quote"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  />
                </div>
              ) : null}
            </section>

            {/* Block 4 — move stage */}
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Move stage?{" "}
                <span className="font-medium normal-case text-muted-foreground/70">· optional</span>
              </h4>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3.5 py-3",
                  isLost
                    ? "border-rose-200 bg-rose-50"
                    : moveStage
                      ? "border-teal-200 bg-teal-50"
                      : "border-border bg-background",
                )}
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {isLost
                      ? "Move to Lost"
                      : moveStage && targetStageId
                        ? `Move to ${stageName(targetStageId)}`
                        : `Keep in ${lead.stageName ?? "current stage"}`}
                  </p>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {isLost
                      ? `From ${lead.stageName ?? "current"} → Lost`
                      : moveStage
                        ? "Tap the dropdown to change"
                        : "No stage change · turn on to move"}
                  </p>
                </div>
                {!isLost ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={moveStage}
                    onClick={() => {
                      const on = !moveStage;
                      setMoveStage(on);
                      if (on && !targetStageId) {
                        setTargetStageId(nextStage?.id ?? lead.stageId);
                      }
                    }}
                    className={cn(
                      "relative h-7 w-12 flex-none rounded-full transition-colors",
                      moveStage ? "bg-teal-500" : "bg-muted-foreground/30",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all",
                        moveStage ? "left-[22px]" : "left-0.5",
                      )}
                    />
                  </button>
                ) : null}
              </div>
              {moveStage && !isLost ? (
                <select
                  value={targetStageId ?? ""}
                  onChange={(e) => setTargetStageId(e.target.value)}
                  className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm md:min-h-9"
                >
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : null}
            </section>
              </>
            ) : null}
          </>
        ) : null}
      </DialogBody>

      <DialogFooter>
        <Button
          onClick={handleSave}
          disabled={!canSave}
          className={cn("w-full", isLost && "bg-rose-500 hover:bg-rose-600")}
        >
          {submitting ? "Saving…" : saveLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
