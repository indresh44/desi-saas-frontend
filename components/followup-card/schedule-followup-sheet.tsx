"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { createFollowUp } from "@/lib/api/followups";
import type { LeadFollowUp } from "@/lib/types/followup";
import type { Lead } from "@/lib/types/lead";
import { cn } from "@/lib/utils";

// Inline "Set a follow-up" sheet — opened straight from the dashboard card so
// the owner can schedule without leaving for the lead page. Same Dialog shell
// as the outcome sheet (mobile bottom-sheet / desktop centred modal), so the
// interaction reads identically across web + app.

const DAY = 24 * 60 * 60 * 1000;

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

export interface ScheduleFollowupSheetProps {
  open: boolean;
  onClose: () => void;
  lead: Lead;
  /** Fired after the follow-up is created so the caller can refetch / drop
   *  the card from the "no follow-up" group. */
  onScheduled: (followup: LeadFollowUp) => void;
}

export function ScheduleFollowupSheet({
  open,
  onClose,
  lead,
  onScheduled,
}: ScheduleFollowupSheetProps) {
  const [days, setDays] = useState<number | null>(1); // default: tomorrow
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedDate, setPickedDate] = useState(""); // datetime-local
  const [regarding, setRegarding] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDays(1);
    setPickerOpen(false);
    setPickedDate("");
    setRegarding("");
    setError(null);
  }, [open]);

  function handleChip(chip: DateChip) {
    if (chip.days === null) {
      setPickerOpen(true);
      return;
    }
    setPickerOpen(false);
    setDays(chip.days);
  }

  function resolveDt(): string | null {
    if (pickerOpen) {
      return pickedDate ? new Date(pickedDate).toISOString() : null;
    }
    if (days === null) return null;
    return new Date(Date.now() + days * DAY).toISOString();
  }

  const canSave = resolveDt() !== null && !submitting;

  async function handleSave() {
    const scheduledAt = resolveDt();
    if (!scheduledAt) {
      setError("Pick when to follow up.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const followup = await createFollowUp({
        lead_id: lead.id,
        scheduled_at: scheduledAt,
        note: regarding.trim() ? regarding.trim() : undefined,
      });
      onScheduled(followup);
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

  return (
    <Dialog open={open} onClose={onClose} ariaLabel="Set a follow-up" className="max-h-[92vh]">
      <DialogHeader title="Set a follow-up" onClose={onClose} />
      <DialogBody className="space-y-4">
        <div className="space-y-0.5">
          <h3 className="text-base font-semibold text-foreground">
            {lead.customerName ?? lead.title}
          </h3>
          <p className="text-sm text-muted-foreground">{lead.title}</p>
        </div>

        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            When?
          </h4>
          <div className="flex flex-wrap gap-2">
            {DATE_CHIPS.map((chip) => {
              const active =
                chip.days === null ? pickerOpen : !pickerOpen && days === chip.days;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleChip(chip)}
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
        </section>

        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Regarding{" "}
            <span className="font-medium normal-case text-muted-foreground/70">· optional</span>
          </h4>
          <input
            value={regarding}
            onChange={(e) => setRegarding(e.target.value)}
            placeholder="e.g. send revised quote"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          />
        </section>
      </DialogBody>

      <DialogFooter>
        <Button onClick={handleSave} disabled={!canSave} className="w-full">
          {submitting ? "Saving…" : "Set follow-up"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
