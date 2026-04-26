"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string | null) => Promise<void> | void;
};

export function CancelFollowupDialog({ open, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(reason.trim() ? reason.trim() : null);
      onClose();
    } catch (err) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Unable to cancel follow-up.";
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? () => undefined : onClose} ariaLabel="Cancel follow-up">
      <DialogHeader title="Cancel follow-up?" onClose={onClose} />
      <DialogBody className="space-y-3">
        <p className="text-sm text-foreground">
          This marks the follow-up as cancelled. It won&apos;t show up in your
          today / overdue lists. The activity timeline keeps a record.
        </p>
        <div>
          <label htmlFor="cancel-followup-reason" className="text-xs font-medium text-muted-foreground">
            Reason (optional)
          </label>
          <textarea
            id="cancel-followup-reason"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Client lost interest, duplicate"
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
          Keep follow-up
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => void handleConfirm()}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Cancelling...
            </>
          ) : (
            "Cancel follow-up"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
