"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { updatePaymentAmount, updatePaymentMetadata } from "@/lib/api/invoices";
import type { Payment, PaymentMethod } from "@/lib/types/invoice";

type Props = {
  open: boolean;
  payment: Payment;
  invoiceNumber: string;
  /** Cap on what the new amount can be: total − adjustments − other active payments. */
  maxAllowedAmount: number;
  onClose: () => void;
  onSaved: () => void;
};

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground md:text-sm";

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

export function EditPaymentDialog({
  open,
  payment,
  invoiceNumber,
  maxAllowedAmount,
  onClose,
  onSaved,
}: Props) {
  const [amount, setAmount] = useState(String(payment.amount));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(payment.paymentMethod);
  const [paymentDate, setPaymentDate] = useState(payment.paymentDate.slice(0, 10));
  const [reference, setReference] = useState(payment.reference ?? "");
  const [reason, setReason] = useState("");
  const [confirmingAmount, setConfirmingAmount] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount(String(payment.amount));
      setPaymentMethod(payment.paymentMethod);
      setPaymentDate(payment.paymentDate.slice(0, 10));
      setReference(payment.reference ?? "");
      setReason("");
      setConfirmingAmount(false);
      setSubmitting(false);
      setError(null);
    }
  }, [open, payment]);

  const parsedAmount = Number(amount);
  const amountChanged = useMemo(
    () => Number.isFinite(parsedAmount) && parsedAmount !== Number(payment.amount),
    [parsedAmount, payment.amount]
  );
  const metadataChanged = useMemo(() => {
    return (
      paymentDate !== payment.paymentDate.slice(0, 10) ||
      paymentMethod !== payment.paymentMethod ||
      (reference || null) !== (payment.reference || null)
    );
  }, [paymentDate, paymentMethod, reference, payment]);

  const nothingChanged = !amountChanged && !metadataChanged;

  const handleSave = async () => {
    setError(null);

    if (amountChanged) {
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        setError("Amount must be greater than 0.");
        return;
      }
      if (parsedAmount > maxAllowedAmount) {
        setError(`Amount can't exceed ₹${maxAllowedAmount.toLocaleString("en-IN")}.`);
        return;
      }

      // Show inline confirmation step before void+replace.
      if (!confirmingAmount) {
        setConfirmingAmount(true);
        return;
      }
    }

    setSubmitting(true);
    try {
      // Save metadata first (in-place) when both kinds of changes are present —
      // metadata edits don't void the payment, so they're applied to the
      // original row before the amount-edit replaces it. When only one kind
      // of change is present, only that endpoint is called.
      if (metadataChanged && !amountChanged) {
        await updatePaymentMetadata(payment.id, {
          payment_date: paymentDate,
          payment_method: paymentMethod,
          reference: reference.trim() ? reference.trim() : "",
        });
      } else if (amountChanged) {
        // If metadata also changed, fold those values into the new payment by
        // first updating in-place, then doing the amount swap. The new
        // payment inherits date/method/reference from the (now updated) old.
        if (metadataChanged) {
          await updatePaymentMetadata(payment.id, {
            payment_date: paymentDate,
            payment_method: paymentMethod,
            reference: reference.trim() ? reference.trim() : "",
          });
        }
        await updatePaymentAmount(payment.id, {
          amount: parsedAmount,
          ...(reason.trim() ? { reason: reason.trim() } : {}),
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to save changes."));
      setSubmitting(false);
      setConfirmingAmount(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? () => undefined : onClose} ariaLabel="Edit payment">
      <DialogHeader title={`Edit payment on ${invoiceNumber}`} onClose={onClose} />
      <DialogBody className="space-y-3">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">Amount (₹)</label>
          <input
            type="number"
            inputMode="decimal"
            enterKeyHint="next"
            min="0"
            step="0.01"
            className={inputCls}
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setConfirmingAmount(false);
            }}
            disabled={submitting}
          />
          <p className="text-xs text-muted-foreground">
            Max ₹{maxAllowedAmount.toLocaleString("en-IN")} (invoice balance + this payment)
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">Date</label>
          <input
            type="date"
            className={inputCls}
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">Method</label>
          <select
            className={inputCls}
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            disabled={submitting}
          >
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="card">Card</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">Reference</label>
          <input
            type="text"
            className={inputCls}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            disabled={submitting}
          />
        </div>

        {amountChanged ? (
          <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <p>
              <strong>Heads up:</strong> changing the amount voids the original entry and
              records a new one. The history stays visible if you expand
              &ldquo;Show edited entries&rdquo;.
            </p>
            <div>
              <label htmlFor="edit-payment-reason" className="text-xs font-medium">
                Reason (optional)
              </label>
              <input
                id="edit-payment-reason"
                type="text"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="e.g. typo, partial payment correction"
                className="mt-1 w-full rounded-md border border-amber-300 bg-white px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-300"
                disabled={submitting}
              />
            </div>
          </div>
        ) : null}
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => void handleSave()}
          disabled={submitting || nothingChanged}
        >
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : confirmingAmount ? (
            "Confirm — void and replace"
          ) : (
            "Save changes"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
