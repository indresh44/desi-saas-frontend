"use client";

// Action-first dashboard. Replaces the previous metrics-first home screen.
// Architecture & layout decisions live in `Docs/plans/next-action-cascade.md`
// and `dashboard-build-plan.md`; this file is the wiring.
//
// One endpoint feeds the whole page: `GET /dashboard/leads-needing-action`
// (items + total + counts_by_type). Recent enquiries reuses `fetchLeads()`
// (slice 4 most recent). Per-card context lazy-loads via /leads/{id}/context.
//
// Layout (Ledger §15.1 — Triage Stream):
//   greeting row (rollup + [+ New Enquiry])
//   ┌─────────────────────────────────┬──────────────┐
//   │ AI panel (hidden when empty)    │              │
//   │                                 │  Needs-you   │
//   │ Action list, grouped by         │  + Recent    │
//   │ next_action.type, headers       │   (desktop)  │
//   │ shown only when group has items │              │
//   └─────────────────────────────────┴──────────────┘
// Mobile (<lg): single column; the rail is hidden entirely.
//
// Visual: Ledger design system. Greeting follows §13.1, group headers
// follow §13.3, the right rail follows §13.4. The action cards
// themselves are the already-Ledger-styled `ActionCard`.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Rocket, X } from "lucide-react";
import { ActionCard } from "@/components/dashboard/action-card";
import { AiPanel } from "@/components/dashboard/ai-panel";
import { AssistantTasksSection } from "@/components/dashboard/assistant-tasks-section";
import { NeedsYouRail } from "@/components/dashboard/needs-you-rail";
import { CreateLeadDialog } from "@/components/leads/create-lead-dialog";
import { Eyebrow, LedgerButton, PageTitle } from "@/components/ledger";
import { useAuth } from "@/lib/auth/auth-context";
import {
  fetchLeadsNeedingAction,
  type LeadsNeedingActionResult,
} from "@/lib/api/dashboard";
import { fetchLeadFollowUps, markFollowUpDone } from "@/lib/api/followups";
import { fetchLeads } from "@/lib/api/leads";
import { fetchBusinessSettings } from "@/lib/api/business-settings";
import { APP_NAME } from "@/lib/constants/app";
import { presentationFor } from "@/lib/next-action-presentation";
import type { Lead } from "@/lib/types/lead";
import type { BusinessSettings } from "@/lib/types/business-settings";
import type { NextActionType } from "@/lib/types/next-action";
import { HOME_NEEDS_ACTION_TYPES } from "@/lib/types/next-action";

const SETTINGS_NUDGE_DISMISSED_KEY = "sellnsettle_settings_nudge_dismissed";
const ACTION_LIST_LIMIT = 10;
const RECENT_LEAD_LIMIT = 4;

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function firstWord(name: string | null | undefined): string {
  return (name || "there").trim().split(/\s+/)[0] || "there";
}

function isBusinessProfileIncomplete(settings: BusinessSettings | null) {
  if (!settings) return false;
  const normalised = settings.name.trim().toLowerCase();
  const appName = APP_NAME.trim().toLowerCase();
  return !settings.logoUrl || !normalised || normalised === appName;
}

// Lazy resolver: given a leadId, looks up its earliest pending follow-up
// and marks it done. Hoisted so the parent can pass a stable callback to
// every ActionCard. Done-without-followup is impossible in cascade types
// 1 & 2 (FOLLOWUP_OVERDUE / FOLLOWUP_DUE_TODAY require a pending row by
// definition), but we still no-op gracefully if the row disappeared
// between page load and click.
async function markNextPendingFollowupDone(leadId: string): Promise<void> {
  const followups = await fetchLeadFollowUps(leadId);
  const pending = followups
    .filter((f) => f.status === "pending")
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
  const next = pending[0];
  if (!next) return;
  await markFollowUpDone(next.id, {});
}

export default function DashboardClient() {
  const router = useRouter();
  const { user } = useAuth();

  const [actionList, setActionList] = useState<LeadsNeedingActionResult | null>(
    null,
  );
  // Lead ids the user has just resolved via an ActionCard's outcome
  // sheet. We filter them out client-side until the next loadDashboard()
  // refetch lands — keeps the list "snappy" without waiting for the
  // server round-trip. Cleared on every refetch.
  const [optimisticallyRemoved, setOptimisticallyRemoved] = useState<Set<string>>(
    () => new Set(),
  );
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsNudgeDismissed, setIsSettingsNudgeDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [needs, leads] = await Promise.all([
        fetchLeadsNeedingAction(ACTION_LIST_LIMIT),
        fetchLeads(),
      ]);
      setActionList(needs);
      // Authoritative refresh — drop the optimistic-removal set now that
      // we have fresh truth from the backend.
      setOptimisticallyRemoved(new Set());
      // Recent = chronological newest-first, cap at RECENT_LEAD_LIMIT.
      // We sort client-side because /leads doesn't yet accept a `limit`
      // or `sort=created_at` query param — small list, cheap to sort.
      setRecentLeads(
        [...leads]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, RECENT_LEAD_LIMIT),
      );
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

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsSettingsNudgeDismissed(
      window.localStorage.getItem(SETTINGS_NUDGE_DISMISSED_KEY) === "true",
    );
  }, []);

  useEffect(() => {
    // Only fetch settings once we know the user has at least one lead —
    // matches the previous dashboard's behaviour (no nudge on a clean
    // brand-new account, which has its own welcome surface).
    if (recentLeads.length === 0) {
      setBusinessSettings(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const settings = await fetchBusinessSettings();
        if (!cancelled) setBusinessSettings(settings);
      } catch {
        if (!cancelled) setBusinessSettings(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [recentLeads.length]);

  // ---- derived ----

  const groupedActions = useMemo(() => {
    if (!actionList) return new Map<NextActionType, Lead[]>();
    const groups = new Map<NextActionType, Lead[]>();
    for (const type of HOME_NEEDS_ACTION_TYPES) groups.set(type, []);
    for (const lead of actionList.items) {
      // Hide just-resolved cards immediately; the refetch will reseed.
      if (optimisticallyRemoved.has(lead.id)) continue;
      const type = lead.nextAction?.type;
      if (type && groups.has(type)) {
        groups.get(type)!.push(lead);
      }
    }
    return groups;
  }, [actionList, optimisticallyRemoved]);

  const totalNeedingAction = actionList?.total ?? 0;
  const countsByType = actionList?.countsByType ?? ({} as Record<NextActionType, number>);

  const greeting = useMemo(() => {
    const phrase = greetingForHour(new Date().getHours());
    return `${phrase}, ${firstWord(user?.name)}`;
  }, [user?.name]);

  // Inbox-zero state: user has leads (so they're not new) but no active
  // urgent buckets. "All caught up" beats showing four empty headers.
  const isNewUser = !isLoading && !error && recentLeads.length === 0;
  const isInboxZero =
    !isLoading && !error && !isNewUser && totalNeedingAction === 0;

  const shouldShowSettingsNudge =
    !isNewUser &&
    !isSettingsNudgeDismissed &&
    isBusinessProfileIncomplete(businessSettings);

  const handleDismissSettingsNudge = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SETTINGS_NUDGE_DISMISSED_KEY, "true");
    }
    setIsSettingsNudgeDismissed(true);
  };

  const handleMarkDone = useCallback(
    async (leadId: string) => {
      try {
        await markNextPendingFollowupDone(leadId);
        await loadDashboard();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to mark follow-up done.";
        setError(message);
      }
    },
    [loadDashboard],
  );

  const handleSetFollowUp = useCallback(
    (leadId: string) => {
      // No dedicated set-follow-up modal yet — punt to the lead detail
      // page where the existing follow-up form lives. Tracked in
      // dashboard-build-plan §H (parked).
      router.push(`/leads/${leadId}`);
    },
    [router],
  );

  // After an ActionCard's outcome sheet posts to /resolve, drop the
  // card from the list immediately and refetch the source of truth. The
  // backend leaves the lead in the list iff its next_action still
  // qualifies (e.g. a no_answer reschedule to later today keeps it; a
  // positive outcome with next_dt in 3 days moves it out entirely).
  const handleResolved = useCallback(
    (leadId: string) => {
      setOptimisticallyRemoved((prev) => {
        const next = new Set(prev);
        next.add(leadId);
        return next;
      });
      void loadDashboard();
    },
    [loadDashboard],
  );

  // ---- render ----

  if (isNewUser) {
    return (
      <>
        <section className="flex min-h-[calc(100vh-14rem)] items-center justify-center">
          <div
            className="mx-auto flex max-w-xl flex-col items-center px-6 py-10 text-center"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--ledger-radius-card)",
            }}
          >
            <div
              className="flex h-20 w-20 items-center justify-center"
              style={{
                background: "var(--color-accent-soft)",
                color: "var(--color-accent)",
                borderRadius: "50%",
              }}
            >
              <Rocket className="h-10 w-10" strokeWidth={1.8} />
            </div>
            <h1
              className="mt-6 text-[28px] font-bold tracking-[-0.03em]"
              style={{ color: "var(--color-text)" }}
            >
              Welcome to SellNSettle! 🎉
            </h1>
            <p
              className="mt-3 max-w-md text-[14px] leading-6"
              style={{ color: "var(--color-text-muted)" }}
            >
              Track your enquiries, send quotes, and collect payments — all in
              one place.
            </p>
            <LedgerButton
              variant="primary"
              size="lg"
              className="mt-8"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="size-[16px]" strokeWidth={2} />
              Add Your First Enquiry
            </LedgerButton>
          </div>
        </section>
        <CreateLeadDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={loadDashboard}
        />
      </>
    );
  }

  return (
    <>
      <section className="space-y-6">
        {error ? (
          <div
            className="text-[13px]"
            style={{
              background: "var(--follow-overdue-bg)",
              border: "1px solid color-mix(in oklch, var(--follow-overdue) 30%, transparent)",
              color: "var(--follow-overdue)",
              padding: "12px 16px",
              borderRadius: "var(--ledger-radius-control)",
            }}
          >
            {error}
          </div>
        ) : null}

        {/* Greeting row — §13.1. Lead count is bold in the subtitle. */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <PageTitle
              className="text-[27px] sm:text-[28px]"
              style={{ letterSpacing: "-0.03em", fontWeight: 700 }}
            >
              {greeting}
            </PageTitle>
            <p
              className="mt-1 text-[14.5px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              {isLoading ? (
                "Loading your day…"
              ) : totalNeedingAction === 0 ? (
                "Nothing pressing today. ☀️"
              ) : (
                <>
                  <b
                    className="font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {totalNeedingAction}{" "}
                    {totalNeedingAction === 1 ? "enquiry" : "enquiries"}
                  </b>{" "}
                  {totalNeedingAction === 1 ? "needs" : "need"} you today
                </>
              )}
            </p>
          </div>
          <LedgerButton
            variant="primary"
            size="lg"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="size-[16px]" strokeWidth={2} />
            New Enquiry
          </LedgerButton>
        </div>

        {shouldShowSettingsNudge ? (
          <div
            className="flex flex-col gap-3 text-[13px] md:flex-row md:items-center md:justify-between"
            style={{
              background: "var(--color-accent-soft)",
              border: "1px solid color-mix(in oklch, var(--color-accent) 22%, transparent)",
              color: "color-mix(in oklch, var(--color-accent) 70%, var(--color-text))",
              padding: "12px 16px",
              borderRadius: "var(--ledger-radius-control)",
            }}
          >
            <p>
              💡 Tip: Add your business name and logo in Settings to make your
              invoices look professional.
            </p>
            <div className="flex items-center gap-2">
              <LedgerButton
                variant="action"
                size="sm"
                onClick={() => router.push("/settings")}
              >
                Go to Settings
              </LedgerButton>
              <button
                type="button"
                onClick={handleDismissSettingsNudge}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] font-semibold transition hover:bg-[var(--color-surface)]"
                style={{ color: "var(--color-text-muted)" }}
                aria-label="Dismiss tip"
              >
                <X className="size-[12px]" /> Dismiss
              </button>
            </div>
          </div>
        ) : null}

        {/* Two-column responsive grid. Right rail hidden on <lg. */}
        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          <div className="min-w-0 space-y-6 lg:col-span-2">
            {/* AI panel (placeholder — empty until agent_tasks is wired) */}
            <AiPanel items={[]} />

            {/* Assistant Tasks section is kept as a temporary bridge to
                the real AI surface — it shows running / awaiting /
                recently-done agent tasks today. When the AI panel above
                lands real items, this whole block becomes redundant and
                can be removed in one delete. */}
            <AssistantTasksSection />

            {/* Action list — grouped, empty groups hidden. */}
            {isLoading ? (
              <div className="space-y-3">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : isInboxZero ? (
              <div
                className="px-4 py-10 text-center"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--ledger-radius-card)",
                }}
              >
                <p
                  className="text-[15px] font-bold"
                  style={{ color: "var(--color-text)" }}
                >
                  All caught up ✨
                </p>
                <p
                  className="mt-1 text-[13.5px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  No follow-ups need attention right now.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {HOME_NEEDS_ACTION_TYPES.map((type) => {
                  const groupItems = groupedActions.get(type) ?? [];
                  if (groupItems.length === 0) return null;
                  const totalForType = countsByType[type] ?? groupItems.length;
                  const hiddenInType = Math.max(
                    0,
                    totalForType - groupItems.length,
                  );
                  const p = presentationFor(type);
                  return (
                    <section key={type} id={`group-${type}`}>
                      {/* Group header — §13.3. Eyebrow + hairline rule
                          + pill count. */}
                      <div className="mb-2 flex items-center gap-3 px-1">
                        <Eyebrow>{p.groupLabel}</Eyebrow>
                        <span
                          aria-hidden
                          className="h-px flex-1"
                          style={{ background: "var(--color-border-subtle)" }}
                        />
                        <span
                          className="ledger-mono text-[11px] font-semibold"
                          style={{
                            color: "var(--color-text-faint)",
                            background: "var(--color-surface-raised)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "var(--ledger-radius-sm)",
                            padding: "1px 7px",
                          }}
                        >
                          {totalForType}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {groupItems.map((lead) => (
                          <ActionCard
                            key={lead.id}
                            lead={lead}
                            onMarkDone={handleMarkDone}
                            onSetFollowUp={handleSetFollowUp}
                            onResolved={handleResolved}
                          />
                        ))}
                        {hiddenInType > 0 ? (
                          <Link
                            href="/leads"
                            className="block py-2 text-center text-[12.5px] font-semibold transition hover:underline"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            + {hiddenInType} more {p.groupLabel.toLowerCase()}
                          </Link>
                        ) : null}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right rail — desktop only. The grid template above places
              this in the second column at lg; below lg the column
              collapses and we hide the rail outright (build plan §A:
              "right rail is HIDDEN entirely" on mobile). */}
          <div className="hidden lg:block">
            {actionList ? (
              <NeedsYouRail
                countsByType={actionList.countsByType}
                recentLeads={recentLeads}
              />
            ) : null}
          </div>
        </div>
      </section>

      <CreateLeadDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={loadDashboard}
      />
    </>
  );
}

function SkeletonRow() {
  return (
    <div
      className="animate-pulse"
      style={{
        height: 80,
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--ledger-radius-card)",
      }}
    />
  );
}
