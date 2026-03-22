"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  MessageCircle,
  RefreshCw,
  Share2,
  Upload,
} from "lucide-react";
import { PaymentAttachmentPreview } from "@/components/leads/payment-attachment-preview";
import { Button } from "@/components/ui/button";
import { fetchCustomers } from "@/lib/api/customers";
import {
  createPayment,
  fetchInvoiceItems,
  fetchInvoicePayments,
  fetchInvoices,
  getInvoicePdf,
  uploadAttachment,
} from "@/lib/api/invoices";
import { shareInvoicePdf } from "@/lib/utils/share";
import type { Customer } from "@/lib/types/customer";
import type { Invoice, InvoiceStatus, Payment, PaymentMethod } from "@/lib/types/invoice";

export interface InvoiceListViewProps {
  customerId?: string;
  leadId?: string;
  showCustomerColumn?: boolean;
  showFilters?: boolean;
  showSummaryBar?: boolean;
  initialStatusFilter?: StatusFilter;
}

type DatePreset = "all" | "this_month" | "last_month" | "this_quarter" | "custom";
type StatusFilter = "all" | InvoiceStatus;

type InlinePaymentFormProps = {
  invoice: Invoice;
  remainingBalance: number;
  onSuccess: () => Promise<void>;
};

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "partial", label: "Partial" },
  { value: "overdue", label: "Overdue" },
  { value: "paid", label: "Paid" },
];

const DATE_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "custom", label: "Custom Range" },
];

const inputClassName =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400";

function formatRupees(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusClassName(status: InvoiceStatus): string {
  if (status === "paid") return "bg-green-100 text-green-700";
  if (status === "sent") return "bg-blue-100 text-blue-700";
  if (status === "partial") return "bg-amber-100 text-amber-700";
  if (status === "overdue") return "bg-red-100 text-red-700";
  return "bg-zinc-100 text-zinc-600";
}

function paymentMethodLabel(value: PaymentMethod): string {
  if (value === "upi") return "UPI";
  if (value === "cash") return "Cash";
  if (value === "bank_transfer") return "Bank Transfer";
  return "Card";
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDateRangeForPreset(
  preset: DatePreset,
  customFrom: string,
  customTo: string
): { from?: string; to?: string } {
  const now = new Date();

  if (preset === "all") {
    return {};
  }

  if (preset === "custom") {
    return {
      from: customFrom || undefined,
      to: customTo || undefined,
    };
  }

  if (preset === "this_month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  }

  if (preset === "last_month") {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  }

  const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
  const from = new Date(now.getFullYear(), quarterStartMonth, 1);
  const to = new Date(now.getFullYear(), quarterStartMonth + 3, 0);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function InlinePaymentForm({ invoice, remainingBalance, onSuccess }: InlinePaymentFormProps) {
  const [amount, setAmount] = useState(remainingBalance > 0 ? String(remainingBalance) : "");
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [paymentDate, setPaymentDate] = useState(getTodayDate);
  const [reference, setReference] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setAmount(remainingBalance > 0 ? String(remainingBalance) : "");
  }, [remainingBalance, invoice.id]);

  useEffect(() => {
    if (!selectedFile || !selectedFile.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  const selectFile = (file: File | null) => {
    if (!file) {
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Receipt file must be under 10MB.");
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
  };

  const resetFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submit = async () => {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Amount must be greater than zero.");
      return;
    }

    if (parsedAmount > remainingBalance) {
      setErrorMessage("Amount cannot exceed balance due.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payment = await createPayment({
        invoice_id: invoice.id,
        amount: parsedAmount,
        payment_method: method,
        payment_date: paymentDate,
        ...(reference.trim() ? { reference: reference.trim() } : {}),
      });

      if (selectedFile) {
        await uploadAttachment("payment", payment.id, selectedFile);
      }

      setReference("");
      resetFile();
      await onSuccess();
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
      ) {
        setErrorMessage((error as { message: string }).message);
      } else {
        setErrorMessage("Unable to record payment.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <div className="grid gap-2 md:grid-cols-[1.1fr_1fr_1fr_1fr_auto_auto]">
        <input
          type="number"
          min="0"
          max={remainingBalance}
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className={inputClassName}
          placeholder="Amount"
          disabled={isSubmitting}
        />

        <select
          value={method}
          onChange={(event) => setMethod(event.target.value as PaymentMethod)}
          className={inputClassName}
          disabled={isSubmitting}
        >
          <option value="upi">UPI</option>
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="card">Card</option>
        </select>

        <input
          type="date"
          value={paymentDate}
          onChange={(event) => setPaymentDate(event.target.value)}
          className={inputClassName}
          disabled={isSubmitting}
        />

        <input
          type="text"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          className={inputClassName}
          placeholder="Reference"
          disabled={isSubmitting}
        />

        <div className="flex items-center gap-2">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
            disabled={isSubmitting}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            className="hidden"
            onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
            disabled={isSubmitting}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isSubmitting}
          >
            <Camera className="h-3.5 w-3.5" />
            Photo
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
          >
            <Upload className="h-3.5 w-3.5" />
            File
          </Button>
        </div>

        <Button type="button" onClick={() => void submit()} disabled={isSubmitting}>
          {isSubmitting ? "Recording..." : "Record Payment"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600">
        <span>Balance: {formatRupees(Math.max(remainingBalance, 0))}</span>
        {selectedFile ? (
          <span className="inline-flex items-center gap-2 rounded bg-white px-2 py-1 text-zinc-700">
            {previewUrl ? <img src={previewUrl} alt="Receipt" className="h-6 w-6 rounded object-cover" /> : <FileText className="h-3.5 w-3.5" />}
            {selectedFile.name}
            <button type="button" onClick={resetFile} className="text-zinc-500 hover:text-red-600">
              Remove
            </button>
          </span>
        ) : null}
      </div>

      {errorMessage ? (
        <p className="text-xs text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}

export function InvoiceListView({
  customerId,
  leadId,
  showCustomerColumn = true,
  showFilters = true,
  showSummaryBar = true,
  initialStatusFilter = "all",
}: InvoiceListViewProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [summaryOutstanding, setSummaryOutstanding] = useState(0);
  const [summaryCount, setSummaryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatusFilter);
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isCustomersLoading, setIsCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(customerId);

  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [isRowLoading, setIsRowLoading] = useState<Record<string, boolean>>({});
  const [itemsByInvoice, setItemsByInvoice] = useState<Record<string, Invoice["items"]>>({});
  const [paymentsByInvoice, setPaymentsByInvoice] = useState<Record<string, Payment[]>>({});
  const [pdfLoadingByInvoice, setPdfLoadingByInvoice] = useState<Record<string, boolean>>({});
  const [shareLoadingByInvoice, setShareLoadingByInvoice] = useState<Record<string, boolean>>({});
  const [showPaymentFormByInvoice, setShowPaymentFormByInvoice] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSelectedCustomerId(customerId);
  }, [customerId]);

  useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  useEffect(() => {
    if (customerId || !showFilters) {
      return;
    }

    let isMounted = true;
    setIsCustomersLoading(true);

    void fetchCustomers()
      .then((result) => {
        if (isMounted) {
          setCustomers(result);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCustomers([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCustomersLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [customerId, showFilters]);

  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query)
      );
    });
  }, [customerSearch, customers]);

  const selectedCustomerName = useMemo(() => {
    const found = customers.find((item) => item.id === selectedCustomerId);
    return found?.name ?? "";
  }, [customers, selectedCustomerId]);

  const loadInvoices = useCallback(
    async (mode: "reset" | "append") => {
      const isReset = mode === "reset";
      if (isReset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setErrorMessage(null);

      try {
        const dateRange = getDateRangeForPreset(datePreset, customFromDate, customToDate);
        const nextOffset = isReset ? 0 : invoices.length;
        const response = await fetchInvoices({
          customer_id: selectedCustomerId,
          lead_id: leadId,
          status: statusFilter === "all" ? undefined : statusFilter,
          from_date: dateRange.from,
          to_date: dateRange.to,
          limit: 20,
          offset: nextOffset,
        });

        setTotal(response.total);
        setSummaryOutstanding(response.summary.totalOutstanding);
        setSummaryCount(response.summary.outstandingCount);

        if (isReset) {
          setInvoices(response.items);
        } else {
          setInvoices((prev) => [...prev, ...response.items]);
        }
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message: unknown }).message === "string"
        ) {
          setErrorMessage((error as { message: string }).message);
        } else {
          setErrorMessage("Unable to load invoices.");
        }
      } finally {
        if (isReset) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [customFromDate, customToDate, datePreset, invoices.length, leadId, selectedCustomerId, statusFilter]
  );

  useEffect(() => {
    void loadInvoices("reset");
  }, [loadInvoices]);

  const loadExpandedDetails = useCallback(
    async (invoiceId: string) => {
      if (itemsByInvoice[invoiceId] && paymentsByInvoice[invoiceId]) {
        return;
      }

      setIsRowLoading((prev) => ({ ...prev, [invoiceId]: true }));
      try {
        const [items, payments] = await Promise.all([
          fetchInvoiceItems(invoiceId),
          fetchInvoicePayments(invoiceId),
        ]);

        setItemsByInvoice((prev) => ({
          ...prev,
          [invoiceId]: items,
        }));

        setPaymentsByInvoice((prev) => ({
          ...prev,
          [invoiceId]: [...payments].sort(
            (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
          ),
        }));
      } finally {
        setIsRowLoading((prev) => ({ ...prev, [invoiceId]: false }));
      }
    },
    [itemsByInvoice, paymentsByInvoice]
  );

  const toggleExpanded = async (invoiceId: string) => {
    const isCurrentlyExpanded = expandedIds[invoiceId] ?? false;
    setExpandedIds((prev) => ({ ...prev, [invoiceId]: !isCurrentlyExpanded }));

    if (!isCurrentlyExpanded) {
      await loadExpandedDetails(invoiceId);
    }
  };

  const onPaymentRecorded = async (invoiceId: string) => {
    const [payments] = await Promise.all([
      fetchInvoicePayments(invoiceId),
      loadInvoices("reset"),
    ]);

    setPaymentsByInvoice((prev) => ({
      ...prev,
      [invoiceId]: [...payments].sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      ),
    }));
  };

  const handleDownloadPdf = async (invoiceId: string) => {
    setPdfLoadingByInvoice((prev) => ({ ...prev, [invoiceId]: true }));
    try {
      const pdfUrl = await getInvoicePdf(invoiceId);
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    } finally {
      setPdfLoadingByInvoice((prev) => ({ ...prev, [invoiceId]: false }));
    }
  };

  const handleShareInvoice = async (invoice: Invoice) => {
    setShareLoadingByInvoice((prev) => ({ ...prev, [invoice.id]: true }));
    try {
      const pdfUrl = invoice.pdfUrl ?? (await getInvoicePdf(invoice.id));
      await shareInvoicePdf(pdfUrl, invoice.invoiceNumber, invoice.customerName ?? "Customer");
    } finally {
      setShareLoadingByInvoice((prev) => ({ ...prev, [invoice.id]: false }));
    }
  };

  const canLoadMore = invoices.length < total;

  return (
    <section className="space-y-4">
      {showSummaryBar ? (
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800">
          {formatRupees(summaryOutstanding)} outstanding across {summaryCount} invoice{summaryCount === 1 ? "" : "s"}
        </div>
      ) : null}

      {showFilters ? (
        <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === option.value
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">Date Range</label>
              <select
                value={datePreset}
                onChange={(event) => setDatePreset(event.target.value as DatePreset)}
                className={inputClassName}
              >
                {DATE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {datePreset === "custom" ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="date"
                    value={customFromDate}
                    onChange={(event) => setCustomFromDate(event.target.value)}
                    className={inputClassName}
                  />
                  <input
                    type="date"
                    value={customToDate}
                    onChange={(event) => setCustomToDate(event.target.value)}
                    className={inputClassName}
                  />
                </div>
              ) : null}
            </div>

            {!customerId ? (
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">Customer</label>
                <div className="relative">
                  <input
                    type="text"
                    value={isCustomerDropdownOpen ? customerSearch : selectedCustomerName}
                    onChange={(event) => {
                      setCustomerSearch(event.target.value);
                      setIsCustomerDropdownOpen(true);
                      if (!event.target.value.trim()) {
                        setSelectedCustomerId(undefined);
                      }
                    }}
                    onFocus={() => {
                      setCustomerSearch("");
                      setIsCustomerDropdownOpen(true);
                    }}
                    onBlur={() => {
                      window.setTimeout(() => setIsCustomerDropdownOpen(false), 120);
                    }}
                    placeholder={isCustomersLoading ? "Loading customers..." : "Search customer"}
                    className={inputClassName}
                    disabled={isCustomersLoading}
                  />
                  {isCustomerDropdownOpen ? (
                    <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-md">
                      <button
                        type="button"
                        onMouseDown={() => {
                          setSelectedCustomerId(undefined);
                          setCustomerSearch("");
                          setIsCustomerDropdownOpen(false);
                        }}
                        className="block w-full border-b border-zinc-100 px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-50"
                      >
                        All customers
                      </button>
                      {filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onMouseDown={() => {
                            setSelectedCustomerId(customer.id);
                            setCustomerSearch("");
                            setIsCustomerDropdownOpen(false);
                          }}
                          className="block w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                        >
                          <div className="font-medium text-zinc-900">{customer.name}</div>
                          <div className="text-xs text-zinc-500">{customer.phone}</div>
                        </button>
                      ))}
                      {!filteredCustomers.length ? (
                        <div className="px-3 py-2 text-sm text-zinc-500">No matching customers.</div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4">
          <div className="h-12 animate-pulse rounded bg-zinc-100" />
          <div className="h-12 animate-pulse rounded bg-zinc-100" />
          <div className="h-12 animate-pulse rounded bg-zinc-100" />
        </div>
      ) : !invoices.length ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-6 py-10 text-center text-sm text-zinc-500">
          No invoices found for the selected filters.
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const isExpanded = expandedIds[invoice.id] ?? false;
            const isExpandedLoading = isRowLoading[invoice.id] ?? false;
            const lineItems = itemsByInvoice[invoice.id] ?? [];
            const payments = paymentsByInvoice[invoice.id] ?? [];
            const amountPaid = payments.length
              ? payments.reduce((sum, item) => sum + Number(item.amount), 0)
              : Number(invoice.amountPaid ?? 0);
            const remaining = Math.max(Number(invoice.totalAmount) - amountPaid, 0);
            const canRecordPayment = invoice.status !== "paid" && invoice.status !== "draft";

            const whatsappMessage = encodeURIComponent(
              `Hi ${invoice.customerName?.split(" ")[0] ?? ""}, a reminder for invoice ${invoice.invoiceNumber}. Total: ${formatRupees(Number(invoice.totalAmount))}, Pending: ${formatRupees(remaining)}.`
            );
            const whatsappHref = invoice.customerPhone
              ? `https://wa.me/91${normalizePhone(invoice.customerPhone)}?text=${whatsappMessage}`
              : null;

            return (
              <article key={invoice.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => void toggleExpanded(invoice.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      void toggleExpanded(invoice.id);
                    }
                  }}
                  className="flex flex-wrap items-center gap-3 px-4 py-3"
                >
                  <span className="text-zinc-500">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </span>

                  <div className="min-w-36 font-semibold text-zinc-900">{invoice.invoiceNumber}</div>

                  {showCustomerColumn ? (
                    <div className="min-w-40 text-sm text-zinc-700">{invoice.customerName ?? "-"}</div>
                  ) : null}

                  <div className="text-sm text-zinc-600">{formatDate(invoice.issuedDate)}</div>

                  <div className="text-sm font-medium text-zinc-900">{formatRupees(Number(invoice.totalAmount))}</div>

                  <div className="text-sm text-zinc-600">{formatRupees(amountPaid)} paid</div>

                  <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${statusClassName(invoice.status)}`}>
                    {invoice.status}
                  </span>

                  <div className="ml-auto flex flex-wrap items-center gap-2" onClick={(event) => event.stopPropagation()}>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleDownloadPdf(invoice.id)}
                      disabled={pdfLoadingByInvoice[invoice.id]}
                    >
                      {pdfLoadingByInvoice[invoice.id] ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                      PDF
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleShareInvoice(invoice)}
                      disabled={shareLoadingByInvoice[invoice.id]}
                    >
                      {shareLoadingByInvoice[invoice.id] ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
                      Share
                    </Button>

                    {invoice.status !== "paid" && whatsappHref ? (
                      <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                        <Button type="button" size="sm" variant="outline">
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </Button>
                      </a>
                    ) : null}
                  </div>
                </div>

                {isExpanded ? (
                  <div className="border-t border-zinc-200 px-4 py-4">
                    {isExpandedLoading ? (
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading invoice details...
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <section className="overflow-x-auto">
                          <table className="min-w-full text-left text-sm text-zinc-700">
                            <thead>
                              <tr className="border-b border-zinc-200 text-xs uppercase tracking-[0.12em] text-zinc-500">
                                <th className="py-2 pr-3">#</th>
                                <th className="py-2 pr-3">Item</th>
                                <th className="py-2 pr-3">Unit</th>
                                <th className="py-2 pr-3">Qty</th>
                                <th className="py-2 pr-3">Rate</th>
                                <th className="py-2 pr-3">GST</th>
                                <th className="py-2 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lineItems.map((item, index) => (
                                <tr key={item.id} className="border-b border-zinc-100 last:border-b-0">
                                  <td className="py-2 pr-3">{index + 1}</td>
                                  <td className="py-2 pr-3 font-medium text-zinc-900">{item.name || item.description}</td>
                                  <td className="py-2 pr-3">{item.unit}</td>
                                  <td className="py-2 pr-3">{item.quantity}</td>
                                  <td className="py-2 pr-3">{formatRupees(Number(item.unitPrice))}</td>
                                  <td className="py-2 pr-3">{item.gstPercent}%</td>
                                  <td className="py-2 text-right font-medium text-zinc-900">{formatRupees(Number(item.amount))}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td colSpan={6} className="pt-3 text-right text-sm font-medium text-zinc-600">Subtotal</td>
                                <td className="pt-3 text-right text-sm font-semibold text-zinc-800">{formatRupees(Number(invoice.subtotal ?? 0))}</td>
                              </tr>
                              <tr>
                                <td colSpan={6} className="pt-1 text-right text-sm font-medium text-zinc-600">Tax</td>
                                <td className="pt-1 text-right text-sm font-semibold text-zinc-800">{formatRupees(Number(invoice.taxTotal ?? 0))}</td>
                              </tr>
                              <tr>
                                <td colSpan={6} className="pt-1 text-right text-sm font-medium text-zinc-600">Total</td>
                                <td className="pt-1 text-right text-base font-semibold text-zinc-900">{formatRupees(Number(invoice.totalAmount))}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </section>

                        {payments.length ? (
                          <section className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                            <h4 className="text-sm font-semibold text-zinc-900">Payments</h4>
                            <div className="space-y-2">
                              {payments.map((payment) => (
                                <div key={payment.id} className="rounded-lg border border-zinc-200 bg-white p-2">
                                  <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <span className="font-semibold text-zinc-900">{formatRupees(Number(payment.amount))}</span>
                                    <span className="text-zinc-600">{paymentMethodLabel(payment.paymentMethod)}</span>
                                    <span className="text-zinc-600">{formatDate(payment.paymentDate)}</span>
                                    {payment.reference ? <span className="text-zinc-500">Ref: {payment.reference}</span> : null}
                                  </div>
                                  <div className="mt-2">
                                    <PaymentAttachmentPreview paymentId={payment.id} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                        ) : null}

                        {canRecordPayment ? (
                          <div className="space-y-2">
                            {showPaymentFormByInvoice[invoice.id] ? (
                              <>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-zinc-700">Record Payment</span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setShowPaymentFormByInvoice((prev) => ({ ...prev, [invoice.id]: false }))
                                    }
                                  >
                                    Cancel
                                  </Button>
                                </div>
                                <InlinePaymentForm
                                  invoice={invoice}
                                  remainingBalance={remaining}
                                  onSuccess={async () => {
                                    setShowPaymentFormByInvoice((prev) => ({ ...prev, [invoice.id]: false }));
                                    await onPaymentRecorded(invoice.id);
                                  }}
                                />
                              </>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() =>
                                  setShowPaymentFormByInvoice((prev) => ({ ...prev, [invoice.id]: true }))
                                }
                              >
                                Add Payment
                              </Button>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}

          {canLoadMore ? (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => void loadInvoices("append")}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
