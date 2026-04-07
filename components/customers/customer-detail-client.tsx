"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, MessageCircle, Pencil, Phone } from "lucide-react";
import { InvoiceListView } from "@/components/invoices/invoice-list-view";
import { Button } from "@/components/ui/button";
import { useChatPageContext } from "@/lib/chat/chat-context";
import { fetchCustomerSummary, updateCustomer } from "@/lib/api/customers";
import { fetchInvoices } from "@/lib/api/invoices";
import { fetchLeads } from "@/lib/api/leads";
import { fetchMeetings, updateMeeting } from "@/lib/api/meetings";
import type { CustomerSummary } from "@/lib/types/customer";
import type { Invoice, InvoiceStatus } from "@/lib/types/invoice";
import type { Lead } from "@/lib/types/lead";
import type { Meeting } from "@/lib/types/meeting";

type TabKey = "overview" | "leads" | "invoices" | "meetings";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "leads", label: "Leads" },
  { key: "invoices", label: "Invoices" },
  { key: "meetings", label: "Meetings" },
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

function getMeetingStatusClass(status: Meeting["status"]): string {
  if (status === "scheduled") return "bg-blue-50 text-blue-700";
  if (status === "completed") return "bg-green-50 text-green-700";
  if (status === "cancelled") return "bg-zinc-100 text-zinc-500";
  return "bg-red-50 text-red-600";
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
  const [meetings, setMeetings] = useState<Meeting[]>([]);
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

  useChatPageContext({ type: "customer", id: customerId });

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "overview" || tab === "leads" || tab === "invoices" || tab === "meetings") {
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
      const [summaryData, leadsData, meetingsData, invoicesData] = await Promise.all([
        fetchCustomerSummary(customerId),
        fetchLeads({ customer_id: customerId }),
        fetchMeetings({ customer_id: customerId, from_date: "2020-01-01", limit: 100, offset: 0 }),
        fetchInvoices({ customer_id: customerId, limit: 100, offset: 0 }),
      ]);

      setSummary(summaryData);
      setLeads(leadsData);
      setMeetings(meetingsData.meetings);
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
  const upcomingMeetings = useMemo(
    () =>
      meetings
        .filter(
          (meeting) =>
            meeting.status === "scheduled" &&
            new Date(meeting.scheduledAt).getTime() >= Date.now()
        )
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [meetings]
  );

  const startEdit = () => {
    if (!summary) {
      return;
    }

    setEditName(summary.customer.name);
    setEditPhone(summary.customer.phone);
    setEditEmail(summary.customer.email ?? "");
    setEditNotes(summary.customer.notes ?? "");
    setIsEditOpen(true);
  };

  const saveCustomer = async () => {
    if (!summary) {
      return;
    }

    setIsSavingCustomer(true);
    setErrorMessage(null);

    try {
      await updateCustomer(summary.customer.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim() || null,
        notes: editNotes.trim() || null,
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
        setErrorMessage((error as { message: string }).message);
      } else {
        setErrorMessage("Unable to update customer.");
      }
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const updateMeetingStatus = async (meetingId: string, status: Meeting["status"]) => {
    try {
      await updateMeeting(meetingId, { status });
      await loadData();
    } catch {
      setErrorMessage("Unable to update meeting status.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
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
      <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft className="h-4 w-4" />
        Customers
      </Link>

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <header className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">{summary.customer.name}</h1>
            <p className="text-sm text-zinc-500">{summary.customer.phone}{summary.customer.email ? `  |  ${summary.customer.email}` : ""}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="outline">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </a>
            <a href={callHref}>
              <Button type="button" variant="outline">
                <Phone className="h-4 w-4" />
                Call
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
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-left"
          >
            <p className="text-lg font-semibold text-zinc-900">{formatRupees(summary.lifetimeValue)}</p>
            <p className="text-xs text-zinc-600">Lifetime Revenue</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setInvoiceStatusPreset("partial");
              switchTab("invoices");
            }}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-left"
          >
            <p className="text-lg font-semibold text-zinc-900">{formatRupees(summary.totalOutstanding)}</p>
            <p className="text-xs text-zinc-600">Outstanding</p>
          </button>

          <button
            type="button"
            onClick={() => switchTab("leads")}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-left"
          >
            <p className="text-lg font-semibold text-zinc-900">{summary.activeLeads} active</p>
            <p className="text-xs text-zinc-600">Leads ({summary.totalLeads} total)</p>
          </button>

          <button
            type="button"
            onClick={() => switchTab("meetings")}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-left"
          >
            <p className="text-lg font-semibold text-zinc-900">{summary.upcomingMeetings} upcoming</p>
            <p className="text-xs text-zinc-600">Meetings</p>
          </button>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 rounded-xl border border-zinc-200 bg-white p-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => switchTab(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900">Recent Activity</h3>
            </div>
            {summary.recentActivities.length ? (
              <div className="space-y-2">
                {summary.recentActivities.map((activity, index) => (
                  <div key={`${activity.date}-${index}`} className="rounded-lg border border-zinc-100 bg-zinc-50 p-2">
                    <p className="text-xs text-zinc-500">{formatDateTime(activity.date)}</p>
                    <p className="text-sm text-zinc-800">{activity.description}</p>
                    {activity.leadTitle ? <p className="text-xs text-zinc-500">{activity.leadTitle}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No recent activity yet.</p>
            )}
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900">Active Leads</h3>
              <button type="button" className="text-xs text-primary hover:underline" onClick={() => switchTab("leads")}>View All</button>
            </div>
            {activeLeads.length ? (
              <div className="space-y-2">
                {activeLeads.slice(0, 4).map((lead) => (
                  <Link key={lead.id} href={`/leads/${lead.id}`} className="block rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 hover:bg-zinc-100">
                    <p className="text-sm font-medium text-zinc-900">{lead.title}</p>
                    <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
                      <span>{lead.stageName ?? "Unknown stage"}</span>
                      <span>{lead.estimatedValue ? formatRupees(Number(lead.estimatedValue)) : "-"}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No active leads.</p>
            )}
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900">Pending Invoices</h3>
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
                    <div key={invoice.id} className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-zinc-500">{formatRupees(Number(invoice.totalAmount))}</p>
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
              <p className="text-sm text-zinc-500">No pending invoices.</p>
            )}
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900">Upcoming Meetings</h3>
              <button type="button" className="text-xs text-primary hover:underline" onClick={() => switchTab("meetings")}>View All</button>
            </div>
            {upcomingMeetings.length ? (
              <div className="space-y-2">
                {upcomingMeetings.slice(0, 3).map((meeting) => (
                  <div key={meeting.id} className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                    <p className="text-sm font-medium text-zinc-900">{meeting.title}</p>
                    <p className="text-xs text-zinc-500">{formatDateTime(meeting.scheduledAt)}  |  {meeting.durationMinutes} min</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No upcoming meetings.</p>
            )}
          </section>
        </div>
      ) : null}

      {activeTab === "leads" ? (
        <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
          {leads.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {leads.map((lead) => (
                <Link key={lead.id} href={`/leads/${lead.id}`} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 hover:bg-zinc-100">
                  <p className="text-sm font-semibold text-zinc-900">{lead.title}</p>
                  <p className="mt-1 text-xs text-zinc-600">Stage: {lead.stageName ?? "Unknown"}</p>
                  <p className="text-xs text-zinc-600">Value: {lead.estimatedValue ? formatRupees(Number(lead.estimatedValue)) : "-"}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No leads found for this customer.</p>
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

      {activeTab === "meetings" ? (
        <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
          {meetings.length ? (
            <div className="space-y-2">
              {meetings
                .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                .map((meeting) => (
                  <div key={meeting.id} className="rounded-lg border border-zinc-200 px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-zinc-900">{meeting.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getMeetingStatusClass(meeting.status)}`}>
                        {meeting.status}
                      </span>
                      <span className="text-xs text-zinc-500">{formatDateTime(meeting.scheduledAt)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                      <span>{meeting.durationMinutes} min</span>
                      {meeting.notes ? <span>{meeting.notes}</span> : null}
                    </div>
                    {meeting.status === "scheduled" ? (
                      <div className="mt-2 flex items-center gap-3 border-t border-zinc-100 pt-2">
                        <button
                          type="button"
                          className="text-xs text-green-600 hover:underline"
                          onClick={() => void updateMeetingStatus(meeting.id, "completed")}
                        >
                          Mark done
                        </button>
                        <button
                          type="button"
                          className="text-xs text-zinc-500 hover:underline"
                          onClick={() => void updateMeetingStatus(meeting.id, "cancelled")}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No meetings found for this customer.</p>
          )}
        </section>
      ) : null}

      {isEditOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-zinc-900/40"
            onClick={isSavingCustomer ? undefined : () => setIsEditOpen(false)}
            aria-label="Close edit dialog"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-4 shadow-xl">
              <h3 className="text-base font-semibold text-zinc-900">Edit Customer</h3>
              <div className="mt-3 grid gap-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  placeholder="Name"
                  disabled={isSavingCustomer}
                />
                <input
                  type="text"
                  value={editPhone}
                  onChange={(event) => setEditPhone(event.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  placeholder="Phone"
                  disabled={isSavingCustomer}
                />
                <input
                  type="email"
                  value={editEmail}
                  onChange={(event) => setEditEmail(event.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  placeholder="Email"
                  disabled={isSavingCustomer}
                />
                <textarea
                  value={editNotes}
                  onChange={(event) => setEditNotes(event.target.value)}
                  className="min-h-24 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  placeholder="Notes"
                  disabled={isSavingCustomer}
                />
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
