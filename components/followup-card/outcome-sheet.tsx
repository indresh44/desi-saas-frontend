"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Mic } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import type { Outcome, ResolveChannel, ResolveFollowupRequest } from "@/lib/api/resolve-followup";
import type { LeadFollowUp } from "@/lib/types/followup";
import type { Lead } from "@/lib/types/lead";
import type { PipelineStage } from "@/lib/types/pipeline";
import { cn } from "@/lib/utils";

import { CHIP_GROUPS, OUTCOME_META, type LifecyclePill, type OutcomeMeta } from "./outcome-config";

// --- Stage-block derivation ---------------------------------------------
// All the "what dropdown should I show and how should I style it?" logic
// lives here so the render is a flat read.

type StageBlockMode =
  | { kind: "none" }
  | { kind: "default-current"; selectedStageId: string }
  | { kind: "highlight-next"; selectedStageId: string; hint: string }
  | { kind: "lost"; selectedStageId: string };

interface DerivedFlow {
  meta: OutcomeMeta;
  stage: StageBlockMode;
  note: { mode: "open" | "collapsed" | "none"; placeholder?: string };
  dateChips: { label: string; offsetMs: number | null }[]; // null = open calendar
  escapeLabel: string | null;
  /** When true, the "Mark Lost" terminal flow replaces the regular action chips. */
  terminal?: { lostStageId: string };
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function findStage(stages: PipelineStage[], predicate: (s: PipelineStage) => boolean) {
  return stages.find(predicate) ?? null;
}

function pickNextStage(stages: PipelineStage[], currentId: string): PipelineStage | null {
  const current = findStage(stages, (s) => s.id === currentId);
  if (!current) return null;
  const next = stages.find((s) => s.position === current.position + 1);
  return next ?? null;
}

function pickLostStage(stages: PipelineStage[]): PipelineStage | null {
  return (
    findStage(stages, (s) => s.name.toLowerCase() === "lost") ??
    // Conventionally the last stage in every persona template — fall back if
    // a custom pipeline doesn't have a literal "Lost".
    stages[stages.length - 1] ??
    null
  );
}

function pickFirstStage(stages: PipelineStage[]): PipelineStage | null {
  return findStage(stages, (s) => s.position === 1);
}

function pickInterestedStage(stages: PipelineStage[]): PipelineStage | null {
  // "Interested" by name across every persona template, falls back to
  // position=2 if owners renamed it.
  return (
    findStage(stages, (s) => s.name.toLowerCase() === "interested") ??
    findStage(stages, (s) => s.position === 2) ??
    null
  );
}

function deriveFlow(
  meta: OutcomeMeta,
  lead: Lead,
  followup: LeadFollowUp,
  stages: PipelineStage[],
): DerivedFlow {
  const attemptAfter = (followup.attemptCount ?? 0) + 1;

  switch (meta.bucket) {
    case "positive": {
      const isAtFirstStage = pickFirstStage(stages)?.id === lead.stageId;
      const preselected = isAtFirstStage
        ? pickInterestedStage(stages)
        : pickNextStage(stages, lead.stageId);
      const fallback = preselected ?? findStage(stages, (s) => s.id === lead.stageId);
      return {
        meta,
        stage: {
          kind: "highlight-next",
          selectedStageId: fallback?.id ?? lead.stageId,
          hint: isAtFirstStage
            ? "First conversation — usually moves to Interested. Change if needed."
            : "Next step in your pipeline — change if it didn't move.",
        },
        note: {
          mode: "open",
          placeholder: "What did they say? Budget, requirements, objections…",
        },
        dateChips: [
          { label: "In 3 days", offsetMs: 3 * DAY },
          { label: "Next week", offsetMs: 7 * DAY },
          { label: "Pick a date", offsetMs: null },
        ],
        escapeLabel: "Just mark done, set nothing",
      };
    }
    case "neutral":
      return {
        meta,
        stage: { kind: "default-current", selectedStageId: lead.stageId },
        note: { mode: "open", placeholder: "Why / when?" },
        dateChips: [
          { label: "Tomorrow", offsetMs: 1 * DAY },
          { label: "In 3 days", offsetMs: 3 * DAY },
          { label: "Pick a date", offsetMs: null },
        ],
        escapeLabel: "Just mark done, set nothing",
      };
    case "sent":
      return {
        meta,
        stage: { kind: "none" },
        note: { mode: "collapsed", placeholder: "+ Add a note" },
        dateChips: [{ label: "Resurface in 2 days", offsetMs: 2 * DAY }],
        escapeLabel: "Just log it",
      };
    case "no_contact": {
      // Terminal switch — after this attempt, no_answer streak hits 3+.
      const hitsThree = meta.outcome === "no_answer" && attemptAfter >= 3;
      if (hitsThree) {
        const lost = pickLostStage(stages);
        return {
          meta: {
            ...meta,
            lifecycle: [
              { key: "done", label: "✓ Follow-up done", tone: "ok" },
              { key: "lost", label: "✕ Move to Lost", tone: "bad" },
            ],
            suggestion: "Three no-answers — most leads at this point are gone. Mark Lost or try WhatsApp.",
          },
          stage: lost
            ? { kind: "lost", selectedStageId: lost.id }
            : { kind: "none" },
          note: { mode: "collapsed", placeholder: "+ Add a note" },
          dateChips: [],
          escapeLabel: "Pick a different date",
          terminal: lost ? { lostStageId: lost.id } : undefined,
        };
      }
      const chips = [
        { label: "In 2 hrs", offsetMs: 2 * HOUR },
        { label: "Tomorrow", offsetMs: 1 * DAY },
      ];
      if (attemptAfter >= 2) {
        // The "Switch to WhatsApp" path opens the WhatsApp chip flow.
        // We handle that via a sentinel in the parent — represent it as a
        // pseudo-chip with offsetMs=-1.
        chips.push({ label: "Switch to WhatsApp", offsetMs: -1 });
      }
      return {
        meta,
        stage: { kind: "none" },
        note: { mode: "collapsed", placeholder: "+ Add a note" },
        dateChips: chips,
        escapeLabel: "Pick a different date",
      };
    }
    case "wa_no_number":
      return {
        meta,
        stage: { kind: "none" },
        note: { mode: "collapsed", placeholder: "+ Add a note" },
        dateChips: [{ label: "Call instead", offsetMs: -1 }],
        escapeLabel: "Pick a different date",
      };
    case "terminal": {
      const lost = pickLostStage(stages);
      return {
        meta,
        stage: lost
          ? { kind: "lost", selectedStageId: lost.id }
          : { kind: "none" },
        note: {
          mode: "open",
          placeholder: "Reason for losing — helps spot patterns",
        },
        dateChips: [],
        escapeLabel: "Keep open instead",
        terminal: lost ? { lostStageId: lost.id } : undefined,
      };
    }
    case "wrong_number":
      return {
        meta,
        stage: { kind: "none" },
        note: { mode: "none" },
        dateChips: [],
        escapeLabel: null,
      };
  }
}

// --- Pill helpers -------------------------------------------------------

function pillClass(tone: LifecyclePill["tone"]) {
  switch (tone) {
    case "ok":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "warn":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "bad":
      return "border-rose-200 bg-rose-50 text-rose-800";
  }
}

function ChipButton({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full border px-3.5 py-2 text-left text-sm font-medium transition-colors md:min-h-9",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-muted",
        className,
      )}
    >
      {children}
    </button>
  );
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
  /** Allows the WhatsApp/Call switch chips inside no_contact / wa_no_number to
   * swap the channel without closing the sheet. */
  onSwitchChannel?: (next: ResolveChannel) => void;
}

export function OutcomeSheet({
  open,
  onClose,
  channel,
  followup,
  lead,
  stages,
  onSubmit,
  onSwitchChannel,
}: OutcomeSheetProps) {
  const [picked, setPicked] = useState<Outcome | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string>(lead.stageId);
  const [noteValue, setNoteValue] = useState<string>("");
  const [noteExpanded, setNoteExpanded] = useState<boolean>(false);
  const [pickedDate, setPickedDate] = useState<string>(""); // datetime-local
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Reset whenever the sheet opens or the channel switches.
  useEffect(() => {
    if (!open) return;
    setPicked(null);
    setSelectedStageId(lead.stageId);
    setNoteValue("");
    setNoteExpanded(false);
    setPickedDate("");
    setPickerOpen(false);
    setError(null);
  }, [open, channel, lead.stageId]);

  const flow: DerivedFlow | null = useMemo(() => {
    if (!picked) return null;
    return deriveFlow(OUTCOME_META[picked], lead, followup, stages);
  }, [picked, lead, followup, stages]);

  // Seed selectedStageId when stage block mode requires it.
  useEffect(() => {
    if (!flow) return;
    if (flow.stage.kind !== "none") {
      setSelectedStageId(flow.stage.selectedStageId);
    }
  }, [flow]);

  async function submit(opts: {
    nextDt: string | null;
    setNoFollowup?: boolean;
    forceStageTo?: string | null;
  }) {
    if (!flow) return;
    setSubmitting(true);
    setError(null);
    try {
      // stage_to is only sent on flows where the stage block is shown
      // AND the user has either kept the highlighted "next" or selected
      // any non-current stage. For "default-current" / "none" we omit.
      let stageTo: string | null = null;
      if (opts.forceStageTo !== undefined) {
        stageTo = opts.forceStageTo;
      } else if (flow.stage.kind === "highlight-next" || flow.stage.kind === "lost") {
        const chosen = stages.find((s) => s.id === selectedStageId);
        stageTo = chosen?.name ?? null;
      } else if (flow.stage.kind === "default-current") {
        const chosen = stages.find((s) => s.id === selectedStageId);
        // Only send if user changed away from current.
        if (chosen && chosen.id !== lead.stageId) stageTo = chosen.name;
      }

      await onSubmit({
        channel,
        outcome: flow.meta.outcome,
        note: noteValue.trim() ? noteValue.trim() : null,
        next_dt: opts.nextDt,
        stage_to: stageTo,
        set_no_followup: !!opts.setNoFollowup,
      });
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

  function handleDateChip(offsetMs: number | null) {
    if (offsetMs === null) {
      setPickerOpen(true);
      return;
    }
    if (offsetMs === -1) {
      // Channel switch sentinel.
      onSwitchChannel?.(channel === "call" ? "whatsapp" : "call");
      setPicked(null);
      return;
    }
    const nextDt = new Date(Date.now() + offsetMs).toISOString();
    submit({ nextDt });
  }

  function handlePickedDateConfirm() {
    if (!pickedDate) return;
    const isoDt = new Date(pickedDate).toISOString();
    submit({ nextDt: isoDt });
  }

  function handleEscape() {
    if (!flow) return;
    // Different semantics per bucket — see spec.
    if (flow.meta.bucket === "no_contact" || flow.meta.bucket === "wa_no_number") {
      // "Pick a different date" — open the calendar picker.
      setPickerOpen(true);
      return;
    }
    if (flow.meta.bucket === "terminal") {
      // "Keep open instead" — close without writing.
      onClose();
      return;
    }
    // positive / neutral / sent → set_no_followup escape hatch.
    submit({ nextDt: null, setNoFollowup: true });
  }

  function handleTerminalMarkLost() {
    if (!flow) return;
    const lostStage = stages.find((s) => s.id === selectedStageId);
    submit({
      nextDt: null,
      setNoFollowup: true,
      forceStageTo: lostStage?.name ?? "Lost",
    });
  }

  function handleWrongNumberClose(keepOpen: boolean) {
    submit({ nextDt: null, setNoFollowup: !keepOpen, forceStageTo: null });
  }

  // --- Render ----------------------------------------------------------

  const channelTitle = channel === "call" ? "Log call outcome" : "Log WhatsApp outcome";
  const stageOptions = stages;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      ariaLabel={channelTitle}
      className="max-h-[92vh]"
    >
      <DialogHeader
        title={picked ? OUTCOME_META[picked].title : channelTitle}
        onClose={onClose}
      />
      <DialogBody className="space-y-4">
        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {!picked ? (
          // --- STAGE 1: chip picker ---
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tap what happened — we'll figure out the rest.
            </p>
            {CHIP_GROUPS[channel].map((group) => (
              <div key={group.heading} className="space-y-2">
                {group.heading.trim() ? (
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.heading}
                  </h3>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {group.outcomes.map((o) => (
                    <ChipButton key={o} onClick={() => setPicked(o)}>
                      {OUTCOME_META[o].chipLabel}
                    </ChipButton>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : flow ? (
          // --- STAGE 2: morphed body for the chosen outcome ---
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setPicked(null)}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ArrowLeft className="size-3.5" /> change
                </button>
              </div>
              <span className="text-2xl leading-none">{flow.meta.icon}</span>
            </div>

            {/* Lifecycle pills */}
            <div className="flex flex-wrap gap-2">
              {flow.meta.lifecycle.map((pill) => (
                <span
                  key={pill.key}
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                    pillClass(pill.tone),
                  )}
                >
                  {pill.label}
                </span>
              ))}
            </div>

            <p className="text-sm text-foreground">{flow.meta.suggestion}</p>

            {/* Stage block */}
            {flow.stage.kind !== "none" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Stage
                </label>
                <select
                  value={selectedStageId}
                  onChange={(e) => setSelectedStageId(e.target.value)}
                  className={cn(
                    "min-h-11 w-full rounded-md border bg-background px-3 text-sm md:min-h-9",
                    flow.stage.kind === "highlight-next" &&
                      "border-primary ring-1 ring-primary/40",
                    flow.stage.kind === "lost" &&
                      "border-rose-300 bg-rose-50 text-rose-900 ring-1 ring-rose-300/50",
                  )}
                >
                  {stageOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {flow.stage.kind === "highlight-next" ? (
                  <p className="text-xs text-muted-foreground">{flow.stage.hint}</p>
                ) : flow.stage.kind === "default-current" ? (
                  <p className="text-xs text-muted-foreground">
                    Stage unchanged — set when to come back.
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* Note */}
            {flow.note.mode === "open" || noteExpanded ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Note
                </label>
                <div className="relative">
                  <textarea
                    value={noteValue}
                    onChange={(e) => setNoteValue(e.target.value)}
                    placeholder={flow.note.placeholder}
                    rows={3}
                    className="min-h-[88px] w-full resize-y rounded-md border border-border bg-background px-3 py-2 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    disabled
                    title="Voice note — coming soon"
                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60"
                  >
                    <Mic className="size-4" />
                  </button>
                </div>
              </div>
            ) : flow.note.mode === "collapsed" ? (
              <button
                type="button"
                onClick={() => setNoteExpanded(true)}
                className="text-sm text-primary hover:underline"
              >
                {flow.note.placeholder ?? "+ Add a note"}
              </button>
            ) : null}

            {/* Date picker (calendar fallback) */}
            {pickerOpen ? (
              <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
                <input
                  type="datetime-local"
                  value={pickedDate}
                  onChange={(e) => setPickedDate(e.target.value)}
                  className="min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm md:min-h-9"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPickerOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handlePickedDateConfirm}
                    disabled={!pickedDate || submitting}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Terminal mark-lost / wrong-number primary actions */}
            {flow.meta.bucket === "terminal" ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  variant="destructive"
                  onClick={handleTerminalMarkLost}
                  disabled={submitting}
                >
                  Mark Lost
                </Button>
              </div>
            ) : flow.meta.bucket === "wrong_number" ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  variant="destructive"
                  onClick={() => handleWrongNumberClose(false)}
                  disabled={submitting}
                >
                  Flag &amp; close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleWrongNumberClose(true)}
                  disabled={submitting}
                >
                  Flag, keep open
                </Button>
              </div>
            ) : flow.dateChips.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {flow.dateChips.map((chip) => (
                  <ChipButton
                    key={chip.label}
                    onClick={() => handleDateChip(chip.offsetMs)}
                  >
                    {chip.label}
                  </ChipButton>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </DialogBody>
      {picked && flow?.escapeLabel ? (
        <DialogFooter>
          <button
            type="button"
            onClick={handleEscape}
            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            disabled={submitting}
          >
            {flow.escapeLabel}
          </button>
        </DialogFooter>
      ) : null}
    </Dialog>
  );
}
