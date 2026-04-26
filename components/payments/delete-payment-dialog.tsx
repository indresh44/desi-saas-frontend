"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { voidPayment } from "@/lib/api/invoices";
import type { Payment } from "@/lib/types/invoice";

type Props = {
  open: boolean;
  payment: Payment;
  invoiceNumber: string;
  onClose: () => void;
  onDeleted: () => void;
};

function formatRupees(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getPaymentMethodLabel(method: Payment["paymentMethod"]): string {
  if (method === "upi") return "UPI";
  if (method === "cash") return "Cash";
  if (method === "bank_transfer") return "Bank Transfer";
  return "Card";
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return fallback;
}

export function DeletePaymentDialog({
  open,
  payment,
  invoiceNumber,
  onClose,
  onDeleted,
}: Props) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await voidPayment(payment.id, reason.trim() ? reason.trim() : undefined);
      onDeleted();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to delete payment."));
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? () => undefined : onClose} ariaLabel="Delete payment">
      <DialogHeader title="Delete this payment?" onClose={onClose} />
      <DialogBody className="space-y-3">
        <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground">
          <p className="font-medium">
            {formatRupees(Number(payment.amount))} ·{" "}
            {getPaymentMethodLabel(payment.paymentMethod)} ·{" "}
            {formatDate(payment.paymentDate)}
          </p>
          <p className="text-xs text-muted-foreground">on {invoiceNumber}</p>
        </div>
        <p className="text-sm text-foreground">
          This marks the payment as voided. It will no longer count toward the invoice
          balance, customer outstanding, or revenue.
        </p>
        <p className="text-xs text-muted-foreground">
          The entry stays in your history under &ldquo;Show edited entries&rdquo; for the
          audit trail. This can&apos;t be undone — record a new payment if it was actually
          received.
        </p>
        <div>
          <label htmlFor="delete-payment-reason" className="text-xs font-medium text-muted-foreground">
            Reason (optional)
          </label>
          <textarea
            id="delete-payment-reason"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. cheque bounced, never received, duplicate entry"
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
          Keep payment
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
              Deleting...
            </>
          ) : (
            "Delete payment"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
