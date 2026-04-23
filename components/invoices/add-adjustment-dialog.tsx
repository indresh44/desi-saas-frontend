"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { addInvoiceAdjustment } from "@/lib/api/invoices";
import type {
  InvoiceAdjustment,
  InvoiceAdjustmentType,
} from "@/lib/types/invoice";

type Props = {
  open: boolean;
  invoiceId: string;
  invoiceNumber?: string;
  remainingBalance: number;
  onClose: () => void;
  onSaved: (adjustment: InvoiceAdjustment) => void;
};

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20";

function formatRupees(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function AddAdjustmentDialog({
  open,
  invoiceId,
  invoiceNumber,
  remainingBalance,
  onClose,
  onSaved,
}: Props) {
  const [amount, setAmount] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<InvoiceAdjustmentType>("discount");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount("");
      setAdjustmentType("discount");
      setReason("");
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    if (numericAmount > remainingBalance) {
      setError(
        `Amount can't exceed the remaining balance (${formatRupees(remainingBalance)}).`,
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const saved = await addInvoiceAdjustment(invoiceId, {
        amount: numericAmount,
        adjustment_type: adjustmentType,
        reason: reason.trim() || undefined,
      });
      onSaved(saved);
      onClose();
    } catch (err) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Unable to add adjustment.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} ariaLabel="Add adjustment">
      <DialogHeader
        title={invoiceNumber ? `Add adjustment to ${invoiceNumber}` : "Add adjustment"}
        onClose={onClose}
      />
      <DialogBody className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Reduce the outstanding balance on this invoice without changing the line items.
          Discounts and write-offs show on the PDF totals. Current balance:{" "}
          <span className="font-medium text-foreground">
            {formatRupees(remainingBalance)}
          </span>
          .
        </p>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground" htmlFor="adj-type">
            Type
          </label>
          <select
            id="adj-type"
            value={adjustmentType}
            onChange={(e) => setAdjustmentType(e.target.value as InvoiceAdjustmentType)}
            className={inputCls}
            disabled={submitting}
          >
            <option value="discount">Discount</option>
            <option value="write_off">Write-off</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground" htmlFor="adj-amount">
            Amount (₹)
          </label>
          <input
            id="adj-amount"
            autoFocus
            type="number"
            min="0"
            step="1"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            placeholder={`Max ${formatRupees(remainingBalance)}`}
            className={inputCls}
            disabled={submitting}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground" htmlFor="adj-reason">
            Reason (optional)
          </label>
          <input
            id="adj-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Long-term client discount"
            className={inputCls}
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
        <Button type="button" onClick={() => void handleSave()} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save adjustment"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
