"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { fetchLeadInvoices, movePayment } from "@/lib/api/invoices";
import type { Invoice, Payment } from "@/lib/types/invoice";

type Props = {
  open: boolean;
  payment: Payment;
  sourceInvoice: Invoice;
  onClose: () => void;
  onMoved: () => void;
};

function formatRupees(value: number | string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
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

export function MovePaymentDialog({
  open,
  payment,
  sourceInvoice,
  onClose,
  onMoved,
}: Props) {
  const [candidates, setCandidates] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [targetId, setTargetId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setReason("");
    setTargetId("");
    setError(null);
    setSubmitting(false);

    if (!sourceInvoice.leadId) {
      setCandidates([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchLeadInvoices(sourceInvoice.leadId)
      .then((all) => {
        if (cancelled) return;
        const others = all.filter(
          (inv) =>
            inv.id !== sourceInvoice.id &&
            inv.status !== "cancelled" &&
            inv.status !== "draft"
        );
        setCandidates(others);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(extractErrorMessage(err, "Unable to load invoices."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, sourceInvoice]);

  const handleConfirm = async () => {
    if (!targetId) {
      setError("Pick the invoice to move this payment to.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await movePayment(payment.id, {
        invoice_id: targetId,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });
      onMoved();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to move payment."));
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? () => undefined : onClose} ariaLabel="Move payment">
      <DialogHeader title="Move payment to a different invoice" onClose={onClose} />
      <DialogBody className="space-y-3">
        <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">
          <p className="font-medium text-foreground">
            {formatRupees(payment.amount)} from {sourceInvoice.invoiceNumber}
          </p>
          <p className="text-xs text-muted-foreground">
            The payment will be voided here and recorded on the invoice you pick.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading other invoices...
          </div>
        ) : candidates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
            No other open invoices on this lead to move the payment to. Create an invoice
            first.
          </div>
        ) : (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">
              Move to
            </label>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
              disabled={submitting}
            >
              <option value="">— Pick an invoice —</option>
              {candidates.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} · {formatRupees(inv.totalAmount)} · {inv.status}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="move-payment-reason" className="text-xs font-medium text-muted-foreground">
            Reason (optional)
          </label>
          <input
            id="move-payment-reason"
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. recorded against wrong invoice"
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
          disabled={submitting || !targetId || candidates.length === 0}
        >
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Moving...
            </>
          ) : (
            "Move payment"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
