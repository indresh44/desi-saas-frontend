"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Rocket } from "lucide-react";
import { CreateLeadDialog } from "@/components/leads/create-lead-dialog";
import { useChatPageContext } from "@/lib/chat/chat-context";
import { fetchDashboardPaymentSummary } from "@/lib/api/dashboard";
import { fetchBusinessSettings } from "@/lib/api/business-settings";
import { fetchTodaysFollowUps, markFollowUpDone } from "@/lib/api/followups";
import { fetchLeads } from "@/lib/api/leads";
import { APP_NAME } from "@/lib/constants/app";
import type { DashboardPaymentSummary } from "@/lib/types/dashboard";
import type { BusinessSettings } from "@/lib/types/business-settings";
import { LeadFollowUp } from "@/lib/types/followup";
import { Lead } from "@/lib/types/lead";

const SETTINGS_NUDGE_DISMISSED_KEY = "sellnsettle_settings_nudge_dismissed";

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatShortDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatRupees(value: string | number | null | undefined) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return "-";
  }

  return `₹${numericValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function getStageBadgeClass(stageId: string) {
  const normalized = stageId.toLowerCase();

  if (normalized.includes("hot") || normalized.includes("won")) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  if (normalized.includes("warm") || normalized.includes("progress")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (normalized.includes("cold") || normalized.includes("lost")) {
    return "bg-muted text-foreground border";
  }

  return "bg-sky-50 text-sky-700 border-sky-200";
}

function isBusinessProfileIncomplete(settings: BusinessSettings | null) {
  if (!settings) {
    return false;
  }

  const normalizedName = settings.name.trim().toLowerCase();
  const appName = APP_NAME.trim().toLowerCase();

  return !settings.logoUrl || !normalizedName || normalizedName === appName;
}

export default function DashboardClient() {
  const router = useRouter();
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<DashboardPaymentSummary | null>(null);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsNudgeDismissed, setIsSettingsNudgeDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  useChatPageContext({ type: "dashboard" });

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [todaysFollowUps, allLeads, summary] = await Promise.all([
        fetchTodaysFollowUps(),
        fetchLeads(),
        fetchDashboardPaymentSummary(),
      ]);

      setFollowUps(todaysFollowUps);
      setLeads(allLeads);
      setPaymentSummary(summary);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Unable to load dashboard data.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshFollowUps = useCallback(async () => {
    const todaysFollowUps = await fetchTodaysFollowUps();
    setFollowUps(todaysFollowUps);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setIsSettingsNudgeDismissed(
      window.localStorage.getItem(SETTINGS_NUDGE_DISMISSED_KEY) === "true"
    );
  }, []);

  useEffect(() => {
    if (leads.length === 0) {
      setBusinessSettings(null);
      return;
    }

    let isCancelled = false;

    const loadBusinessSettings = async () => {
      try {
        const settings = await fetchBusinessSettings();
        if (!isCancelled) {
          setBusinessSettings(settings);
        }
      } catch {
        if (!isCancelled) {
          setBusinessSettings(null);
        }
      }
    };

    void loadBusinessSettings();

    return () => {
      isCancelled = true;
    };
  }, [leads.length]);

  const pendingFollowUps = useMemo(
    () => followUps.filter((item) => item.status === "pending"),
    [followUps]
  );

  const recentLeads = useMemo(
    () =>
      [...leads]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [leads]
  );

  const monthComparison = useMemo(() => {
    if (!paymentSummary) return null;
    const last = paymentSummary.collections_last_month;
    const current = paymentSummary.collections_this_month;
    if (last <= 0) {
      return null;
    }

    const deltaPercent = ((current - last) / last) * 100;
    return {
      value: Math.abs(deltaPercent),
      isUp: deltaPercent >= 0,
    };
  }, [paymentSummary]);

  const overdueInvoices = paymentSummary?.overdue_invoices ?? [];
  const isNewUser = !isLoading && !error && leads.length === 0;
  const shouldShowSettingsNudge =
    !isNewUser &&
    leads.length > 0 &&
    !isSettingsNudgeDismissed &&
    isBusinessProfileIncomplete(businessSettings);

  const handleMarkDone = useCallback(
    async (id: string) => {
      setMarkingId(id);
      try {
        await markFollowUpDone(id, {});
        await refreshFollowUps();
      } catch (markError) {
        const message =
          markError instanceof Error
            ? markError.message
            : "Unable to update follow-up status.";
        setError(message);
      } finally {
        setMarkingId(null);
      }
    },
    [refreshFollowUps]
  );

  const handleDismissSettingsNudge = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SETTINGS_NUDGE_DISMISSED_KEY, "true");
    }

    setIsSettingsNudgeDismissed(true);
  };

  return (
    <>
      <section className="space-y-8">
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {isNewUser ? (
          <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center">
            <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border bg-card px-6 py-10 text-center shadow-sm">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                <Rocket className="h-10 w-10" />
              </div>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
                Welcome to SellNSettle! 🎉
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Track your enquiries, send quotes, and collect payments - all in one place.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="mt-8 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add Your First Enquiry
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight ">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Quick snapshot of what needs attention today.
              </p>
            </div>

            {shouldShowSettingsNudge ? (
              <div className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 md:flex-row md:items-center md:justify-between">
                <p>
                  💡 Tip: Add your business name and logo in Settings to make your invoices look professional.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push("/settings")}
                    className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 font-medium text-blue-800 transition hover:bg-blue-100"
                  >
                    Go to Settings
                  </button>
                  <button
                    type="button"
                    onClick={handleDismissSettingsNudge}
                    className="rounded-lg px-3 py-1.5 font-medium text-blue-800 transition hover:bg-blue-100"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border bg-card p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Follow-ups Today
                </p>
                <p className="mt-3 text-3xl font-semibold text-primary">
                  {isLoading ? "..." : pendingFollowUps.length}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Don&apos;t miss these</p>
              </div>

              <div className="rounded-2xl border bg-card p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Collections This Month
                </p>
                <p className="mt-3 text-3xl font-semibold text-primary">
                  {isLoading || !paymentSummary
                    ? "..."
                    : formatRupees(paymentSummary.collections_this_month)}
                </p>
                {monthComparison ? (
                  <p className={`mt-2 text-xs ${monthComparison.isUp ? "text-emerald-600" : "text-rose-600"}`}>
                    {monthComparison.isUp ? "↑" : "↓"} {monthComparison.value.toFixed(0)}% vs last month
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">Current month total</p>
                )}
              </div>

              <div className="rounded-2xl border bg-card p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total Outstanding
                </p>
                <p className="mt-3 text-3xl font-semibold text-primary">
                  {isLoading || !paymentSummary
                    ? "..."
                    : formatRupees(paymentSummary.total_outstanding)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {isLoading || !paymentSummary
                    ? "..."
                    : `${paymentSummary.outstanding_invoice_count} invoices pending`}
                </p>
              </div>
            </div>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Overdue Payments</h2>

              {isLoading ? (
                <div className="rounded-xl border bg-card p-4">
                  <div className="h-12 animate-pulse rounded-md bg-muted" />
                </div>
              ) : overdueInvoices.length === 0 ? (
                <div className="rounded-xl border bg-card px-4 py-6 text-sm text-muted-foreground">
                  No overdue payments. All clear! ✅
                </div>
              ) : (
                <div className="rounded-xl border bg-card">
                  <ul className="divide-y divide-border">
                    {overdueInvoices.map((invoice) => {
                      const firstName = (invoice.customer_name || "Customer").trim().split(/\s+/)[0] || "Customer";
                      const digits = (invoice.customer_phone || "").replace(/\D/g, "");
                      const normalized = digits.length === 10 ? `91${digits}` : digits;
                      const whatsappMessage = `Hi ${firstName}, reminder about invoice ${invoice.invoice_number} for ₹${invoice.balance_due.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })} due on ${invoice.due_date}. Kindly clear at earliest. Thank you!`;
                      const whatsappHref = normalized
                        ? `https://wa.me/${normalized}?text=${encodeURIComponent(whatsappMessage)}`
                        : "#";

                      return (
                        <li key={invoice.invoice_id} className="px-4 py-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {invoice.customer_name || "Unknown Customer"}
                              </p>
                              <p className="text-xs text-muted-foreground">{invoice.invoice_number}</p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-semibold text-rose-600">{formatRupees(invoice.balance_due)}</p>
                              <p className="text-xs text-muted-foreground">{invoice.days_overdue} days overdue</p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {invoice.lead_id ? (
                              <Link
                                href={`/leads/${invoice.lead_id}`}
                                className="inline-flex items-center rounded-lg border border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent"
                              >
                                View Invoice
                              </Link>
                            ) : null}

                            <a
                              href={whatsappHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                normalized
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "cursor-not-allowed border bg-muted text-muted-foreground"
                              }`}
                              aria-disabled={!normalized}
                              onClick={(event) => {
                                if (!normalized) {
                                  event.preventDefault();
                                }
                              }}
                            >
                              WhatsApp
                            </a>

                            <a
                              href={invoice.customer_phone ? `tel:${invoice.customer_phone}` : "#"}
                              className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                invoice.customer_phone
                                  ? "border text-foreground hover:bg-accent"
                                  : "cursor-not-allowed border bg-muted text-muted-foreground"
                              }`}
                              aria-disabled={!invoice.customer_phone}
                              onClick={(event) => {
                                if (!invoice.customer_phone) {
                                  event.preventDefault();
                                }
                              }}
                            >
                              Call
                            </a>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Today&apos;s Follow-ups</h2>

              {isLoading ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="h-32 animate-pulse rounded-xl border border bg-muted" />
                  <div className="h-32 animate-pulse rounded-xl border border bg-muted" />
                </div>
              ) : pendingFollowUps.length === 0 ? (
                <div className="rounded-xl border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                  No follow-ups today. Enjoy your day! ☀️
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {pendingFollowUps.map((followUp) => (
                    <article
                      key={followUp.id}
                      className="rounded-xl border bg-card p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-foreground">
                            {followUp.leadTitle || "Lead"}
                          </h3>
                          {followUp.customerName ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {followUp.customerName}
                            </p>
                          ) : null}
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">
                          {formatTime(followUp.scheduledAt)}
                        </p>
                      </div>

                      <div className="mt-3 flex items-end justify-between gap-3">
                        {followUp.note ? (
                          <p className="line-clamp-2 text-sm text-foreground">
                            {followUp.note}
                          </p>
                        ) : <div />}

                        <button
                          type="button"
                          onClick={() => handleMarkDone(followUp.id)}
                          disabled={markingId === followUp.id}
                          className="inline-flex shrink-0 min-h-[44px] items-center rounded-lg border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {markingId === followUp.id ? "Updating..." : "✓ Done"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recent Leads</h2>
                <Link
                  href="/leads"
                  className="text-sm font-medium text-foreground transition hover:text-foreground"
                >
                  View All →
                </Link>
              </div>

              <div className="rounded-xl border bg-card">
                {isLoading ? (
                  <div className="space-y-2 p-4">
                    <div className="h-12 animate-pulse rounded-md bg-muted" />
                    <div className="h-12 animate-pulse rounded-md bg-muted" />
                    <div className="h-12 animate-pulse rounded-md bg-muted" />
                  </div>
                ) : recentLeads.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No leads yet. Start by adding one.
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {recentLeads.map((lead) => (
                      <li key={lead.id} className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                            {lead.title}
                          </p>
                          <p className="max-w-[45%] truncate text-xs text-muted-foreground">
                            {lead.customerName ?? "Unknown Customer"}
                          </p>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStageBadgeClass(
                              lead.stageName ?? lead.stageId
                            )}`}
                          >
                            {lead.stageName ?? "Unknown Stage"}
                          </span>
                          <span>{formatRupees(lead.estimatedValue)}</span>
                          <span>Service: {formatShortDate(lead.serviceDate)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        )}
      </section>

      <CreateLeadDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={loadDashboard}
      />
    </>
  );
}
