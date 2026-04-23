"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  invoiceNumber?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export function ApproveInvoiceDialog({
  open,
  invoiceNumber,
  onClose,
  onConfirm,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Unable to approve invoice.";
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? () => undefined : onClose} ariaLabel="Approve invoice">
      <DialogHeader
        title={invoiceNumber ? `Approve ${invoiceNumber}?` : "Approve invoice?"}
        onClose={onClose}
      />
      <DialogBody className="space-y-3">
        <p className="text-sm text-foreground">
          Once approved, you won&apos;t be able to change line items, quantities, rates, or GST
          on this invoice. You&apos;ll still be able to:
        </p>
        <ul className="space-y-1 pl-5 text-sm text-muted-foreground list-disc">
          <li>Edit item descriptions and deliverables</li>
          <li>Apply discounts or write-offs</li>
          <li>Add more items via a new invoice on the same lead</li>
        </ul>
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
        <Button type="button" onClick={() => void handleConfirm()} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Approving...
            </>
          ) : (
            "Approve"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
