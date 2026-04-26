"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, MessageCircle, Pencil, Phone } from "lucide-react";
import { InvoiceListView } from "@/components/invoices/invoice-list-view";
import { Button } from "@/components/ui/button";
import { fetchCustomerSummary, updateCustomer } from "@/lib/api/customers";
import { fetchInvoices } from "@/lib/api/invoices";
import { fetchLeads } from "@/lib/api/leads";
import type { CustomerSummary } from "@/lib/types/customer";
import type { Invoice, InvoiceStatus } from "@/lib/types/invoice";
import type { Lead } from "@/lib/types/lead";
import { validateIndianMobile } from "@/lib/validation/phone";

type TabKey = "overview" | "leads" | "invoices";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "leads", label: "Leads" },
  { key: "invoices", label: "Invoices" },
];

function formatRupees(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function isActiveLead(lead: Lead): boolean {
  const stageName = (lead.stageName ?? "").toLowerCase();
  if (!stageName) {
    return true;
  }
  return stageName !== "won" && stageName !== "lost";
}

function isPendingInvoice(status: InvoiceStatus): boolean {
  return status === "sent" || status === "approved" || status === "partial";
}

export default function CustomerDetailClient({ customerId }: { customerId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [summary, setSummary] = useState<CustomerSummary | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [invoiceStatusPreset, setInvoiceStatusPreset] = useState<"all" | InvoiceStatus>("all");

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editGstNumber, setEditGstNumber] = useState("");
  const [editError, setEditError] = useState<string | null>(null);


  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "overview" || tab === "leads" || tab === "invoices") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/customers/${customerId}?${params.toString()}`);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [summaryData, leadsData, invoicesData] = await Promise.all([
        fetchCustomerSummary(customerId),
        fetchLeads({ customer_id: customerId }),
        fetchInvoices({ customer_id: customerId, limit: 100, offset: 0 }),
      ]);

      setSummary(summaryData);
      setLeads(leadsData);
      setPendingInvoices(invoicesData.items.filter((invoice) => isPendingInvoice(invoice.status)).slice(0, 5));
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
      ) {
        setErrorMessage((error as { message: string }).message);
      } else {
        setErrorMessage("Unable to load customer details.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const activeLeads = useMemo(() => leads.filter((lead) => isActiveLead(lead)), [leads]);

  const startEdit = () => {
    if (!summary) {
      return;
    }

    setEditName(summary.customer.name);
    setEditPhone(summary.customer.phone);
    setEditEmail(summary.customer.email ?? "");
    setEditNotes(summary.customer.notes ?? "");
    setEditAddress(summary.customer.address ?? "");
    setEditCity(summary.customer.city ?? "");
    setEditState(summary.customer.state ?? "");
    setEditGstNumber(summary.customer.gstNumber ?? "");
    setEditError(null);
    setIsEditOpen(true);
  };

  const saveCustomer = async () => {
    if (!summary) {
      return;
    }

    if (!editName.trim()) {
      setEditError("Name is required.");
      return;
    }

    const phoneCheck = validateIndianMobile(editPhone.trim());
    if (!phoneCheck.ok) {
      setEditError(phoneCheck.reason);
      return;
    }

    setIsSavingCustomer(true);
    setEditError(null);

    try {
      await updateCustomer(summary.customer.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim() || null,
        notes: editNotes.trim() || null,
        address: editAddress.trim() || null,
        city: editCity.trim() || null,
        state: editState.trim() || null,
        gst_number: editGstNumber.trim().toUpperCase() || null,
      });

      setIsEditOpen(false);
      await loadData();
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
      ) {
        setEditError((error as { message: string }).message);
      } else {
        setEditError("Unable to update customer.");
      }
    } finally {
      setIsSavingCustomer(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-sm text-red-600">{errorMessage ?? "Customer not found."}</p>
        <Link href="/customers">
          <Button type="button" variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to customers
          </Button>
        </Link>
      </div>
    );
  }

  const callHref = `tel:${summary.customer.phone}`;
  const whatsappHref = `https://wa.me/91${normalizePhone(summary.customer.phone)}`;

  return (
    <section className="space-y-6">
      <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Customers
      </Link>

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <header className="space-y-4 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-primary">{summary.customer.name}</h1>
            <p className="text-sm text-muted-foreground">{summary.customer.phone}{summary.customer.email ? `  |  ${summary.customer.email}` : ""}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={callHref}>
              <Button
                type="button"
                variant="outline"
                className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50 dark:hover:text-blue-200"
              >
                <Phone className="h-4 w-4 fill-current" />
                Call
              </Button>
            </a>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <Button
                type="button"
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-200"
              >
                <MessageCircle className="h-4 w-4 fill-current" />
                WhatsApp
              </Button>
            </a>
            <Button type="button" variant="outline" onClick={startEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => switchTab("overview")}
            className="rounded-lg border bg-muted px-3 py-3 text-left"
          >
            <p className="text-lg font-semibold text-primary">{formatRupees(summary.lifetimeValue)}</p>
            <p className="text-xs text-muted-foreground">Lifetime Revenue</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setInvoiceStatusPreset("partial");
              switchTab("invoices");
            }}
            className="rounded-lg border bg-muted px-3 py-3 text-left"
          >
            <p className="text-lg font-semibold text-primary">{formatRupees(summary.totalOutstanding)}</p>
            <p className="text-xs text-muted-foreground">Outstanding</p>
          </button>

          <button
            type="button"
            onClick={() => switchTab("leads")}
            className="rounded-lg border bg-muted px-3 py-3 text-left"
          >
            <p className="text-lg font-semibold text-primary">{summary.activeLeads} active</p>
            <p className="text-xs text-muted-foreground">Leads ({summary.totalLeads} total)</p>
          </button>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 rounded-xl border bg-card p-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => switchTab(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
            </div>
            {summary.recentActivities.length ? (
              <div className="space-y-2">
                {summary.recentActivities.map((activity, index) => (
                  <div key={`${activity.date}-${index}`} className="rounded-lg border border-border bg-muted p-2">
                    <p className="text-xs text-muted-foreground">{formatDateTime(activity.date)}</p>
                    <p className="text-sm text-foreground">{activity.description}</p>
                    {activity.leadTitle ? <p className="text-xs text-muted-foreground">{activity.leadTitle}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity yet.</p>
            )}
          </section>

          <section className="rounded-xl border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Active Leads</h3>
              <button type="button" className="text-xs text-primary hover:underline" onClick={() => switchTab("leads")}>View All</button>
            </div>
            {activeLeads.length ? (
              <div className="space-y-2">
                {activeLeads.slice(0, 4).map((lead) => (
                  <Link key={lead.id} href={`/leads/${lead.id}`} className="block rounded-lg border border-border bg-muted px-3 py-2 hover:bg-accent">
                    <p className="text-sm font-medium text-primary">{lead.title}</p>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{lead.stageName ?? "Unknown stage"}</span>
                      <span>{lead.estimatedValue ? formatRupees(Number(lead.estimatedValue)) : "-"}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active leads.</p>
            )}
          </section>

          <section className="rounded-xl border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Pending Invoices</h3>
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => {
                  setInvoiceStatusPreset("all");
                  switchTab("invoices");
                }}
              >
                View All
              </button>
            </div>
            {pendingInvoices.length ? (
              <div className="space-y-2">
                {pendingInvoices.map((invoice) => {
                  const phone = summary.customer.phone;
                  const reminderText = encodeURIComponent(
                    `Hi ${summary.customer.name.split(" ")[0]}, reminder for invoice ${invoice.invoiceNumber} of ${formatRupees(Number(invoice.totalAmount))}.`
                  );
                  const href = `https://wa.me/91${normalizePhone(phone)}?text=${reminderText}`;

                  return (
                    <div key={invoice.id} className="rounded-lg border border-border bg-muted px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-primary">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground">{formatRupees(Number(invoice.totalAmount))}</p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${invoice.status === "approved" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="mt-2">
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                          Send WhatsApp reminder
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending invoices.</p>
            )}
          </section>

        </div>
      ) : null}

      {activeTab === "leads" ? (
        <section className="space-y-3 rounded-xl border bg-card p-4">
          {leads.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {leads.map((lead) => (
                <Link key={lead.id} href={`/leads/${lead.id}`} className="rounded-lg border bg-muted p-3 hover:bg-accent">
                  <p className="text-sm font-semibold text-primary">{lead.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Stage: {lead.stageName ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">Value: {lead.estimatedValue ? formatRupees(Number(lead.estimatedValue)) : "-"}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No leads found for this customer.</p>
          )}
        </section>
      ) : null}

      {activeTab === "invoices" ? (
        <InvoiceListView
          customerId={customerId}
          showCustomerColumn={false}
          showFilters={true}
          showSummaryBar={true}
          initialStatusFilter={invoiceStatusPreset}
        />
      ) : null}

      {isEditOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-foreground/40"
            onClick={isSavingCustomer ? undefined : () => setIsEditOpen(false)}
            aria-label="Close edit dialog"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-card p-4 shadow-xl">
              <h3 className="text-base font-semibold text-foreground">Edit Customer</h3>

              {editError ? (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {editError}
                </div>
              ) : null}

              <div className="mt-3 grid gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="Name"
                    disabled={isSavingCustomer}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(event) => setEditPhone(event.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="Phone"
                    disabled={isSavingCustomer}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(event) => setEditEmail(event.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="Email"
                    disabled={isSavingCustomer}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(event) => setEditAddress(event.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="Street / building"
                    disabled={isSavingCustomer}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">City</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(event) => setEditCity(event.target.value)}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="City"
                      disabled={isSavingCustomer}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">State</label>
                    <input
                      type="text"
                      value={editState}
                      onChange={(event) => setEditState(event.target.value)}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="State"
                      disabled={isSavingCustomer}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">GSTIN</label>
                  <input
                    type="text"
                    value={editGstNumber}
                    onChange={(event) => setEditGstNumber(event.target.value.toUpperCase())}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm uppercase tracking-wider"
                    placeholder="22AAAAA0000A1Z5"
                    disabled={isSavingCustomer}
                    maxLength={15}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(event) => setEditNotes(event.target.value)}
                    className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="Internal notes (not shown to customer)"
                    disabled={isSavingCustomer}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSavingCustomer}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={() => void saveCustomer()} disabled={isSavingCustomer}>
                  {isSavingCustomer ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
