"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Pencil, Phone } from "lucide-react";
import { InvoiceListView } from "@/components/invoices/invoice-list-view";
import { Button } from "@/components/ui/button";
import { LedgerButton, Mono, PageTitle, WhatsAppIcon } from "@/components/ledger";
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

/** Surface-tinted panel used for the overview cards. */
function OverviewCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="p-4"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--ledger-radius-control)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[14px] font-bold" style={{ color: "var(--color-text)" }}>
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function ViewAllLink({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[12px] font-semibold transition hover:underline"
      style={{ color: "var(--color-accent)" }}
    >
      {children}
    </button>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13.5px]" style={{ color: "var(--color-text-muted)" }}>
      {children}
    </p>
  );
}

/**
 * Stat tile — clickable summary chip used in the customer header.
 * Mono value + muted label, tinted border on hover. `tone="warn"` flags
 * the outstanding-balance tile when there's money owed.
 */
function StatTile({
  value,
  label,
  onClick,
  tone = "neutral",
}: {
  value: string;
  label: string;
  onClick?: () => void;
  tone?: "neutral" | "warn";
}) {
  const valueColor =
    tone === "warn" ? "var(--follow-overdue)" : "var(--color-text)";
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left transition-colors"
      style={{
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--ledger-radius-control)",
        padding: "10px 14px",
      }}
    >
      <Mono
        as="p"
        className="text-[17px] font-bold tracking-[-0.01em]"
        style={{ color: valueColor }}
      >
        {value}
      </Mono>
      <p
        className="ledger-mono mt-1 text-[10.5px] font-semibold uppercase tracking-[0.06em]"
        style={{ color: "var(--color-text-faint)" }}
      >
        {label}
      </p>
    </button>
  );
}

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
        <Loader2
          className="h-6 w-6 animate-spin"
          style={{ color: "var(--color-text-muted)" }}
        />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-[13px]" style={{ color: "var(--follow-overdue)" }}>
          {errorMessage ?? "Customer not found."}
        </p>
        <Link href="/customers">
          <LedgerButton variant="action" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to customers
          </LedgerButton>
        </Link>
      </div>
    );
  }

  const callHref = `tel:${summary.customer.phone}`;
  const whatsappHref = `https://wa.me/91${normalizePhone(summary.customer.phone)}`;

  return (
    <section className="space-y-6">
      <Link
        href="/customers"
        className="inline-flex items-center gap-1 text-[13px] font-semibold transition hover:underline"
        style={{ color: "var(--color-text-muted)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Customers
      </Link>

      {errorMessage ? (
        <div
          className="text-[13px]"
          style={{
            background: "var(--follow-overdue-bg)",
            border: "1px solid color-mix(in oklch, var(--follow-overdue) 30%, transparent)",
            color: "var(--follow-overdue)",
            padding: "10px 14px",
            borderRadius: "var(--ledger-radius-control)",
          }}
        >
          {errorMessage}
        </div>
      ) : null}

      <header
        className="space-y-4 p-4"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--ledger-radius-control)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <PageTitle style={{ color: "var(--color-accent)" }}>
              {summary.customer.name}
            </PageTitle>
            <p
              className="mt-1 text-[13.5px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              <Mono>{summary.customer.phone}</Mono>
              {summary.customer.email ? `  |  ${summary.customer.email}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <LedgerButton variant="whatsapp" size="md">
                <WhatsAppIcon size={15} />
                WhatsApp
              </LedgerButton>
            </a>
            <a href={callHref}>
              <LedgerButton variant="action" size="md">
                <Phone className="size-[15px]" strokeWidth={1.8} />
                Call
              </LedgerButton>
            </a>
            <LedgerButton variant="action" size="md" onClick={startEdit}>
              <Pencil className="size-[15px]" strokeWidth={1.8} />
              Edit
            </LedgerButton>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            value={formatRupees(summary.lifetimeValue)}
            label="Lifetime Revenue"
            onClick={() => switchTab("overview")}
          />
          <StatTile
            value={formatRupees(summary.totalOutstanding)}
            label="Outstanding"
            onClick={() => {
              setInvoiceStatusPreset("partial");
              switchTab("invoices");
            }}
            tone={summary.totalOutstanding > 0 ? "warn" : "neutral"}
          />
          <StatTile
            value={`${summary.activeLeads} active`}
            label={`Leads (${summary.totalLeads} total)`}
            onClick={() => switchTab("leads")}
          />
        </div>
      </header>

      <nav
        className="flex flex-wrap gap-2 p-2"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--ledger-radius-control)",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => switchTab(tab.key)}
              className="px-3 py-1.5 text-[13px] font-semibold transition-colors"
              style={{
                borderRadius: "var(--ledger-radius-sm)",
                background: isActive ? "var(--color-accent)" : "transparent",
                color: isActive
                  ? "var(--color-accent-contrast)"
                  : "var(--color-text-muted)",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === "overview" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <OverviewCard title="Recent Activity">
            {summary.recentActivities.length ? (
              <div className="space-y-2">
                {summary.recentActivities.map((activity, index) => (
                  <div
                    key={`${activity.date}-${index}`}
                    className="p-2"
                    style={{
                      background: "var(--color-surface-raised)",
                      border: "1px solid var(--color-border-subtle)",
                      borderRadius: "var(--ledger-radius-sm)",
                    }}
                  >
                    <Mono
                      as="p"
                      className="text-[11.5px]"
                      style={{ color: "var(--color-text-faint)" }}
                    >
                      {formatDateTime(activity.date)}
                    </Mono>
                    <p className="text-[13.5px]" style={{ color: "var(--color-text)" }}>
                      {activity.description}
                    </p>
                    {activity.leadTitle ? (
                      <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                        {activity.leadTitle}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyLine>No recent activity yet.</EmptyLine>
            )}
          </OverviewCard>

          <OverviewCard
            title="Active Leads"
            action={
              <ViewAllLink onClick={() => switchTab("leads")}>View All</ViewAllLink>
            }
          >
            {activeLeads.length ? (
              <div className="space-y-2">
                {activeLeads.slice(0, 4).map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className="block px-3 py-2 transition-colors hover:bg-[color:var(--color-surface)]"
                    style={{
                      background: "var(--color-surface-raised)",
                      border: "1px solid var(--color-border-subtle)",
                      borderRadius: "var(--ledger-radius-sm)",
                    }}
                  >
                    <p
                      className="text-[13.5px] font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {lead.title}
                    </p>
                    <div
                      className="mt-1 flex items-center justify-between text-[12px]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <span>{lead.stageName ?? "Unknown stage"}</span>
                      <Mono>{lead.estimatedValue ? formatRupees(Number(lead.estimatedValue)) : "-"}</Mono>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyLine>No active leads.</EmptyLine>
            )}
          </OverviewCard>

          <OverviewCard
            title="Pending Invoices"
            action={
              <ViewAllLink
                onClick={() => {
                  setInvoiceStatusPreset("all");
                  switchTab("invoices");
                }}
              >
                View All
              </ViewAllLink>
            }
          >
            {pendingInvoices.length ? (
              <div className="space-y-2">
                {pendingInvoices.map((invoice) => {
                  const phone = summary.customer.phone;
                  const reminderText = encodeURIComponent(
                    `Hi ${summary.customer.name.split(" ")[0]}, reminder for invoice ${invoice.invoiceNumber} of ${formatRupees(Number(invoice.totalAmount))}.`
                  );
                  const href = `https://wa.me/91${normalizePhone(phone)}?text=${reminderText}`;
                  const isApproved = invoice.status === "approved";

                  return (
                    <div
                      key={invoice.id}
                      className="px-3 py-2"
                      style={{
                        background: "var(--color-surface-raised)",
                        border: "1px solid var(--color-border-subtle)",
                        borderRadius: "var(--ledger-radius-sm)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <Mono
                            as="p"
                            className="text-[13.5px] font-semibold"
                            style={{ color: "var(--color-text)" }}
                          >
                            {invoice.invoiceNumber}
                          </Mono>
                          <Mono
                            as="p"
                            className="text-[12px]"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {formatRupees(Number(invoice.totalAmount))}
                          </Mono>
                        </div>
                        <span
                          className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold capitalize"
                          style={{
                            color: isApproved
                              ? "var(--stage-done-fg)"
                              : "var(--stage-interested-fg)",
                            background: isApproved
                              ? "var(--stage-done-bg)"
                              : "var(--stage-interested-bg)",
                            borderRadius: "var(--ledger-radius-badge)",
                          }}
                        >
                          {invoice.status}
                        </span>
                      </div>
                      <div className="mt-2">
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[12px] font-semibold transition hover:underline"
                          style={{ color: "var(--wa)" }}
                        >
                          Send WhatsApp reminder
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyLine>No pending invoices.</EmptyLine>
            )}
          </OverviewCard>
        </div>
      ) : null}

      {activeTab === "leads" ? (
        <section
          className="space-y-3 p-4"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--ledger-radius-control)",
          }}
        >
          {leads.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {leads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="block p-3 transition-colors hover:bg-[color:var(--color-surface)]"
                  style={{
                    background: "var(--color-surface-raised)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "var(--ledger-radius-sm)",
                  }}
                >
                  <p
                    className="text-[13.5px] font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {lead.title}
                  </p>
                  <p
                    className="mt-1 text-[12px]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Stage: {lead.stageName ?? "Unknown"}
                  </p>
                  <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                    Value:{" "}
                    <Mono>
                      {lead.estimatedValue ? formatRupees(Number(lead.estimatedValue)) : "-"}
                    </Mono>
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyLine>No leads found for this customer.</EmptyLine>
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
                <div
                  className="mt-3 text-[13px]"
                  style={{
                    background: "var(--follow-overdue-bg)",
                    border: "1px solid color-mix(in oklch, var(--follow-overdue) 30%, transparent)",
                    color: "var(--follow-overdue)",
                    padding: "10px 14px",
                    borderRadius: "var(--ledger-radius-control)",
                  }}
                >
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
