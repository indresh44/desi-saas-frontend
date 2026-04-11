"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPayment, uploadAttachment } from "@/lib/api/invoices";
import type { Invoice, PaymentMethod } from "@/lib/types/invoice";

type Props = {
  invoice: Invoice;
  remainingAmount: number;
  onClose: () => void;
  onSuccess: () => void;
};

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground";

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
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const referenceLabel = useMemo(
    () => getReferenceLabel(paymentMethod),
    [paymentMethod]
  );

  useEffect(() => {
    if (!selectedFile || !selectedFile.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [selectedFile]);

  const handleFileSelect = (file: File | null) => {
    setFileError(null);

    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setSelectedFile(null);
      setFileError("Only JPG, PNG, or PDF files are allowed");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSelectedFile(null);
      setFileError("File must be under 10MB");
      return;
    }

    setSelectedFile(file);
  };

  const resetFileSelection = () => {
    setSelectedFile(null);
    setFileError(null);

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
        }
      );

      if (selectedFile) {
        await uploadAttachment("payment", payment.id, selectedFile);
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
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={isSubmitting ? undefined : onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Record Payment</h2>
              <p className="text-xs text-muted-foreground">{invoice.invoiceNumber}</p>
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
              <label className="block text-sm font-medium text-foreground">Amount</label>
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
              <label className="block text-sm font-medium text-foreground">
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
              <label className="block text-sm font-medium text-foreground">
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
              <label className="block text-sm font-medium text-foreground">
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
              <label className="block text-sm font-medium text-foreground">
                Receipt (optional)
              </label>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => handleFileSelect(event.target.files?.[0] ?? null)}
                disabled={isSubmitting}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={(event) => handleFileSelect(event.target.files?.[0] ?? null)}
                disabled={isSubmitting}
              />

              {selectedFile ? (
                <div className="mt-2 flex items-center gap-3 rounded-md bg-muted p-2">
                  {selectedFile.type.startsWith("image/") && previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-border text-xs text-muted-foreground">
                      PDF
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(0)} KB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetFileSelection}
                    className="text-xs text-muted-foreground hover:text-red-600"
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    <Camera className="h-4 w-4" />
                    Take photo
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    <Upload className="h-4 w-4" />
                    Choose file
                  </Button>
                </div>
              )}
              {fileError ? <p className="text-xs text-red-600">{fileError}</p> : null}
              <p className="text-xs text-muted-foreground">JPG, PNG, or PDF. Max 10MB.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
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