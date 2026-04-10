"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle, ChevronDown, ChevronUp, Download, Loader2, Pencil, Plus, RefreshCw, Share2 } from "lucide-react";
import { PaymentAttachmentPreview } from "@/components/leads/payment-attachment-preview";
import { Button } from "@/components/ui/button";
import { RecordPaymentModal } from "@/components/leads/record-payment-modal";
import { fetchInvoicePayments, updateInvoiceStatus } from "@/lib/api/invoices";
import { shareInvoicePdf, buildBrandedInvoiceUrl } from "@/lib/utils/share";
import { useAuth } from "@/lib/auth/auth-context";
import type { Invoice, InvoiceStatus, Payment, PaymentMethod } from "@/lib/types/invoice";

type Props = {
  invoice: Invoice;
  customerName?: string;
  onEdit?: (invoice: Invoice) => void;
  onPaymentRecorded: () => void;
  onStatusChanged?: (invoice: Invoice) => void;
};

function toSafeNumber(value: unknown): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatRupees(value: unknown): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(toSafeNumber(value));
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInvoiceStatusClass(status: Invoice["status"]): string {
  if (status === "paid") return "bg-green-100 text-green-700";
  if (status === "approved") return "bg-teal-100 text-teal-700";
  if (status === "sent") return "bg-blue-100 text-blue-700";
  if (status === "partial") return "bg-amber-100 text-amber-700";
  return "bg-muted text-muted-foreground";
}

function getPaymentMethodLabel(method: PaymentMethod): string {
  if (method === "upi") return "UPI";
  if (method === "cash") return "Cash";
  if (method === "bank_transfer") return "Bank Transfer";
  return "Card";
}

function getPaymentMethodClass(method: PaymentMethod): string {
  if (method === "upi") return "bg-fuchsia-100 text-fuchsia-700";
  if (method === "cash") return "bg-green-100 text-green-700";
  if (method === "bank_transfer") return "bg-blue-100 text-blue-700";
  return "bg-orange-100 text-orange-700";
}

export function InvoiceCard({
  invoice,
  customerName = "Customer",
  onEdit,
  onPaymentRecorded,
  onStatusChanged,
}: Props) {
  const { business } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [showItems, setShowItems] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [statusChanging, setStatusChanging] = useState<InvoiceStatus | null>(null);

  const loadPayments = useCallback(async () => {
    setIsLoadingPayments(true);
    setPaymentsError(null);

    try {
      const data = await fetchInvoicePayments(invoice.id);
      setPayments(
        [...data].sort(
          (a, b) =>
            new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        )
      );
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
      ) {
        setPaymentsError((err as { message: string }).message);
      } else {
        setPaymentsError("Unable to load payments.");
      }
    } finally {
      setIsLoadingPayments(false);
    }
  }, [invoice.id]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    if (!shareMessage) return;

    const timeout = window.setTimeout(() => {
      setShareMessage(null);
    }, 2000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [shareMessage]);

  const totalAmount = toSafeNumber(invoice.totalAmount);

  const totalPaid = useMemo(
    () => payments.reduce((sum, payment) => sum + toSafeNumber(payment.amount), 0),
    [payments]
  );

  const remainingAmount = Math.max(totalAmount - totalPaid, 0);
  const progressPercent =
    totalAmount > 0
      ? Math.min((totalPaid / totalAmount) * 100, 100)
      : 0;

  const subtotal = useMemo(
    () =>
      (invoice.items ?? []).reduce(
        (sum, item) => sum + toSafeNumber(item.quantity) * toSafeNumber(item.unitPrice),
        0
      ),
    [invoice.items]
  );

  const totalGst = useMemo(
    () =>
      (invoice.items ?? []).reduce(
        (sum, item) =>
          sum +
          (toSafeNumber(item.quantity) *
            toSafeNumber(item.unitPrice) *
            toSafeNumber(item.gstPercent)) /
            100,
        0
      ),
    [invoice.items]
  );

  const remainingClass =
    invoice.status === "partial"
      ? "text-amber-600"
      : "text-muted-foreground";
  const canEditInvoice = invoice.status === "draft" && !!onEdit;

  const handleStatusChange = async (targetStatus: "sent" | "approved") => {
    setStatusChanging(targetStatus as InvoiceStatus);
    try {
      const updated = await updateInvoiceStatus(invoice.id, targetStatus);
      onStatusChanged?.(updated);
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
      ) {
        setPdfError((err as { message: string }).message);
      } else {
        setPdfError("Failed to update status.");
      }
    } finally {
      setStatusChanging(null);
    }
  };

  const handlePaymentSuccess = () => {
    setIsRecordPaymentOpen(false);
    void loadPayments();
    onPaymentRecorded();
  };

  const handleDownloadPdf = () => {
    const url = buildBrandedInvoiceUrl(invoice.id, invoice.invoiceNumber);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSharePdf = async () => {
    setShareLoading(true);
    setPdfError(null);
    setShareMessage(null);

    try {
      const result = await shareInvoicePdf(
        invoice.id,
        invoice.invoiceNumber,
        invoice.status,
        business?.name,
        toSafeNumber(invoice.totalAmount),
      );

      if (result === "shared") {
        setShareMessage("Shared! Caption copied to clipboard");
      } else if (result === "downloaded") {
        setShareMessage("PDF downloaded");
      } else if (result === "cancelled") {
        // User cancelled — no message needed
      } else if (result === "error") {
        setShareMessage("Share failed — try downloading instead");
      }
    } catch (err: unknown) {
      console.error("[InvoiceCard] Share failed:", err);
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
      ) {
        setShareMessage((err as { message: string }).message);
      } else {
        setShareMessage("Failed to generate PDF");
      }
    } finally {
      setShareLoading(false);
    }

    // Clear message after 3 seconds
    setTimeout(() => setShareMessage(null), 3000);
  };

  return (
    <>
      <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-primary">
                {invoice.invoiceNumber}
              </h3>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getInvoiceStatusClass(invoice.status)}`}
              >
                {invoice.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Due {formatDate(invoice.dueDate)}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Total Amount
            </p>
            <p className="text-lg font-semibold text-primary">
              {formatRupees(totalAmount)}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Status: <span className="font-medium capitalize text-foreground">{invoice.status}</span>
          {canEditInvoice ? " • Editable" : " • Editable only in draft"}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {invoice.status === "draft" || invoice.status === "sent" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void handleStatusChange("approved")}
              disabled={statusChanging !== null}
              title="Approve invoice"
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              {statusChanging === "approved" ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              Approve
            </Button>
          ) : null}

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleDownloadPdf()}
            title="View PDF"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void handleSharePdf()}
            disabled={shareLoading}
            title="Share invoice"
          >
            {shareLoading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Share2 className="h-3.5 w-3.5" />
            )}
            Share
          </Button>

          <div className="group relative inline-flex">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={canEditInvoice && onEdit ? () => onEdit(invoice) : undefined}
              disabled={!canEditInvoice}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>

            {!canEditInvoice ? (
              <div className="pointer-events-none absolute right-0 top-full z-20 mt-1 w-52 rounded-md border bg-card px-2 py-1.5 text-left text-xs text-muted-foreground opacity-0 shadow transition-opacity group-hover:opacity-100">
                Editable only in draft mode.
              </div>
            ) : null}
          </div>

          {shareMessage ? (
            <span className="text-xs text-green-600">{shareMessage}</span>
          ) : null}
        </div>

        {pdfError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {pdfError}
          </div>
        ) : null}

        <div className="space-y-2 rounded-xl border-border border bg-muted p-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-foreground">
              {formatRupees(totalPaid)} paid of {formatRupees(totalAmount)}
            </span>
            <span className={`text-xs font-medium ${remainingClass}`}>
              {formatRupees(remainingAmount)} due
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full transition-[width] ${
                invoice.status === "paid" ? "bg-green-500" : "bg-amber-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border-border border bg-muted/70">
          <button
            type="button"
            className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-foreground"
            onClick={() => setShowItems((prev) => !prev)}
          >
            <span>{showItems ? "Hide items" : "Show items"}</span>
            {showItems ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showItems ? (
            <div className="border-t border-border px-3 py-3">
              {invoice.items && invoice.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-foreground">
                    <thead>
                      <tr className="border-b text-xs uppercase tracking-[0.12em] text-muted-foreground">
                        <th className="py-2 pr-3 font-medium">Name</th>
                        <th className="py-2 pr-3 font-medium">Description</th>
                        <th className="py-2 pr-3 font-medium">Qty</th>
                        <th className="py-2 pr-3 font-medium">Rate</th>
                        <th className="py-2 pr-3 font-medium">GST</th>
                        <th className="py-2 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item) => (
                        <tr key={item.id} className="border-b border-border last:border-b-0">
                          <td className="py-2 pr-3 font-medium text-primary">{item.name}</td>
                          <td className="py-2 pr-3">{item.description}</td>
                          <td className="py-2 pr-3">{toSafeNumber(item.quantity)}</td>
                          <td className="py-2 pr-3">{formatRupees(item.unitPrice)}</td>
                          <td className="py-2 pr-3">{toSafeNumber(item.gstPercent)}%</td>
                          <td className="py-2 text-right font-medium text-primary">
                            {formatRupees(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="text-sm text-muted-foreground">
                        <td colSpan={4} className="pt-3 pr-3 text-right font-medium">
                          Subtotal
                        </td>
                        <td className="pt-3 text-right font-medium">
                          {formatRupees(subtotal)}
                        </td>
                      </tr>
                      <tr className="text-sm text-muted-foreground">
                        <td colSpan={4} className="pt-1 pr-3 text-right font-medium">
                          GST
                        </td>
                        <td className="pt-1 text-right font-medium">
                          {formatRupees(totalGst)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No line items on this invoice.</p>
              )}
            </div>
          ) : null}
        </div>

        <div className="space-y-3 rounded-xl border-border border bg-card p-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-primary">Payments</h4>
            {invoice.status !== "paid" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsRecordPaymentOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Record Payment
              </Button>
            ) : null}
          </div>

          {isLoadingPayments ? (
            <div className="flex items-center gap-2 rounded-xl border-border border bg-muted px-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading payments...
            </div>
          ) : paymentsError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {paymentsError}
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-xl border border-dashed border bg-muted px-3 py-4 text-sm text-muted-foreground">
              No payments recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-xl border-border border bg-muted px-3 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {formatDate(payment.paymentDate)}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getPaymentMethodClass(payment.paymentMethod)}`}
                        >
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </span>
                      </div>
                      {payment.reference ? (
                        <p className="text-xs text-muted-foreground">{payment.reference}</p>
                      ) : null}
                    </div>

                    <div className="text-right text-sm font-semibold text-green-600">
                      {formatRupees(payment.amount)}
                    </div>
                  </div>

                  <div className="mt-2">
                    <PaymentAttachmentPreview paymentId={payment.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isRecordPaymentOpen ? (
        <RecordPaymentModal
          invoice={invoice}
          remainingAmount={remainingAmount}
          onClose={() => setIsRecordPaymentOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      ) : null}
    </>
  );
}