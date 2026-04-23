"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  invoiceNumber?: string;
  onClose: () => void;
  onConfirm: (reason: string | null) => Promise<void> | void;
};

export function CancelInvoiceDialog({
  open,
  invoiceNumber,
  onClose,
  onConfirm,
}: Props) {
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
          : "Unable to cancel invoice.";
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? () => undefined : onClose} ariaLabel="Cancel invoice">
      <DialogHeader
        title={invoiceNumber ? `Cancel ${invoiceNumber}?` : "Cancel invoice?"}
        onClose={onClose}
      />
      <DialogBody className="space-y-3">
        <p className="text-sm text-foreground">
          This marks the invoice as cancelled. It will no longer count toward outstanding
          or revenue. This can&apos;t be undone — you&apos;d have to create a new invoice.
        </p>
        <p className="text-xs text-muted-foreground">
          Cancelling is only allowed before any payments are recorded. For paid or
          partially paid invoices, use an adjustment (discount / write-off) instead.
        </p>
        <div>
          <label htmlFor="cancel-reason" className="text-xs font-medium text-muted-foreground">
            Reason (optional)
          </label>
          <textarea
            id="cancel-reason"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Client backed out, wrong customer, duplicate"
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
          Keep invoice
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
            "Cancel invoice"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
