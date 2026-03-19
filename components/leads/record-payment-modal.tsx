"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPayment, uploadAttachment } from "@/lib/api/invoices";
import { DEFAULT_USER_ID } from "@/lib/constants/api";
import type { Invoice, PaymentMethod } from "@/lib/types/invoice";

type Props = {
  invoice: Invoice;
  remainingAmount: number;
  onClose: () => void;
  onSuccess: () => void;
};

const inputCls =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400";

const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getReferenceLabel(method: PaymentMethod): string {
  if (method === "upi") return "UPI Reference / UTR";
  if (method === "bank_transfer") return "Transaction Reference";
  if (method === "cash") return "Receipt Number (optional)";
  return "Last 4 digits (optional)";
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

export function RecordPaymentModal({
  invoice,
  remainingAmount,
  onClose,
  onSuccess,
}: Props) {
  const [amount, setAmount] = useState(
    remainingAmount > 0 ? String(remainingAmount) : ""
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [paymentDate, setPaymentDate] = useState(getToday);
  const [reference, setReference] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const referenceLabel = useMemo(
    () => getReferenceLabel(paymentMethod),
    [paymentMethod]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedFile(null);
      setError(null);
      return;
    }

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setSelectedFile(null);
      setError("Receipt must be a JPG, PNG, or PDF file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSelectedFile(null);
      setError("Receipt file must be 10MB or smaller.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (parsedAmount > remainingAmount) {
      setError("Amount cannot exceed the remaining balance.");
      return;
    }

    if (!paymentDate) {
      setError("Payment date is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payment = await createPayment(
        {
          invoice_id: invoice.id,
          amount: parsedAmount,
          payment_method: paymentMethod,
          payment_date: paymentDate,
          ...(reference.trim() ? { reference: reference.trim() } : {}),
        },
        DEFAULT_USER_ID
      );

      if (selectedFile) {
        await uploadAttachment("payment", payment.id, selectedFile, DEFAULT_USER_ID);
      }

      onSuccess();
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to record payment."));
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-zinc-900/40"
        aria-label="Close"
        onClick={isSubmitting ? undefined : onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Record Payment</h2>
              <p className="text-xs text-zinc-500">{invoice.invoiceNumber}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4 p-4">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-700">Amount</label>
              <input
                type="number"
                min="0"
                max={remainingAmount}
                step="0.01"
                className={inputCls}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-700">
                Payment Method
              </label>
              <select
                className={inputCls}
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                disabled={isSubmitting}
              >
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-700">
                Payment Date
              </label>
              <input
                type="date"
                className={inputCls}
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-700">
                {referenceLabel}
              </label>
              <input
                type="text"
                className={inputCls}
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-700">
                Upload Receipt (optional)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className={`${inputCls} file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white`}
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
              {selectedFile ? (
                <p className="text-xs text-zinc-600">{selectedFile.name}</p>
              ) : null}
              <p className="text-xs text-zinc-500">
                Screenshot, photo of receipt, or PDF
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-4 py-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}