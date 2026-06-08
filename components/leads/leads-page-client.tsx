"use client";

// Enquiry list — the full searchable record. Distinct from the dashboard
// (which curates *urgent* enquiries); this page shows every enquiry
// including calm, upcoming, Won, and Lost so the owner can find and slice
// the whole pipeline.
//
// Two layouts:
//   - Desktop (≥ md): Ledger compact table (§7.9) for fast scanning.
//   - Mobile  (< md): card list — reuses the dashboard's ActionCard with
//     `variant="list"` so the cards stay actionable on the small viewport.
//
// All filtering, sorting, and grouping is client-side over the result of
// one `fetchLeads()` call. The leads list endpoint doesn't paginate today
// — if it ever does, sort/group needs to move server-side. Tracked in the
// build plan §E.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, X } from "lucide-react";
import { ActionCard } from "@/components/dashboard/action-card";
import { CreateLeadDialog } from "@/components/leads/create-lead-dialog";
import { LeadWhatsAppChatDrawer } from "@/components/whatsapp/lead-whatsapp-chat-drawer";
import { ChevronDown } from "lucide-react";
import {
  Eyebrow,
  LedgerButton,
  LedgerEnquiryTable,
  LedgerSearchInput,
  LedgerSegmentedControl,
  PageTitle,
} from "@/components/ledger";
import { useLookupMaps } from "@/hooks/use-lookup-maps";
import { fetchLeads } from "@/lib/api/leads";
import type { Lead } from "@/lib/types/lead";

// Source values mirror the backend `LeadSource` enum
// (`app/models/enums.py`). Hard-coded list with pretty labels — small,
// stable, easier than fetching from the API.
const SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: "walk_in", label: "Walk-in" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "referral", label: "Referral" },
  { value: "instagram", label: "Instagram" },
  { value: "justdial", label: "JustDial" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

const SOURCE_LABEL: Record<string, string> = Object.fromEntries(
  SOURCE_OPTIONS.map((opt) => [opt.value, opt.label]),
);
function sourceLabel(source: string | null | undefined): string {
  if (!source) return "—";
  return SOURCE_LABEL[source] ?? source.replaceAll("_", " ");
}

type GroupBy = "none" | "stage" | "source";
type SortBy = "newest" | "urgent" | "active";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "urgent", label: "Most urgent" },
  { value: "active", label: "Recently active" },
];

// Highest possible urgency_rank+1 — used to push leads with no nextAction
// to the bottom of the "Most urgent" sort. (Cascade ranks are 1-6 today.)
const UNRANKED = 99;

function urgencyOf(lead: Lead): number {
  return lead.nextAction?.urgency_rank ?? UNRANKED;
}

function relevantTimeOf(lead: Lead): number {
  const iso = lead.nextAction?.relevant_date;
  if (!iso) return Number.POSITIVE_INFINITY;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

function timeOf(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function SkeletonBlock() {
  return (
    <div
      className="animate-pulse"
      style={{
        height: 56,
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--ledger-radius-control)",
      }}
    />
  );
}

export function LeadsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stageMap, isLoading: isLoadingStages } = useLookupMaps();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // ---- filter / sort / group state (all client-side) ----
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  // ---- URL-deep-linked filters ----
  // `?customer_id=` constrains the backend fetch to one customer's
  // leads; we surface a banner with a clear button. `?followups=today`
  // is preserved for any external links that still point here (older
  // dashboard build linked to it; the new dashboard does not).
  const customerIdFilter = searchParams.get("customer_id");
  const customerNameForFilter =
    searchParams.get("customer_name") ?? "this customer";
  const followupsTodayFilter = searchParams.get("followups") === "today";

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchLeads({
        customer_id: customerIdFilter ?? undefined,
        follow_up_today: followupsTodayFilter || undefined,
      });
      setLeads(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to fetch leads.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [customerIdFilter, followupsTodayFilter]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const clearCustomerFilter = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("customer_id");
    next.delete("customer_name");
    const qs = next.toString();
    router.push(qs ? `/leads?${qs}` : "/leads");
  }, [router, searchParams]);

  // ---- derived: filtered + sorted + (optionally) grouped ----

  const stageOptions = useMemo(
    () =>
      Object.values(stageMap).sort((a, b) =>
        a.position === b.position
          ? a.name.localeCompare(b.name)
          : a.position - b.position,
      ),
    [stageMap],
  );

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : null;
    // Inclusive end-of-day for dateTo so "May 1 — May 5" includes leads
    // created on May 5 at 23:59. Native date inputs return midnight; we
    // bump to next-day midnight as an open-end comparison.
    const toTs = dateTo
      ? new Date(dateTo).getTime() + 24 * 60 * 60 * 1000
      : null;

    return leads.filter((lead) => {
      // search: title + customer name + phone (digits stripped both sides)
      if (q) {
        const haystack = [
          lead.title,
          lead.customerName ?? "",
          (lead.customerPhone ?? "").replace(/\D/g, ""),
          lead.source ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (stageFilter !== "all" && lead.stageId !== stageFilter) return false;
      if (sourceFilter !== "all" && lead.source !== sourceFilter) return false;
      if (fromTs !== null) {
        const t = timeOf(lead.createdAt);
        if (t < fromTs) return false;
      }
      if (toTs !== null) {
        const t = timeOf(lead.createdAt);
        if (t >= toTs) return false;
      }
      return true;
    });
  }, [leads, search, stageFilter, sourceFilter, dateFrom, dateTo]);

  const sortedLeads = useMemo(() => {
    const arr = [...filteredLeads];
    switch (sortBy) {
      case "urgent":
        arr.sort((a, b) => {
          const ru = urgencyOf(a) - urgencyOf(b);
          if (ru !== 0) return ru;
          return relevantTimeOf(a) - relevantTimeOf(b);
        });
        break;
      case "active":
        // Proxy: `updated_at` is touched on stage moves, note edits, etc.
        // Not a perfect "last human touch" signal (which the cascade has
        // but doesn't expose on the read), but close enough for v1.
        arr.sort((a, b) => timeOf(b.updatedAt) - timeOf(a.updatedAt));
        break;
      case "newest":
      default:
        arr.sort((a, b) => timeOf(b.createdAt) - timeOf(a.createdAt));
    }
    return arr;
  }, [filteredLeads, sortBy]);

  const grouped = useMemo<{ key: string; label: string; items: Lead[] }[]>(() => {
    if (groupBy === "none") {
      return [{ key: "all", label: "", items: sortedLeads }];
    }
    const buckets = new Map<string, { label: string; items: Lead[] }>();
    for (const lead of sortedLeads) {
      const key =
        groupBy === "stage"
          ? lead.stageName ?? "Unknown stage"
          : sourceLabel(lead.source);
      const existing = buckets.get(key);
      if (existing) {
        existing.items.push(lead);
      } else {
        buckets.set(key, { label: key, items: [lead] });
      }
    }
    // Stable sort by group label so the UI doesn't reshuffle on a single
    // edit. Group ordering is not part of the user-facing sort dropdown.
    return [...buckets.entries()]
      .sort(([, a], [, b]) => a.label.localeCompare(b.label))
      .map(([key, value]) => ({ key, label: value.label, items: value.items }));
  }, [groupBy, sortedLeads]);

  const openChat = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setIsChatOpen(true);
  }, []);

  const totalCount = sortedLeads.length;
  const allCount = leads.length;

  // Stage filter label for the SelectBox trigger.
  const stageFilterLabel =
    stageFilter === "all"
      ? "All stages"
      : stageMap[stageFilter]?.name ?? "All stages";
  const sourceFilterLabel =
    sourceFilter === "all"
      ? "All sources"
      : SOURCE_LABEL[sourceFilter] ?? sourceFilter;
  const sortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label ?? "Newest";

  // For the table view, leads are passed pre-grouped. The "no group"
  // case collapses to a single flat list; the table renders no header.
  const tableGroups =
    groupBy === "none" ? undefined : grouped;
  const tableLeads = groupBy === "none" ? sortedLeads : undefined;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <PageTitle>
            {customerIdFilter ? `${customerNameForFilter}'s enquiries` : "Enquiries"}
          </PageTitle>
          <p
            className="mt-1 text-[14px]"
            style={{ color: "var(--color-text-muted)" }}
          >
            Your full record — search, filter, and slice.
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

      {customerIdFilter ? (
        <div
          className="flex items-center gap-2 text-[13px]"
          style={{
            background: "var(--color-surface-raised)",
            color: "var(--color-text-muted)",
            padding: "10px 14px",
            borderRadius: "var(--ledger-radius-control)",
          }}
        >
          <span>
            Showing enquiries for{" "}
            <strong style={{ color: "var(--color-text)" }}>
              {customerNameForFilter}
            </strong>
          </span>
          <button
            type="button"
            onClick={clearCustomerFilter}
            className="ml-auto inline-flex items-center gap-1 text-[12px] font-semibold transition hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            <X className="size-[12px]" />
            Show all
          </button>
        </div>
      ) : null}

      {/* Filter row — §7.4 */}
      <div className="flex flex-wrap items-center gap-[10px]">
        <div className="min-w-[220px] flex-1">
          <LedgerSearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, customer, or phone…"
            aria-label="Search enquiries"
          />
        </div>

        <NativeSelectShell
          label={stageFilterLabel}
          value={stageFilter}
          onChange={setStageFilter}
          aria-label="Filter by stage"
          disabled={isLoadingStages}
        >
          <option value="all">All stages</option>
          {stageOptions.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.name}
            </option>
          ))}
        </NativeSelectShell>

        <NativeSelectShell
          label={sourceFilterLabel}
          value={sourceFilter}
          onChange={setSourceFilter}
          aria-label="Filter by source"
        >
          <option value="all">All sources</option>
          {SOURCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </NativeSelectShell>

        <DateRangeField
          label="Added"
          from={dateFrom}
          to={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
        />
      </div>

      {/* Sub-bar: group + sort + count — §7.5 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eyebrow>Group</Eyebrow>
          <LedgerSegmentedControl<GroupBy>
            value={groupBy}
            onChange={setGroupBy}
            options={[
              { value: "none", label: "None" },
              { value: "stage", label: "Stage" },
              { value: "source", label: "Source" },
            ]}
          />
        </div>
        <div className="flex items-center gap-3">
          <NativeSelectShell
            label={`Sort: ${sortLabel}`}
            value={sortBy}
            onChange={(v) => setSortBy(v as SortBy)}
            aria-label="Sort"
            height={34}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </NativeSelectShell>
          <span
            className="ledger-mono text-[12.5px]"
            style={{ color: "var(--color-text-muted)" }}
          >
            {isLoading
              ? "…"
              : `${totalCount} ${totalCount === 1 ? "enquiry" : "enquiries"}`}
          </span>
        </div>
      </div>

      {/* List body */}
      {isLoading ? (
        <div className="space-y-2">
          <SkeletonBlock />
          <SkeletonBlock />
          <SkeletonBlock />
        </div>
      ) : totalCount === 0 ? (
        <div
          className="flex flex-col items-center gap-3 py-12 text-center"
          style={{
            background: "var(--color-surface-raised)",
            border: "1px dashed var(--color-border)",
            borderRadius: "var(--ledger-radius-control)",
          }}
        >
          <p
            className="text-[13px]"
            style={{ color: "var(--color-text-muted)" }}
          >
            {allCount === 0
              ? "No enquiries yet. Create your first enquiry →"
              : "No enquiries match your filters."}
          </p>
          {allCount === 0 ? (
            <LedgerButton
              variant="primary"
              size="md"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="size-[15px]" strokeWidth={2} />
              Create enquiry
            </LedgerButton>
          ) : null}
        </div>
      ) : (
        <>
          {/* Desktop: ledger table (§7.9). Hidden on <md. */}
          <div className="hidden md:block">
            <LedgerEnquiryTable
              leads={tableLeads}
              groups={tableGroups}
              sourceLabel={sourceLabel}
              onWhatsApp={openChat}
            />
          </div>

          {/* Mobile: card list. Hidden on ≥md. Reuses the dashboard card
              in its `list` variant so the cards stay actionable on
              phones. Group headers render inline. */}
          <div className="space-y-6 md:hidden">
            {grouped.map((group) => (
              <section key={group.key}>
                {groupBy !== "none" ? (
                  <h2 className="mb-2 flex items-center gap-2 px-1">
                    <Eyebrow>{group.label}</Eyebrow>
                    <span
                      className="ledger-mono text-[11px]"
                      style={{ color: "var(--color-text-faint)" }}
                    >
                      {group.items.length}
                    </span>
                  </h2>
                ) : null}
                <div className="space-y-2">
                  {group.items.map((lead) => (
                    <ActionCard
                      key={lead.id}
                      lead={lead}
                      variant="list"
                      onWhatsApp={openChat}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      <LeadWhatsAppChatDrawer
        isOpen={isChatOpen}
        lead={selectedLead}
        onClose={() => setIsChatOpen(false)}
      />

      <CreateLeadDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={loadLeads}
      />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Small filter primitives — keep them local; not worth their own files. They
// wrap a native <select> / <input type="date"> in a Ledger-styled shell so
// the surface lines up with LedgerSelectBox without re-implementing keyboard
// nav or accessibility from scratch.
// ---------------------------------------------------------------------------

/**
 * Native <select> styled as a Ledger SelectBox (§7.4). Uses appearance:
 * none + a trailing chevron icon so the native menu UX stays intact
 * (keyboard search, mobile picker sheet) while the look matches the rest
 * of the toolbar. Single focusable element — no decorative button.
 */
function NativeSelectShell({
  label,
  value,
  onChange,
  disabled,
  children,
  height = 42,
  ...ariaProps
}: {
  /** Visible label inside the trigger — shows the current selection. */
  label: React.ReactNode;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  height?: 34 | 42;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  return (
    <div
      className="relative inline-flex items-center text-[13.5px] font-medium"
      style={{
        height,
        padding: "0 30px 0 13px",
        borderRadius: "var(--ledger-radius-control)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text-secondary)",
      }}
    >
      <span className="pointer-events-none truncate">{label}</span>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-[12px] size-[14px]"
        strokeWidth={1.8}
        style={{ color: "var(--color-text-faint)" }}
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="absolute inset-0 cursor-pointer opacity-0"
        {...ariaProps}
      >
        {children}
      </select>
    </div>
  );
}

function DateRangeField({
  label,
  from,
  to,
  onFromChange,
  onToChange,
}: {
  label: string;
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}) {
  const hasValue = from || to;
  const value = hasValue
    ? `${from || "—"} → ${to || "—"}`
    : "dd/mm/yy → dd/mm/yy";
  // LedgerDateRange is display-only; for now this picks an inline two-
  // input shell so the existing native date pickers keep working.
  return (
    <div
      className="inline-flex items-center gap-2"
      style={{
        height: 42,
        padding: "0 13px",
        borderRadius: "var(--ledger-radius-control)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <Eyebrow>{label}</Eyebrow>
      <input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        aria-label={`${label} from`}
        className="ledger-mono w-[110px] bg-transparent text-[12px] outline-none"
        style={{ color: hasValue ? "var(--color-text)" : "var(--color-text-faint)" }}
      />
      <span aria-hidden style={{ color: "var(--color-text-faint)" }}>→</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        aria-label={`${label} to`}
        className="ledger-mono w-[110px] bg-transparent text-[12px] outline-none"
        style={{ color: hasValue ? "var(--color-text)" : "var(--color-text-faint)" }}
      />
      {hasValue ? (
        <button
          type="button"
          onClick={() => {
            onFromChange("");
            onToChange("");
          }}
          aria-label="Clear date range"
          className="ml-0.5 rounded p-0.5 transition hover:bg-[var(--color-surface-raised)]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <X className="size-[12px]" />
        </button>
      ) : null}
    </div>
  );
}
