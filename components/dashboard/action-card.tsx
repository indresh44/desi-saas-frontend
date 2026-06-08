"use client";

// One enquiry, one action — the unit the new dashboard is built around.
//
// Collapsed state (default): title, customer, follow-up pill (from the
// server-side next-action cascade), optional Added date, and inline
// actions whose set depends on `next_action.type` (per
// dashboard-build-plan §C). NO card expanded on initial mount;
// `defaultOpen` is intentionally absent.
//
// Expanded state: lazy-fetched context bundle from
// `GET /leads/{id}/context`. Once fetched, cached on the component;
// collapsing/re-expanding never re-fetches in the same session.
//
// Action wiring is delegated to the parent (`onMarkDone`,
// `onSetFollowUp`, etc.) so the same card can be reused from
// non-dashboard surfaces without bringing dashboard-specific state.
//
// Visual: Ledger design system. The 4px left status stripe, follow-up
// pill, stage badge, and action buttons all read Ledger tokens — no
// raw colours here.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Phone,
  Sparkles,
  MessageSquare,
  StickyNote,
} from "lucide-react";
import {
  Eyebrow,
  FollowupPill,
  type FollowupKind,
  LedgerButton,
  Mono,
  StageBadge,
  WhatsAppIcon,
} from "@/components/ledger";
import { OUTCOME_META } from "@/components/followup-card/outcome-config";
import { OutcomeSheet } from "@/components/followup-card/outcome-sheet";
import { fetchLeadContext } from "@/lib/api/dashboard";
import { fetchLeadFollowUps } from "@/lib/api/followups";
import {
  resolveFollowup,
  type ResolveChannel,
  type ResolveFollowupRequest,
  type ResolveFollowupResult,
} from "@/lib/api/resolve-followup";
import { useLookupMaps } from "@/hooks/use-lookup-maps";
import { cn } from "@/lib/utils";
import {
  firstName,
  normalisePhone,
  telHref,
  whatsappHref,
} from "@/lib/contact";
import type { Lead } from "@/lib/types/lead";
import type { LeadFollowUp, NegativeAttempts } from "@/lib/types/followup";
import type {
  LeadContext,
  LeadContextFollowup,
  NextActionType,
} from "@/lib/types/next-action";

// How long the resolved-state confirmation stays visible before the card
// notifies the parent so the parent can refetch + remove. Chosen so the
// user gets a clear "what just happened" beat without making the list
// feel sluggish.
const RESOLVED_VISIBLE_MS = 1800;

// Compact money chip — "₹2.5L", "₹120K", "₹950". Mirrors the standalone
// FollowupActionCard helper. Returns null for missing / unparseable values
// so the caller can branch-render.
function shortMoney(value: string | null): string | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n >= 100000) return `₹${(n / 100000).toFixed(n >= 1000000 ? 1 : 2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

/** Two surfaces use this card today:
 *   - `dashboard` (default) — action set is driven by `next_action.type`;
 *     overdue/today shows [WhatsApp][Call][Done], no-followup/quiet shows
 *     [Set follow-up][WhatsApp].
 *   - `list` — always renders [Call][WhatsApp] (the enquiry list is for
 *     finding, not acting; Done/Set-follow-up stay on the dashboard). */
type ActionCardVariant = "dashboard" | "list";

interface ActionCardProps {
  lead: Lead;
  /** Default `"dashboard"`. See `ActionCardVariant`. */
  variant?: ActionCardVariant;
  /** Dashboard-only. Legacy "just mark done" path. Used as the fallback
   *  when `onResolved` is not supplied OR the lazy follow-up lookup
   *  returns nothing. Ignored in `variant="list"`. */
  onMarkDone?: (leadId: string) => Promise<void> | void;
  /** Dashboard-only. Navigates to the lead detail page so the existing
   *  follow-up form can be used. A dedicated modal is parked. */
  onSetFollowUp?: (leadId: string) => void;
  /** Optional override for the WhatsApp button. The list page passes this
   *  to open the in-app `LeadWhatsAppChatDrawer` instead of the wa.me
   *  deep link. When absent, the button uses the wa.me href fallback. */
  onWhatsApp?: (lead: Lead) => void;
  /** Dashboard-only. When supplied, the [Done] button opens the
   *  outcome-resolution sheet (POST /followups/{id}/resolve flow) instead
   *  of doing a one-shot mark-done. Called after a successful resolve so
   *  the parent can refetch + optimistically remove. */
  onResolved?: (leadId: string) => void;
}

/** Map the backend cascade type to the Ledger follow-up kind so the
 *  pill and the 4px status stripe stay in lockstep. */
const FOLLOWUP_KIND: Record<NextActionType, FollowupKind> = {
  followup_overdue: "overdue",
  followup_due_today: "today",
  no_followup_set: "unset",
  gone_quiet: "quiet",
  followup_upcoming: "scheduled",
  none: "none",
};

/** When the backend returns `next_action.type='none'` (terminal stage or
 *  early-funnel gate fall-through), `label` is "" by design — the
 *  dashboard hides the line entirely; the enquiry list shows a one-word
 *  terminal state ONLY when the stage name signals it. For non-terminal
 *  no-action leads (e.g. Quote Sent without a follow-up) we return null
 *  so the card renders without a noisy "On track" line. */
function derivedCalmLabel(lead: Lead): string | null {
  const stage = (lead.stageName ?? "").trim().toLowerCase();
  if (stage.includes("won")) return "Closed — won";
  if (stage.includes("lost")) return "Closed — lost";
  if (stage.includes("closed") || stage === "completed") return "Closed";
  return null;
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** "24 May" — used in the list-variant subtitle ("Added 24 May") so the
 *  card carries enough chronological context without expanding. */
function formatAddedDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function activityIcon(type: LeadContext["recentActivity"][number]["type"]) {
  switch (type) {
    case "call":
      return Phone;
    case "whatsapp":
      return MessageSquare;
    case "meeting":
      return Sparkles;
    case "note":
    default:
      return StickyNote;
  }
}

function followupStatusBadge(f: LeadContextFollowup) {
  if (f.status === "done") {
    return (
      <span
        className="ml-1 inline-block text-[11px] font-semibold"
        style={{ color: "var(--follow-done)" }}
      >
        ✓
      </span>
    );
  }
  if (f.status === "cancelled") {
    return (
      <span
        className="ml-1 inline-block text-[11px] font-semibold"
        style={{ color: "var(--color-text-muted)" }}
      >
        cancelled
      </span>
    );
  }
  return null;
}

export function ActionCard({
  lead,
  variant = "dashboard",
  onMarkDone,
  onSetFollowUp,
  onWhatsApp,
  onResolved,
}: ActionCardProps) {
  const action = lead.nextAction;
  const isListVariant = variant === "list";

  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<LeadContext | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  // --- Outcome-resolution sheet state ---
  // The dashboard endpoint now bulk-stitches `openFollowup` server-side
  // (0044) — that's our preferred source. The lazy lookup remains as a
  // fallback so a card that lands here without an eager follow-up (e.g.
  // from the list variant or a stale cached response) still works.
  const { stageMap } = useLookupMaps();
  const stagesArray = useMemo(() => Object.values(stageMap), [stageMap]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetChannel, setSheetChannel] = useState<ResolveChannel>("call");
  const [openFollowup, setOpenFollowup] = useState<LeadFollowUp | null>(
    lead.openFollowup ?? null,
  );

  // --- Local card-state machine ---
  // pending  → default (every card on first paint)
  // awaiting → user just tapped WhatsApp/Call; card asks "what happened?"
  // resolved → sheet submitted; card shows the outcome briefly before
  //            calling onResolved so the parent can refetch + remove
  type CardState = "pending" | "awaiting" | "resolved";
  const [cardState, setCardState] = useState<CardState>("pending");
  const [awaitingChannel, setAwaitingChannel] = useState<ResolveChannel>("call");
  // "Open on return" arming. After the user taps Call/WhatsApp the deep link
  // takes over; when they come back (visibilitychange) — or after a short
  // desktop fallback — we auto-open the sheet ONCE. Dismissing it clears the
  // flag so the card's "Log outcome" button stays the only way back in.
  const autoOpenRef = useRef(false);
  const awaitingChannelRef = useRef<ResolveChannel>("call");

  const openSheetFromAwaiting = useCallback(() => {
    autoOpenRef.current = false;
    setSheetChannel(awaitingChannelRef.current);
    setSheetOpen(true);
  }, []);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible" && autoOpenRef.current) {
        openSheetFromAwaiting();
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [openSheetFromAwaiting]);
  const [resolvedSummary, setResolvedSummary] = useState<{
    result: ResolveFollowupResult;
    request: ResolveFollowupRequest;
    resolvedAt: string;
  } | null>(null);

  const toggle = useCallback(async () => {
    const next = !open;
    setOpen(next);

    if (next && !context && !contextLoading) {
      setContextLoading(true);
      setContextError(null);
      try {
        const bundle = await fetchLeadContext(lead.id);
        setContext(bundle);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load context.";
        setContextError(message);
      } finally {
        setContextLoading(false);
      }
    }
  }, [open, context, contextLoading, lead.id]);

  const phoneNormalised = normalisePhone(lead.customerPhone);
  const customerLabel = lead.customerName ?? "Unknown customer";
  const addedDateLabel = formatAddedDate(lead.createdAt);

  // The greeting baked into the WhatsApp deep-link. Bigger templating
  // lives in the chat surface; this card just opens a friendly opener
  // so the owner can take it from there.
  const waMessage = `Hi ${firstName(lead.customerName)}, just following up on ${lead.title}.`;
  const wa = whatsappHref(lead.customerPhone, waMessage);
  const tel = telHref(lead.customerPhone);

  // [Done] click — when `onResolved` is wired, lazy-load the open
  // follow-up and open the OutcomeSheet. Falls back to the legacy
  // one-shot `onMarkDone` when (a) the parent didn't supply onResolved,
  // or (b) the lazy lookup found no pending follow-up to resolve.
  const handleDone = useCallback(async () => {
    if (!onResolved) {
      if (!onMarkDone) return;
      setMarking(true);
      try {
        await onMarkDone(lead.id);
      } finally {
        setMarking(false);
      }
      return;
    }

    setMarking(true);
    try {
      let f = openFollowup;
      if (!f) {
        const followups = await fetchLeadFollowUps(lead.id);
        f =
          followups
            .filter((row) => row.status === "pending")
            .sort(
              (a, b) =>
                new Date(a.scheduledAt).getTime() -
                new Date(b.scheduledAt).getTime(),
            )[0] ?? null;
        setOpenFollowup(f);
      }
      if (!f) {
        // No pending follow-up — fall back to the legacy mark-done path
        // so the [Done] button still does something sensible.
        if (onMarkDone) await onMarkDone(lead.id);
        return;
      }
      setSheetChannel("call");
      setSheetOpen(true);
    } finally {
      setMarking(false);
    }
  }, [onResolved, onMarkDone, lead.id, openFollowup]);

  // Sheet submit — posts to /resolve, flips the card to the resolved
  // state for a brief visual confirmation, then notifies the parent so
  // the parent can refetch + remove. The delay is what gives the user a
  // beat to register "yes, that's what I just did".
  const handleSheetSubmit = useCallback(
    async (request: ResolveFollowupRequest) => {
      if (!openFollowup) return;
      const result = await resolveFollowup(openFollowup.id, request);
      setSheetOpen(false);
      setResolvedSummary({
        result,
        request,
        resolvedAt: new Date().toISOString(),
      });
      setCardState("resolved");
      window.setTimeout(() => {
        onResolved?.(lead.id);
      }, RESOLVED_VISIBLE_MS);
    },
    [openFollowup, onResolved, lead.id],
  );

  // After the user taps WhatsApp/Call, flip the card to the "awaiting"
  // state — "Called X — what happened?" with [Log outcome] / [Cancel].
  // The deep link itself has already fired in the button handler; this
  // is the in-card prompt that follows. Falls back silently when the
  // lead has no pending follow-up (the card was never resolution-eligible).
  const flipToAwaiting = useCallback(
    async (channel: ResolveChannel) => {
      if (!onResolved) return; // dashboard-only behaviour
      // Hydrate openFollowup lazily if the parent didn't pass it eagerly.
      let f = openFollowup;
      if (!f) {
        try {
          const followups = await fetchLeadFollowUps(lead.id);
          f =
            followups
              .filter((row) => row.status === "pending")
              .sort(
                (a, b) =>
                  new Date(a.scheduledAt).getTime() -
                  new Date(b.scheduledAt).getTime(),
              )[0] ?? null;
        } catch {
          f = null;
        }
        setOpenFollowup(f);
      }
      if (!f) return;
      awaitingChannelRef.current = channel;
      setAwaitingChannel(channel);
      setCardState("awaiting");
      // Arm the auto-open. The deep link may background the tab (mobile →
      // visibilitychange handles it) or do nothing (desktop tel: → the
      // timeout fallback opens the sheet so the flow still completes).
      autoOpenRef.current = true;
      window.setTimeout(() => {
        if (autoOpenRef.current && document.visibilityState === "visible") {
          openSheetFromAwaiting();
        }
      }, 600);
    },
    [onResolved, openFollowup, lead.id, openSheetFromAwaiting],
  );

  // [Log outcome] in awaiting state — opens the sheet on the channel
  // the user just deep-linked through.
  const handleLogFromAwaiting = useCallback(() => {
    autoOpenRef.current = false;
    setSheetChannel(awaitingChannel);
    setSheetOpen(true);
  }, [awaitingChannel]);

  // [Cancel] in awaiting state — back to pending without writing anything.
  const handleCancelAwaiting = useCallback(() => {
    autoOpenRef.current = false;
    setCardState("pending");
  }, []);

  // [Awaiting reply] — the open follow-up is flagged awaiting (WhatsApp sent,
  // no reply yet). Tapping logs the resolution; the sheet drops the
  // "Sent · awaiting reply" chip (it's already in that state).
  const handleAwaitingReply = useCallback(() => {
    autoOpenRef.current = false;
    setSheetChannel("whatsapp");
    setSheetOpen(true);
  }, []);

  const hasFollowupAction =
    action?.type === "followup_overdue" || action?.type === "followup_due_today";

  // Open follow-up is in the "awaiting reply" holding state (WhatsApp sent).
  // Dashboard-only — needs onResolved to drive the resolve sheet.
  const isAwaitingReply = !!onResolved && openFollowup?.lastOutcome === "wa_sent";

  // Follow-up pill: pick the cascade-derived kind; fall back to derived
  // calm label on the list variant when the cascade is NONE but the stage
  // tells us this is closed.
  const followupKind: FollowupKind = action ? FOLLOWUP_KIND[action.type] : "none";
  const calmLabel = isListVariant ? derivedCalmLabel(lead) : null;
  const followupLabel =
    action?.label || (action?.type === "none" && calmLabel) || null;
  // "Closed — won/lost" should render with the done semantic, not as a
  // blank "none" pill.
  const followupKindForPill: FollowupKind =
    action?.type === "none" && calmLabel ? "closed" : followupKind;

  // --- Chips visible on every dashboard pending card ---
  // Attempt-streak: only renders for follow-ups that have been tried at
  // least once. Reads payload-snapshot fields the dashboard endpoint
  // now bulk-stitches into the lead.
  // Negative-attempt tally — backend-derived per-type streak (resets on a
  // positive outcome). Rendered as one chip per outcome type.
  const negAttempts = openFollowup?.negativeAttempts ?? null;
  const negTotal = negAttempts?.total ?? 0;
  // The open follow-up's topic ("Regarding…") — shown as a line on the card.
  const followUpNote = openFollowup?.note?.trim() ? openFollowup.note.trim() : null;
  const moneyChip = !isListVariant ? shortMoney(lead.estimatedValue) : null;

  // --- Resolved-state derivations ---
  // Drives the tone (teal vs rose) of the resolved card and the icon /
  // label that ride alongside the activity-log line.
  const resolvedOutcomeMeta = resolvedSummary
    ? OUTCOME_META[resolvedSummary.request.outcome]
    : null;
  const resolvedIsLost =
    resolvedOutcomeMeta?.flow === "terminal" ||
    (resolvedSummary?.request.stage_to ?? "").toLowerCase() === "lost";

  // Card tone for the article wrapper. Pending = default surface; awaiting
  // = soft amber; resolved = soft teal or rose. We reuse existing Ledger
  // tokens (--follow-unset / --follow-done / --follow-overdue) so we don't
  // introduce a new palette.
  const cardToneStyle = useMemo(() => {
    if (cardState === "awaiting") {
      return {
        background: "color-mix(in oklch, var(--follow-unset) 10%, var(--color-surface))",
        borderColor: "color-mix(in oklch, var(--follow-unset) 30%, var(--color-border))",
      } as React.CSSProperties;
    }
    if (cardState === "resolved") {
      const accent = resolvedIsLost ? "var(--follow-overdue)" : "var(--follow-done)";
      return {
        background: `color-mix(in oklch, ${accent} 10%, var(--color-surface))`,
        borderColor: `color-mix(in oklch, ${accent} 30%, var(--color-border))`,
      } as React.CSSProperties;
    }
    return {
      borderColor: "var(--color-border)",
    } as React.CSSProperties;
  }, [cardState, resolvedIsLost]);

  return (
    <article
      className="relative overflow-hidden border bg-card transition-colors"
      style={{
        ...cardToneStyle,
        borderRadius: "var(--ledger-radius-card)",
      }}
    >
      {/* 4px coloured left status stripe — Ledger §7.13. Driven by the
          follow-up kind so the most actionable cards (overdue / today /
          unset) read at a glance; calm states show no stripe. Hidden in
          awaiting / resolved states where the soft tone is the signal. */}
      {cardState === "pending" ? <StatusEdge kind={followupKind} /> : null}

      <div className="flex flex-col gap-3 px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            {/* Title block. Dashboard wraps title+subtitle in a Link to
                the lead detail page — the only way to drill in from the
                dashboard card. List drops the Link entirely; the
                dedicated "Details →" button at the bottom of the action
                column carries that nav so the title is plain reading
                text. */}
            {isListVariant ? (
              <>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h3
                    className="min-w-0 truncate text-[14px] font-semibold tracking-[-0.01em] sm:text-[15px]"
                    style={{ color: "var(--color-text)" }}
                  >
                    {lead.title}
                    {followUpNote ? (
                      <span className="font-medium" style={{ color: "var(--color-text-muted)" }}>
                        {" "}- ({followUpNote})
                      </span>
                    ) : null}
                  </h3>
                  {lead.stageName ? (
                    <StageBadge name={lead.stageName} color={lead.stageColor} />
                  ) : null}
                </div>
                <div
                  className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <span
                    className="truncate font-medium"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {customerLabel}
                  </span>
                  {lead.source ? (
                    <>
                      <span aria-hidden style={{ color: "var(--color-border)" }}>·</span>
                      <span className="capitalize">
                        {lead.source.replaceAll("_", " ")}
                      </span>
                    </>
                  ) : null}
                  {addedDateLabel ? (
                    <>
                      <span aria-hidden style={{ color: "var(--color-border)" }}>·</span>
                      <Mono className="text-[12.5px]" style={{ color: "var(--color-text-faint)" }}>
                        Added {addedDateLabel}
                      </Mono>
                    </>
                  ) : null}
                </div>
              </>
            ) : (
              <Link
                href={`/leads/${lead.id}`}
                className="block rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <h3
                  className="truncate text-[14px] font-semibold tracking-[-0.01em] sm:text-[15px]"
                  style={{ color: "var(--color-text)" }}
                >
                  {lead.title}
                  {followUpNote ? (
                    <span className="font-medium" style={{ color: "var(--color-text-muted)" }}>
                      {" "}- ({followUpNote})
                    </span>
                  ) : null}
                </h3>
                <p
                  className="mt-0.5 truncate text-[13px] font-medium"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {customerLabel}
                </p>
              </Link>
            )}

            {/* Follow-up pill + (dashboard-only) attempt-streak + value
                chips on a single mt-2 wrap-flex row. The pill is the
                primary signal (Ledger §7.7); the attempt streak surfaces
                "this lead has already been chased" so the user can pick
                a different channel; the money chip aids prioritisation. */}
            {(action && followupLabel) || negTotal >= 1 || moneyChip ? (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {action && followupLabel ? (
                  <FollowupPill kind={followupKindForPill} label={followupLabel} />
                ) : null}
                {!isListVariant && negTotal >= 1 ? (
                  <AttemptTally attempts={negAttempts} />
                ) : null}
                {moneyChip ? (
                  <Mono
                    className="text-[12px] font-semibold"
                    style={{
                      color: "var(--color-text-secondary)",
                      background: "var(--color-surface-raised)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--ledger-radius-sm)",
                      padding: "1px 7px",
                    }}
                  >
                    {moneyChip}
                  </Mono>
                ) : null}
              </div>
            ) : null}

            {/* "View context" lives inside the left column so the two
                columns balance in height. Putting it outside left a gap
                whenever the right action column was taller than
                title + subtitle. */}
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls={`ctx-${lead.id}`}
              className="-ml-1 mt-2 flex items-center gap-1.5 self-start rounded px-1 py-0.5 text-[12.5px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ color: "var(--color-text-muted)" }}
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  open && "rotate-180",
                )}
              />
              {open ? "Hide context" : "View context"}
            </button>
          </div>

          {/* Action cluster. List variant stacks: [WA][Call] row, then a
              Details → link below — title no longer carries the lead-
              detail nav (that lives on the button now). */}
          <div
            className={cn(
              "flex gap-2",
              isListVariant
                ? "flex-col sm:items-end"
                : "flex-wrap sm:flex-nowrap sm:justify-end",
            )}
          >
            {isListVariant ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <WhatsAppAction
                    lead={lead}
                    wa={wa}
                    onWhatsApp={onWhatsApp}
                  />
                  <CallAction tel={tel} />
                </div>
                <Link
                  href={`/leads/${lead.id}`}
                  className="inline-flex items-center gap-1 self-end rounded text-[12.5px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Details
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : cardState === "awaiting" ? (
              // Post-deep-link prompt — same column slot, different buttons.
              <>
                <LedgerButton size="md" onClick={handleLogFromAwaiting}>
                  Log outcome
                </LedgerButton>
                <LedgerButton
                  variant="ghost"
                  size="md"
                  onClick={handleCancelAwaiting}
                >
                  Cancel
                </LedgerButton>
              </>
            ) : cardState === "resolved" && resolvedSummary && resolvedOutcomeMeta ? (
              // Brief confirmation before onResolved fires and the parent
              // removes the card. Reads as "yes, that's what just happened".
              <ResolvedConfirmation
                summary={resolvedSummary}
                outcomeIcon={resolvedOutcomeMeta.icon}
                outcomeTitle={resolvedOutcomeMeta.title}
                isLost={resolvedIsLost}
              />
            ) : isAwaitingReply ? (
              // WhatsApp sent, waiting on a reply — tap to log how it landed.
              <LedgerButton
                variant="setFollowup"
                size="md"
                onClick={handleAwaitingReply}
              >
                ⏳ Awaiting reply
              </LedgerButton>
            ) : hasFollowupAction ? (
              <>
                <WhatsAppAction
                  lead={lead}
                  wa={wa}
                  onWhatsApp={onWhatsApp}
                  onAfterOpen={
                    onResolved
                      ? () => void flipToAwaiting("whatsapp")
                      : undefined
                  }
                />
                <CallAction
                  tel={tel}
                  onAfterOpen={
                    onResolved
                      ? () => void flipToAwaiting("call")
                      : undefined
                  }
                />
                {onMarkDone || onResolved ? (
                  <LedgerButton
                    variant="ghost"
                    size="md"
                    onClick={handleDone}
                    disabled={marking}
                  >
                    {marking ? "Updating…" : "Done"}
                  </LedgerButton>
                ) : null}
              </>
            ) : (
              <>
                {onSetFollowUp ? (
                  <LedgerButton
                    variant="setFollowup"
                    size="md"
                    onClick={() => onSetFollowUp(lead.id)}
                  >
                    Set follow-up
                  </LedgerButton>
                ) : null}
                <WhatsAppAction lead={lead} wa={wa} onWhatsApp={onWhatsApp} />
              </>
            )}
          </div>
        </div>

        {open ? (
          <div
            id={`ctx-${lead.id}`}
            className="space-y-4 border-t pt-4"
            style={{ borderColor: "var(--color-border-subtle)" }}
          >
            {contextLoading ? (
              <p
                className="text-[12.5px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                Loading context…
              </p>
            ) : contextError ? (
              <p
                className="text-[12.5px]"
                style={{ color: "var(--follow-overdue)" }}
              >
                {contextError}
              </p>
            ) : context ? (
              <ContextBody context={context} leadId={lead.id} />
            ) : null}
          </div>
        ) : null}
      </div>
      <span className="sr-only">phone:{phoneNormalised}</span>

      {/* Outcome-resolution sheet — only mounts when [Done] has been
          tapped (openFollowup is hydrated lazily). Same component used
          by /dev/followup-card and the lead detail page top slot. */}
      {openFollowup ? (
        <OutcomeSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          channel={sheetChannel}
          followup={openFollowup}
          lead={lead}
          stages={stagesArray}
          onSubmit={handleSheetSubmit}
        />
      ) : null}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Action buttons — thin wrappers around LedgerButton that handle the
// href / onClick / disabled branching for tel: and wa.me links.
// ---------------------------------------------------------------------------

function WhatsAppAction({
  lead,
  wa,
  onWhatsApp,
  onAfterOpen,
}: {
  lead: Lead;
  wa: string | null;
  onWhatsApp?: (lead: Lead) => void;
  /** Fired after the wa.me deep link is opened. Dashboard wires this
   *  to surface the outcome sheet so the owner can log what happened.
   *  Skipped when `onWhatsApp` is the override (in-app drawer surface
   *  handles its own follow-up logging). */
  onAfterOpen?: () => void;
}) {
  const disabled = !onWhatsApp && !wa;
  const handleClick = () => {
    if (onWhatsApp) {
      onWhatsApp(lead);
      return;
    }
    if (wa) {
      window.open(wa, "_blank", "noopener,noreferrer");
      onAfterOpen?.();
    }
  };
  return (
    <LedgerButton
      variant="whatsapp"
      size="md"
      onClick={handleClick}
      disabled={disabled}
    >
      <WhatsAppIcon size={15} />
      WhatsApp
    </LedgerButton>
  );
}

function CallAction({
  tel,
  onAfterOpen,
}: {
  tel: string | null;
  /** Fired after the tel: deep link is triggered. On mobile the dialer
   *  takes over, but the sheet is still mounted when the user returns;
   *  on desktop the tel: nav is a no-op so the sheet surfaces right away. */
  onAfterOpen?: () => void;
}) {
  const handleClick = tel
    ? () => {
        // Use a transient anchor instead of window.location — assigning
        // location to a tel: URL blanks the SPA view on some browsers.
        const a = document.createElement("a");
        a.href = tel;
        a.target = "_blank";
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
        onAfterOpen?.();
      }
    : undefined;
  return (
    <LedgerButton
      variant="action"
      size="md"
      onClick={handleClick}
      disabled={!tel}
    >
      <Phone className="size-[15px]" strokeWidth={1.8} />
      Call
    </LedgerButton>
  );
}

// ---------------------------------------------------------------------------
// 4px left status edge — only renders for the three triage states
// (overdue / today / unset) per Ledger §7.13. Calm states show nothing,
// keeping the list visually quiet.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Resolved-state confirmation — small footer block that appears in place of
// the action button cluster for ~1.8s after a successful resolve. Mirrors
// the standalone FollowupActionCard's resolved card, scaled down for the
// dashboard's denser layout.
// ---------------------------------------------------------------------------

function relativeShort(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)}m ago`;
  return new Date(iso).toLocaleTimeString();
}

function ResolvedConfirmation({
  summary,
  outcomeIcon,
  outcomeTitle,
  isLost,
}: {
  summary: {
    result: ResolveFollowupResult;
    request: ResolveFollowupRequest;
    resolvedAt: string;
  };
  outcomeIcon: string;
  outcomeTitle: string;
  isLost: boolean;
}) {
  const { result, request, resolvedAt } = summary;

  // Headline: where the resolve actually landed. A still-pending follow-up
  // means it was kept on the list (retry "just log" / WhatsApp "wait for
  // reply" / reschedule) rather than completed.
  const stillOpen = result.followup.status === "pending";
  const resultLine = (() => {
    if (result.nextFollowup) {
      const when = new Date(result.nextFollowup.scheduledAt).toLocaleString();
      return `Next follow-up ${when}`;
    }
    if (isLost) return "Closed";
    if (stillOpen) {
      if (OUTCOME_META[request.outcome].flow === "awaiting") return "Awaiting reply";
      return request.next_dt ? "Rescheduled" : "Logged — follow-up still open";
    }
    if (request.set_no_followup) return "Done, no next step set";
    return "Rescheduled";
  })();

  const accent = isLost ? "var(--follow-overdue)" : "var(--follow-done)";

  return (
    <div className="flex min-w-0 max-w-[260px] flex-col gap-1 text-right">
      <div className="flex items-center justify-end gap-1.5 text-[13px] font-semibold" style={{ color: accent }}>
        <span aria-hidden>{outcomeIcon}</span>
        <span>{outcomeTitle}</span>
      </div>
      <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
        {resultLine} · {relativeShort(resolvedAt)}
      </p>
      {request.note ? (
        <p
          className="truncate text-[12px] italic"
          style={{ color: "var(--color-text-muted)" }}
          title={request.note}
        >
          &ldquo;{request.note}&rdquo;
        </p>
      ) : null}
      {!stillOpen && request.set_no_followup && !isLost ? (
        <p
          className="text-[11.5px] italic"
          style={{ color: "var(--color-text-faint)" }}
        >
          🛟 No next step set — will resurface if it goes quiet.
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Attempt tally — one chip per retry-negative outcome type from the
// backend-derived streak ("↻ No answer ×2", "↻ Busy ×1"). Resets when a
// positive outcome is logged. Uses the overdue Ledger token like the pill.
// ---------------------------------------------------------------------------

const ATTEMPT_LABELS: { key: keyof Omit<NegativeAttempts, "total">; label: string }[] = [
  { key: "no_answer", label: "No answer" },
  { key: "busy", label: "Busy" },
  { key: "wa_not_replied", label: "Not replied" },
];

function AttemptTally({ attempts }: { attempts: NegativeAttempts | null }) {
  if (!attempts) return null;
  const chips = ATTEMPT_LABELS.filter(({ key }) => attempts[key] > 0);
  if (chips.length === 0) return null;
  return (
    <>
      {chips.map(({ key, label }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold"
          style={{
            background: "color-mix(in oklch, var(--follow-overdue) 12%, transparent)",
            color: "var(--follow-overdue)",
            border: "1px solid color-mix(in oklch, var(--follow-overdue) 30%, transparent)",
          }}
        >
          ↻ {label} ×{attempts[key]}
        </span>
      ))}
    </>
  );
}

function StatusEdge({ kind }: { kind: FollowupKind }) {
  let color: string | null = null;
  if (kind === "overdue") color = "var(--follow-overdue)";
  else if (kind === "today") color = "var(--color-accent)";
  else if (kind === "unset") color = "var(--follow-unset)";
  if (!color) return null;
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width: 4,
        background: color,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Expanded body — pure presentation. Order is context-first per build plan
// §C: AI summary → enquiry note → recent follow-ups → recent activity →
// link to full enquiry.
// ---------------------------------------------------------------------------

function ContextBody({
  context,
  leadId,
}: {
  context: LeadContext;
  leadId: string;
}) {
  const hasFollowups = context.recentFollowups.length > 0;
  const hasActivity = context.recentActivity.length > 0;

  return (
    <>
      {context.aiSummary ? (
        <section>
          <h4
            className="mb-1.5 flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: "var(--color-accent)" }}
          >
            <Sparkles className="h-3 w-3" /> AI summary
          </h4>
          <div
            className="rounded-[var(--ledger-radius-control)] px-3 py-2 text-[12.5px] leading-relaxed"
            style={{
              background: "var(--color-accent-soft)",
              border: "1px solid color-mix(in oklch, var(--color-accent) 20%, transparent)",
              color: "color-mix(in oklch, var(--color-accent) 78%, var(--color-text))",
            }}
          >
            {context.aiSummary}
          </div>
        </section>
      ) : null}

      {context.enquiryNote ? (
        <section>
          <Eyebrow className="mb-1.5 block">Enquiry note</Eyebrow>
          <p
            className="whitespace-pre-line text-[12.5px] leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {context.enquiryNote}
          </p>
        </section>
      ) : null}

      {hasFollowups ? (
        <section>
          <Eyebrow className="mb-1.5 block">Recent follow-ups</Eyebrow>
          <ul className="space-y-1.5">
            {context.recentFollowups.map((f) => (
              <li
                key={f.id}
                className="border-l-2 pl-2.5 text-[12.5px]"
                style={{ borderColor: "var(--color-border-subtle)" }}
              >
                <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                  <Mono className="text-[12.5px]">{formatRelative(f.scheduledAt)}</Mono>
                  {followupStatusBadge(f)}
                </p>
                {f.note ? (
                  <p className="mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {f.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasActivity ? (
        <section>
          <Eyebrow className="mb-1.5 block">Recent activity</Eyebrow>
          <ul className="space-y-1.5">
            {context.recentActivity.map((a) => {
              const Icon = activityIcon(a.type);
              return (
                <li
                  key={a.id}
                  className="flex gap-2 border-l-2 pl-2.5 text-[12.5px]"
                  style={{ borderColor: "var(--color-border-subtle)" }}
                >
                  <Icon
                    className="mt-0.5 h-3 w-3 flex-none"
                    style={{ color: "var(--color-text-muted)" }}
                  />
                  <div className="min-w-0">
                    <p
                      className="font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      <Mono className="text-[12.5px]">{formatRelative(a.createdAt)}</Mono>
                    </p>
                    <p
                      className="mt-0.5"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {a.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {!context.aiSummary &&
      !context.enquiryNote &&
      !hasFollowups &&
      !hasActivity ? (
        <p
          className="text-[12.5px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          No context yet — open the enquiry to add notes or log a touch.
        </p>
      ) : null}

      <Link
        href={`/leads/${leadId}`}
        className="inline-block text-[12.5px] font-semibold transition hover:underline"
        style={{ color: "var(--color-accent)" }}
      >
        See full enquiry →
      </Link>
    </>
  );
}
