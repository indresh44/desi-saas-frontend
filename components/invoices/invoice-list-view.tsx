"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  Loader2,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Share2,
  X,
} from "lucide-react";
import { AddAdjustmentDialog } from "@/components/invoices/add-adjustment-dialog";
import { ApproveInvoiceDialog } from "@/components/invoices/approve-invoice-dialog";
import { CancelInvoiceDialog } from "@/components/invoices/cancel-invoice-dialog";
import { InvoiceItemEnrichment } from "@/components/invoices/invoice-item-enrichment";
import { PaymentAttachmentPreview } from "@/components/leads/payment-attachment-preview";
import { RecordPaymentModal } from "@/components/leads/record-payment-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchCustomers } from "@/lib/api/customers";
import {
  cancelInvoice,
  deleteInvoiceAdjustment,
  fetchInvoiceAdjustments,
  fetchInvoiceItems,
  fetchInvoicePayments,
  fetchInvoices,
  updateInvoiceStatus,
} from "@/lib/api/invoices";
import { shareInvoicePdf, buildBrandedInvoiceUrl } from "@/lib/utils/share";
import { useAuth } from "@/lib/auth/auth-context";
import type { Customer } from "@/lib/types/customer";
import type {
  Invoice,
  InvoiceAdjustment,
  InvoiceItem,
  InvoiceStatus,
  Payment,
  PaymentMethod,
} from "@/lib/types/invoice";

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

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

const DATE_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "custom", label: "Custom Range" },
];

const inputClassName =
  "w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground";

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
  if (status === "approved") return "bg-teal-100 text-teal-700";
  if (status === "sent") return "bg-blue-100 text-blue-700";
  if (status === "partial") return "bg-amber-100 text-amber-700";
  if (status === "cancelled") return "bg-rose-100 text-rose-700";
  return "bg-muted text-muted-foreground";
}

function paymentMethodLabel(value: PaymentMethod): string {
  if (value === "upi") return "UPI";
  if (value === "cash") return "Cash";
  if (value === "bank_transfer") return "Bank Transfer";
  return "Card";
}

function paymentMethodClass(value: PaymentMethod): string {
  if (value === "upi") return "bg-fuchsia-100 text-fuchsia-700";
  if (value === "cash") return "bg-green-100 text-green-700";
  if (value === "bank_transfer") return "bg-blue-100 text-blue-700";
  return "bg-orange-100 text-orange-700";
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
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

export function InvoiceListView({
  customerId,
  leadId,
  showCustomerColumn = true,
  showFilters = true,
  showSummaryBar = true,
  initialStatusFilter = "all",
}: InvoiceListViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { business } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [summaryOutstanding, setSummaryOutstanding] = useState(0);
  const [summaryCount, setSummaryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Invoice number search. The input drives `invoiceNumberSearch` for
  // immediate UI feedback; a debounced copy (`debouncedInvoiceNumber`)
  // is what the API call actually uses, plus what gets synced to the
  // `?q=` URL param via router.replace. Reading from
  // `searchParams.get("q")` on init means a deep link from the dashboard
  // ("View Invoice") lands with the search pre-populated.
  const initialQ = searchParams.get("q") ?? "";
  const [invoiceNumberSearch, setInvoiceNumberSearch] = useState<string>(initialQ);
  const [debouncedInvoiceNumber, setDebouncedInvoiceNumber] = useState<string>(initialQ);

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
  const [adjustmentsByInvoice, setAdjustmentsByInvoice] = useState<
    Record<string, InvoiceAdjustment[]>
  >({});
  const [approveDialogInvoice, setApproveDialogInvoice] = useState<Invoice | null>(null);
  const [adjustmentDialogInvoice, setAdjustmentDialogInvoice] = useState<Invoice | null>(null);
  const [cancelDialogInvoice, setCancelDialogInvoice] = useState<Invoice | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);

  const [shareLoadingByInvoice, setShareLoadingByInvoice] = useState<Record<string, boolean>>({});
  const [statusChangingByInvoice, setStatusChangingByInvoice] = useState<Record<string, boolean>>({});
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [redirectingTo, setRedirectingTo] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCustomerId(customerId);
  }, [customerId]);

  useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  // Debounce the invoice number search input. After 250ms of no typing,
  // commit the value to `debouncedInvoiceNumber` (which the API call
  // depends on) and update the URL ?q= param via router.replace so the
  // search state survives back-button + is shareable.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedInvoiceNumber(invoiceNumberSearch);

      const params = new URLSearchParams(searchParams.toString());
      const trimmed = invoiceNumberSearch.trim();
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      const queryString = params.toString();
      const nextUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;
      router.replace(nextUrl, { scroll: false });
    }, 250);
    return () => window.clearTimeout(handle);
  }, [invoiceNumberSearch, pathname, router, searchParams]);

  // One-time reset on mount: if we landed with `?q=` in the URL (e.g. via
  // the dashboard's "View Invoice" link), clear other filters that could
  // hide the searched invoice. Without this, a user landing here with
  // status=paid stuck from a previous session sees an empty search result.
  // Only resets when this is the global /invoices page (no customerId
  // prop) to avoid disturbing scoped views.
  const didInitialFilterResetRef = useRef(false);
  useEffect(() => {
    if (didInitialFilterResetRef.current) return;
    didInitialFilterResetRef.current = true;
    if (customerId) return;
    if (!searchParams.get("q")) return;

    setStatusFilter("all");
    setDatePreset("all");
    setShowCancelled(false);
  }, [customerId, searchParams]);

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
        const trimmedSearch = debouncedInvoiceNumber.trim();
        const response = await fetchInvoices({
          customer_id: selectedCustomerId,
          lead_id: leadId,
          status: statusFilter === "all" ? undefined : statusFilter,
          from_date: dateRange.from,
          to_date: dateRange.to,
          invoice_number: trimmedSearch || undefined,
          include_cancelled: showCancelled || statusFilter === "cancelled",
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
    [customFromDate, customToDate, datePreset, debouncedInvoiceNumber, invoices.length, leadId, selectedCustomerId, showCancelled, statusFilter]
  );

  useEffect(() => {
    void loadInvoices("reset");
  }, [loadInvoices]);

  const loadExpandedDetails = useCallback(
    async (invoiceId: string) => {
      if (
        itemsByInvoice[invoiceId] &&
        paymentsByInvoice[invoiceId] &&
        adjustmentsByInvoice[invoiceId]
      ) {
        return;
      }

      setIsRowLoading((prev) => ({ ...prev, [invoiceId]: true }));
      try {
        const [items, payments, adjustments] = await Promise.all([
          fetchInvoiceItems(invoiceId),
          fetchInvoicePayments(invoiceId),
          fetchInvoiceAdjustments(invoiceId),
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

        setAdjustmentsByInvoice((prev) => ({
          ...prev,
          [invoiceId]: adjustments,
        }));
      } finally {
        setIsRowLoading((prev) => ({ ...prev, [invoiceId]: false }));
      }
    },
    [itemsByInvoice, paymentsByInvoice, adjustmentsByInvoice]
  );

  const toggleExpanded = async (invoiceId: string) => {
    const isCurrentlyExpanded = expandedIds[invoiceId] ?? false;
    setExpandedIds((prev) => ({ ...prev, [invoiceId]: !isCurrentlyExpanded }));

    if (!isCurrentlyExpanded) {
      await loadExpandedDetails(invoiceId);
    }
  };

  const onPaymentRecorded = async (invoiceId: string) => {
    setPaymentModalInvoice(null);
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

  const handleDownloadPdf = (invoice: Invoice) => {
    const url = buildBrandedInvoiceUrl(
      invoice.id,
      invoice.invoiceNumber,
      invoice.status,
      invoice.updatedAt,
    );
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareInvoice = async (invoice: Invoice) => {
    setShareLoadingByInvoice((prev) => ({ ...prev, [invoice.id]: true }));
    try {
      await shareInvoicePdf(
        invoice.id,
        invoice.invoiceNumber,
        invoice.status,
        business?.name,
        Number(invoice.totalAmount ?? 0),
        invoice.updatedAt,
      );
    } finally {
      setShareLoadingByInvoice((prev) => ({ ...prev, [invoice.id]: false }));
    }
  };

  const handleEditItems = (invoice: Invoice) => {
    if (!invoice.leadId) return;
    setRedirectingTo(invoice.leadTitle ?? "lead");
    setTimeout(() => {
      router.push(`/leads/${invoice.leadId}?invoice=${invoice.id}&edit=1`);
    }, 700);
  };

  const handleApprove = async (invoice: Invoice) => {
    setStatusChangingByInvoice((prev) => ({ ...prev, [invoice.id]: true }));
    try {
      const updated = await updateInvoiceStatus(invoice.id, "approved");
      setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
    } finally {
      setStatusChangingByInvoice((prev) => ({ ...prev, [invoice.id]: false }));
    }
  };

  const handleAddMoreToDeal = (invoice: Invoice) => {
    if (!invoice.leadId) return;
    setRedirectingTo(invoice.leadTitle ?? "lead");
    setTimeout(() => {
      router.push(`/leads/${invoice.leadId}?newInvoice=1`);
    }, 700);
  };

  const handleCancelInvoice = async (invoice: Invoice, reason: string | null) => {
    const updated = await cancelInvoice(invoice.id, reason ?? undefined);
    setInvoices((prev) => {
      // If cancelled rows aren't visible in the current view, drop it; otherwise
      // replace it in place so the user sees the new status immediately.
      if (!showCancelled && statusFilter !== "cancelled") {
        return prev.filter((inv) => inv.id !== invoice.id);
      }
      return prev.map((inv) => (inv.id === updated.id ? updated : inv));
    });
  };

  const handleAdjustmentSaved = async (invoiceId: string) => {
    // Refetch the list + the expanded invoice's adjustments so totals & status refresh.
    const [adjustments] = await Promise.all([
      fetchInvoiceAdjustments(invoiceId),
      loadInvoices("reset"),
    ]);
    setAdjustmentsByInvoice((prev) => ({ ...prev, [invoiceId]: adjustments }));
  };

  const handleDeleteAdjustment = async (invoiceId: string, adjustmentId: string) => {
    await deleteInvoiceAdjustment(invoiceId, adjustmentId);
    const [adjustments] = await Promise.all([
      fetchInvoiceAdjustments(invoiceId),
      loadInvoices("reset"),
    ]);
    setAdjustmentsByInvoice((prev) => ({ ...prev, [invoiceId]: adjustments }));
  };

  const computeRemainingBalance = (invoice: Invoice): number => {
    const adjustments = adjustmentsByInvoice[invoice.id] ?? [];
    const adjTotal = adjustments.reduce((sum, a) => sum + Number(a.amount), 0);
    const total = Number(invoice.totalAmount ?? 0);
    const payments = paymentsByInvoice[invoice.id] ?? [];
    const paid = payments.length
      ? payments.reduce((sum, p) => sum + Number(p.amount), 0)
      : Number(invoice.amountPaid ?? 0);
    return Math.max(total - adjTotal - paid, 0);
  };

  const canLoadMore = invoices.length < total;

  return (
    <section className="space-y-4">
      {showSummaryBar ? (
        <div className="rounded-xl border bg-card px-4 py-3 text-sm font-medium text-foreground">
          {formatRupees(summaryOutstanding)} outstanding across {summaryCount} invoice{summaryCount === 1 ? "" : "s"}
        </div>
      ) : null}

      {showFilters ? (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          {/* Invoice number search. Synced with `?q=` URL param so that
              dashboard "View Invoice" deep links land here pre-filtered.
              Substring match, case-insensitive on the backend. */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={invoiceNumberSearch}
              onChange={(event) => setInvoiceNumberSearch(event.target.value)}
              placeholder="Search by invoice number…"
              aria-label="Search by invoice number"
              autoComplete="off"
              enterKeyHint="search"
              className="w-full rounded-lg border bg-background py-2 pl-9 pr-9 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 md:text-sm"
            />
            {invoiceNumberSearch ? (
              <button
                type="button"
                onClick={() => setInvoiceNumberSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {STATUS_OPTIONS.filter((opt) => opt.value !== "cancelled").map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === option.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
            <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={showCancelled || statusFilter === "cancelled"}
                onChange={(e) => setShowCancelled(e.target.checked)}
                className="h-3 w-3"
              />
              Show cancelled
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date Range</label>
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
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Customer</label>
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
                    <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border bg-card shadow-md">
                      <button
                        type="button"
                        onMouseDown={() => {
                          setSelectedCustomerId(undefined);
                          setCustomerSearch("");
                          setIsCustomerDropdownOpen(false);
                        }}
                        className="block w-full border-b border-border px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent"
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
                          className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                        >
                          <div className="font-medium text-primary">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">{customer.phone}</div>
                        </button>
                      ))}
                      {!filteredCustomers.length ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No matching customers.</div>
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
        <div className="space-y-2 rounded-xl border bg-card p-4">
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
        </div>
      ) : !invoices.length ? (
        <div className="rounded-xl border border-dashed bg-card px-6 py-10 text-center text-sm text-muted-foreground">
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

            const isEstimate = invoice.status === "draft" || invoice.status === "sent";
            const docLabel = isEstimate ? "estimate" : "invoice";
            const brandedInvoiceUrl = buildBrandedInvoiceUrl(
              invoice.id,
              invoice.invoiceNumber,
              invoice.status,
              invoice.updatedAt,
            );
            const whatsappMessage = encodeURIComponent(
              `Hi ${invoice.customerName?.split(" ")[0] ?? ""}, a reminder for ${docLabel} ${invoice.invoiceNumber}. Total: ${formatRupees(Number(invoice.totalAmount))}, Pending: ${formatRupees(remaining)}.\nView & download: ${brandedInvoiceUrl}`
            );
            const whatsappHref = invoice.customerPhone
              ? `https://wa.me/91${normalizePhone(invoice.customerPhone)}?text=${whatsappMessage}`
              : null;

            const isCancelled = invoice.status === "cancelled";

            return (
              <article
                key={invoice.id}
                className={`overflow-hidden rounded-xl border bg-card ${
                  isCancelled ? "opacity-60" : ""
                }`}
                title={isCancelled && invoice.cancelledReason ? `Cancelled: ${invoice.cancelledReason}` : undefined}
              >
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
                  <span className="text-muted-foreground">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </span>

                  <div className="min-w-36 font-semibold text-primary">{invoice.invoiceNumber}</div>

                  {showCustomerColumn ? (
                    <div className="min-w-40">
                      <div className="text-sm text-foreground">{invoice.customerName ?? "-"}</div>
                      {invoice.leadTitle && invoice.leadId ? (
                        <a
                          href={`/leads/${invoice.leadId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {invoice.leadTitle}
                        </a>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="text-sm text-muted-foreground">{formatDate(invoice.issuedDate)}</div>

                  <div className="text-sm font-medium text-primary">{formatRupees(Number(invoice.totalAmount))}</div>

                  <div className="text-sm text-muted-foreground">{formatRupees(amountPaid)} paid</div>

                  <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${statusClassName(invoice.status)}`}>
                    {invoice.status}
                  </span>

                  <div className="ml-auto flex flex-wrap items-center gap-2" onClick={(event) => event.stopPropagation()}>
                    {invoice.status === "cancelled" ? null : (invoice.status === "draft" || invoice.status === "sent") ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-900/60 dark:text-teal-300 dark:hover:bg-teal-900/40"
                        onClick={() => setApproveDialogInvoice(invoice)}
                        disabled={statusChangingByInvoice[invoice.id]}
                      >
                        {statusChangingByInvoice[invoice.id]
                          ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          : <CheckCircle className="h-3.5 w-3.5" />}
                        Approve
                      </Button>
                    ) : null}

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadPdf(invoice)}
                    >
                      <Download className="h-3.5 w-3.5" />
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

                    {invoice.status !== "paid" && invoice.status !== "cancelled" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" size="sm" variant="outline" aria-label="More actions">
                            ⋯
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(invoice.status === "sent" ||
                            invoice.status === "approved" ||
                            invoice.status === "partial") ? (
                            <DropdownMenuItem onSelect={() => setAdjustmentDialogInvoice(invoice)}>
                              Add adjustment…
                            </DropdownMenuItem>
                          ) : null}
                          {invoice.leadId ? (
                            <DropdownMenuItem onSelect={() => handleAddMoreToDeal(invoice)}>
                              Add more to this deal
                            </DropdownMenuItem>
                          ) : null}
                          {(invoice.status === "draft" ||
                            invoice.status === "sent" ||
                            invoice.status === "approved") &&
                          amountPaid === 0 ? (
                            <DropdownMenuItem
                              onSelect={() => setCancelDialogInvoice(invoice)}
                              destructive
                            >
                              Cancel invoice…
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}

                  </div>
                </div>

                {isExpanded ? (
                  <div className="border-t px-4 py-4">
                    {isExpandedLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading invoice details...
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <section>
                          <div className="overflow-x-auto">
                            <div className="min-w-[600px] text-sm text-foreground">
                              {/* Header row — same grid template as body rows so columns align */}
                              <div className="grid grid-cols-[24px_1fr_60px_50px_80px_55px_80px] gap-1 border-b px-1 py-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                <div></div>
                                <div>Item</div>
                                <div>Unit</div>
                                <div>Qty</div>
                                <div>Rate</div>
                                <div>GST</div>
                                <div className="text-right">Amount</div>
                              </div>

                              {lineItems.map((item) => {
                                const isItemExpanded = expandedItemId === item.id;
                                const hasEnrichment = item.deliverables && item.deliverables.length > 0;

                                return (
                                  <div key={item.id} className="border-b border-border last:border-b-0">
                                    <div
                                      role="button"
                                      tabIndex={0}
                                      className="grid grid-cols-[24px_1fr_60px_50px_80px_55px_80px] gap-1 px-1 py-2 cursor-pointer hover:bg-muted/50 transition-colors items-center"
                                      onClick={() => setExpandedItemId(isItemExpanded ? null : item.id)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          setExpandedItemId(isItemExpanded ? null : item.id);
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-center">
                                        <svg
                                          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isItemExpanded ? "rotate-90" : ""}`}
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                        >
                                          <path d="M9 18l6-6-6-6" />
                                        </svg>
                                      </div>
                                      <div className="flex items-center gap-1.5 font-medium text-primary truncate">
                                        {item.name || item.description}
                                        {hasEnrichment && (
                                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                                        )}
                                      </div>
                                      <div className="text-muted-foreground">{item.unit}</div>
                                      <div>{item.quantity}</div>
                                      <div>{formatRupees(Number(item.unitPrice))}</div>
                                      <div className="text-muted-foreground">{item.gstPercent}%</div>
                                      <div className="text-right font-medium text-primary">{formatRupees(Number(item.amount))}</div>
                                    </div>
                                    {isItemExpanded && (
                                      <InvoiceItemEnrichment
                                        item={item}
                                        invoiceId={invoice.id}
                                        invoiceStatus={invoice.status}
                                        onItemUpdated={(updated: InvoiceItem) => {
                                          setItemsByInvoice((prev) => ({
                                            ...prev,
                                            [invoice.id]: (prev[invoice.id] ?? []).map((it) =>
                                              it.id === updated.id ? updated : it
                                            ),
                                          }));
                                        }}
                                      />
                                    )}
                                  </div>
                                );
                              })}

                              {/* Totals footer — right-aligned against the grid's amount column */}
                              <div className="space-y-1 pt-3">
                                <div className="flex justify-end gap-4 pr-1 text-sm">
                                  <span className="text-muted-foreground">Subtotal</span>
                                  <span className="w-20 text-right font-semibold text-foreground">{formatRupees(Number(invoice.subtotal ?? 0))}</span>
                                </div>
                                <div className="flex justify-end gap-4 pr-1 text-sm">
                                  <span className="text-muted-foreground">Tax</span>
                                  <span className="w-20 text-right font-semibold text-foreground">{formatRupees(Number(invoice.taxTotal ?? 0))}</span>
                                </div>
                                {(adjustmentsByInvoice[invoice.id] ?? []).map((adj) => (
                                  <div key={adj.id} className="flex justify-end gap-4 pr-1 text-sm group">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                      {adj.adjustmentType === "discount" ? "Discount" : "Write-off"}
                                      {adj.reason ? <span className="text-xs opacity-70">({adj.reason})</span> : null}
                                      <button
                                        type="button"
                                        onClick={() => void handleDeleteAdjustment(invoice.id, adj.id)}
                                        className="ml-1 text-muted-foreground/60 hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                                        aria-label="Remove adjustment"
                                        title="Remove"
                                      >
                                        ×
                                      </button>
                                    </span>
                                    <span className="w-20 text-right font-medium text-muted-foreground">
                                      − {formatRupees(Number(adj.amount))}
                                    </span>
                                  </div>
                                ))}
                                <div className="flex justify-end gap-4 pr-1 text-sm">
                                  <span className="text-muted-foreground">Total</span>
                                  <span className="w-20 text-right text-base font-semibold text-primary">
                                    {formatRupees(
                                      Number(invoice.totalAmount) -
                                      (adjustmentsByInvoice[invoice.id] ?? []).reduce(
                                        (sum, a) => sum + Number(a.amount),
                                        0
                                      )
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {invoice.status === "draft" && lineItems.some((it) => it.deliverables && it.deliverables.length > 0) && (
                            <div className="flex items-center justify-between px-3 py-2.5 border-t border-border/50 bg-muted/20 mt-2 rounded-lg">
                              <div>
                                <p className="text-xs font-medium">Package view</p>
                                <p className="text-[11px] text-muted-foreground">
                                  Clients see a visual package when opening the invoice link
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const link = `${window.location.origin}/invoices/public/${invoice.id}`;
                                  void navigator.clipboard.writeText(link);
                                }}
                                className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                              >
                                Copy package link
                              </button>
                            </div>
                          )}
                        </section>

                        {payments.length ? (
                          <section className="space-y-2 rounded-xl border bg-muted p-3">
                            <h4 className="text-sm font-semibold text-primary">Payments</h4>
                            <div className="space-y-2">
                              {payments.map((payment) => (
                                <div key={payment.id} className="rounded-xl border border-border bg-card px-3 py-3">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="min-w-0 space-y-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-medium text-foreground">
                                          {formatDate(payment.paymentDate)}
                                        </span>
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentMethodClass(payment.paymentMethod)}`}>
                                          {paymentMethodLabel(payment.paymentMethod)}
                                        </span>
                                      </div>
                                      {payment.reference ? (
                                        <p className="text-xs text-muted-foreground">{payment.reference}</p>
                                      ) : null}
                                    </div>
                                    <div className="text-right text-sm font-semibold text-green-600">
                                      {formatRupees(Number(payment.amount))}
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <PaymentAttachmentPreview paymentId={payment.id} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                        ) : null}

                        <div className="flex flex-wrap gap-2">
                          {canRecordPayment ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => setPaymentModalInvoice(invoice)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Record Payment
                            </Button>
                          ) : null}

                          {invoice.status === "draft" && invoice.leadId ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleEditItems(invoice)}
                              disabled={redirectingTo !== null}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit items
                            </Button>
                          ) : null}
                        </div>
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

      {redirectingTo ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full border bg-card px-5 py-3 shadow-xl text-sm text-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            Opening <span className="font-medium text-primary">{redirectingTo}</span>…
          </div>
        </div>
      ) : null}

      {paymentModalInvoice ? (
        <RecordPaymentModal
          invoice={paymentModalInvoice}
          remainingAmount={Math.max(
            Number(paymentModalInvoice.totalAmount) -
              (adjustmentsByInvoice[paymentModalInvoice.id]?.reduce((s, a) => s + Number(a.amount), 0) ?? 0) -
              (paymentsByInvoice[paymentModalInvoice.id]?.reduce((s, p) => s + Number(p.amount), 0) ??
                Number(paymentModalInvoice.amountPaid ?? 0)),
            0
          )}
          onClose={() => setPaymentModalInvoice(null)}
          onSuccess={() => void onPaymentRecorded(paymentModalInvoice.id)}
        />
      ) : null}

      <ApproveInvoiceDialog
        open={approveDialogInvoice !== null}
        invoiceNumber={approveDialogInvoice?.invoiceNumber}
        onClose={() => setApproveDialogInvoice(null)}
        onConfirm={async () => {
          if (approveDialogInvoice) {
            await handleApprove(approveDialogInvoice);
          }
        }}
      />

      {adjustmentDialogInvoice ? (
        <AddAdjustmentDialog
          open={adjustmentDialogInvoice !== null}
          invoiceId={adjustmentDialogInvoice.id}
          invoiceNumber={adjustmentDialogInvoice.invoiceNumber}
          remainingBalance={computeRemainingBalance(adjustmentDialogInvoice)}
          onClose={() => setAdjustmentDialogInvoice(null)}
          onSaved={() => void handleAdjustmentSaved(adjustmentDialogInvoice.id)}
        />
      ) : null}

      <CancelInvoiceDialog
        open={cancelDialogInvoice !== null}
        invoiceNumber={cancelDialogInvoice?.invoiceNumber}
        onClose={() => setCancelDialogInvoice(null)}
        onConfirm={async (reason) => {
          if (cancelDialogInvoice) {
            await handleCancelInvoice(cancelDialogInvoice, reason);
          }
        }}
      />
    </section>
  );
}
