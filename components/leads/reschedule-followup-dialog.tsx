"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  currentScheduledAt: string;
  onClose: () => void;
  onConfirm: (input: { scheduledAt: string; note: string | null }) => Promise<void> | void;
};

function toDateInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function RescheduleFollowupDialog({
  open,
  currentScheduledAt,
  onClose,
  onConfirm,
}: Props) {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDate(toDateInputValue(currentScheduledAt));
      setReason("");
      setError(null);
      setSubmitting(false);
    }
  }, [open, currentScheduledAt]);

  const handleConfirm = async () => {
    if (!date) {
      setError("Pick a new date.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const scheduledAt = new Date(`${date}T09:00:00`).toISOString();
      await onConfirm({
        scheduledAt,
        note: reason.trim() ? reason.trim() : null,
      });
      onClose();
    } catch (err) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Unable to reschedule follow-up.";
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? () => undefined : onClose} ariaLabel="Reschedule follow-up">
      <DialogHeader title="Reschedule follow-up" onClose={onClose} />
      <DialogBody className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Pick a new date for this follow-up. The original creation note stays;
          your reason here is recorded in the activity timeline.
        </p>
        <div>
          <label htmlFor="reschedule-date" className="text-xs font-medium text-muted-foreground">
            New date
          </label>
          <input
            id="reschedule-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="reschedule-reason" className="text-xs font-medium text-muted-foreground">
            Reason (optional)
          </label>
          <textarea
            id="reschedule-reason"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Client asked to push by a few days"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={submitting}
          />
        </div>
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
