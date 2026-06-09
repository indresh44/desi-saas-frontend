"use client";

// "Today's Activity" — the dashboard's bottom-of-page daily diary.
//
// The whole dashboard above this is forward-looking ("what needs me?").
// This is the one backward-looking surface: a descriptive, newest-first log
// of what the owner actually got done today — follow-ups handled, calls and
// WhatsApp logged, new enquiries, payments, invoices, manual stage moves.
//
// It exists because resolved follow-up cards vanish from the action list ~1.8s
// after they're handled; this is where that work persists for the rest of the
// day so the owner can see "haan, ye sab kar liya aaj".
//
// Owner actions only — the backend filters actor_type=human, so assistant-
// driven actions (which have their own "Recently done" section) never appear
// here. Resets at midnight (server scopes to the business's local day).
//
// Pure presentation: the parent fetches and passes data in. Visual language
// is Ledger — muted icons, mono timestamps, hairline row separators.

import Link from "next/link";
import {
  ArrowRightLeft,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CalendarX,
  FileText,
  IndianRupee,
  MessageSquare,
  Phone,
  Sparkles,
  StickyNote,
  type LucideIcon,
} from "lucide-react";

import { Eyebrow, Mono } from "@/components/ledger";
import { OUTCOME_META } from "@/components/followup-card/outcome-config";
import type { Outcome } from "@/lib/api/resolve-followup";
import { ACTIVITY_TYPE_LABELS, type ActivityType } from "@/lib/types/activity";
import type {
  TodayActivityItem,
  TodayActivityType,
} from "@/lib/types/dashboard";

interface TodayActivitySectionProps {
  items: TodayActivityItem[];
  total: number;
  countsByType: Record<string, number>;
  moneyCollectedToday: number;
}

// Type → icon. Kept explicit so each row reads at a glance. "Positive" types
// (completed follow-up, payment, new enquiry) get a done-tinted icon; the rest
// stay muted so the row list is calm.
const ICON_FOR: Record<TodayActivityType, LucideIcon> = {
  call: Phone,
  whatsapp: MessageSquare,
  meeting: CalendarClock,
  note: StickyNote,
  status_change: ArrowRightLeft,
  followup_scheduled: CalendarPlus,
  followup_rescheduled: CalendarClock,
  followup_completed: CalendarCheck,
  followup_cancelled: CalendarX,
  invoice_created: FileText,
  invoice_sent: FileText,
  invoice_approved: FileText,
  invoice_cancelled: FileText,
  invoice_adjusted: FileText,
  payment_recorded: IndianRupee,
  lead_created: Sparkles,
};

const DONE_TINTED: ReadonlySet<TodayActivityType> = new Set<TodayActivityType>([
  "payment_recorded",
  "followup_completed",
  "invoice_approved",
  "lead_created",
]);

function shortMoney(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n >= 100000) return `₹${(n / 100000).toFixed(n >= 1000000 ? 1 : 2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${Math.round(n)}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // en-US for uppercase "AM/PM" (en-IN renders lowercase "am/pm").
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatNextDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const RESOLVE_TYPES: ReadonlySet<TodayActivityType> = new Set<TodayActivityType>([
  "call",
  "whatsapp",
]);

/** "Modular kitchen" topic + "Interested" outcome live in structured payload
 *  fields, not the raw description (which collapses to just the note for a
 *  resolve). Map the outcome value to its canonical human title. */
function outcomeTitle(outcome: string | null): string | null {
  if (!outcome) return null;
  const meta = OUTCOME_META[outcome as Outcome];
  return meta ? meta.title : outcome.replace(/_/g, " ");
}

/** Who/what the row is about: "Rohit Tiwari (Modular kitchen)". Drops the
 *  parenthetical when the title is missing or identical to the customer. */
function subjectLabel(item: TodayActivityItem): string | null {
  const customer = item.customer_name?.trim() || null;
  const title = item.lead_title?.trim() || null;
  if (customer && title && customer.toLowerCase() !== title.toLowerCase()) {
    return `${customer} (${title})`;
  }
  return customer || title;
}

// result_action values that mean the follow-up was completed (vs rescheduled
// or merely logged). Drives the done-tint on the row, so a follow-up resolved
// via a call/WhatsApp reads as done even though the activity row itself is a
// `call`/`whatsapp`, not a `followup_completed`.
const COMPLETED_RESULTS: ReadonlySet<string> = new Set([
  "marked_done",
  "next_followup",
  "closed",
]);

function isCompletedResolve(item: TodayActivityItem): boolean {
  return (
    RESOLVE_TYPES.has(item.type) &&
    item.result_action != null &&
    COMPLETED_RESULTS.has(item.result_action)
  );
}

/** The contact + outcome for a resolve row, e.g. "Called · Interested". */
function contactLabel(item: TodayActivityItem): string {
  const verb = item.type === "whatsapp" ? "WhatsApp" : "Called";
  const outcome = outcomeTitle(item.outcome);
  return outcome ? `${verb} · ${outcome}` : verb;
}

/** Shared short label for the activity type — single source of truth, same
 *  wording as the lead-detail timeline ("Stage moved", "Payment", etc.). */
function typeLabel(item: TodayActivityItem): string {
  return ACTIVITY_TYPE_LABELS[item.type as ActivityType] ?? item.type;
}

/** The action clause shown as the row's predicate (after the "— ").
 *  - Resolve rows where the follow-up reached a disposition lead with it —
 *    "Follow-up done", "Follow-up rescheduled to 12 Jun".
 *  - Resolve rows still open (just logged) lead with the contact attempt.
 *  - Every other type uses the shared `ACTIVITY_TYPE_LABELS` label. */
function actionLabel(item: TodayActivityItem): string {
  if (!RESOLVE_TYPES.has(item.type)) return typeLabel(item);
  const next = formatNextDate(item.next_dt);
  switch (item.result_action) {
    // `closed` (deal moved/lost in the same step) is folded into "done" — both
    // mean the follow-up is complete, and the `→ {stage}` chip in the detail
    // line already conveys where the deal went (e.g. → Lost).
    case "marked_done":
    case "closed":
      return "Follow-up done";
    case "next_followup":
      return next ? `Follow-up done · next scheduled to ${next}` : "Follow-up done";
    case "rescheduled":
      return next ? `Follow-up rescheduled to ${next}` : "Follow-up rescheduled";
    default:
      return contactLabel(item); // "logged" / none — still open
  }
}

/** The muted second line — the specifics under the headline label.
 *  - Resolve rows: contact + outcome, follow-up topic, stage, note.
 *  - Other rows: the `description`, with the (now-redundant) leading type
 *    label stripped so we don't print "Stage moved · Stage moved from …". */
function detailLine(item: TodayActivityItem): string | null {
  if (RESOLVE_TYPES.has(item.type)) {
    const parts: string[] = [];
    // When the headline is a disposition, surface the call/outcome here so the
    // owner still sees how the follow-up was closed. When still open, the
    // headline already IS the contact label, so don't repeat it.
    const hasDisposition =
      item.result_action != null && item.result_action !== "logged";
    if (hasDisposition) parts.push(contactLabel(item));
    const topic = item.followup_note?.trim();
    if (topic) parts.push(`re: ${topic}`);
    if (item.to_stage_name) parts.push(`→ ${item.to_stage_name}`);
    const note = item.note?.trim();
    if (note && note !== topic) parts.push(`“${note}”`);
    return parts.length ? parts.join(" · ") : null;
  }

  const description = item.description?.trim();
  if (!description) return null;
  const label = typeLabel(item);
  // Drop a leading "Stage moved" / "Payment" / … so the detail reads as the
  // remainder ("from New Enquiry to Quote Sent") rather than repeating itself.
  if (description.toLowerCase().startsWith(label.toLowerCase())) {
    const rest = description.slice(label.length).replace(/^[\s:—–-]+/, "").trim();
    return rest || null;
  }
  return description;
}

// Build the human summary line shown next to the "TODAY" eyebrow. Counts the
// follow-up family together (the owner thinks "follow-ups", not the four
// sub-types) and surfaces the few high-value tallies. Always leads with the
// total so the line reads as a one-glance "I did N things today".
function summaryLine(
  total: number,
  counts: Record<string, number>,
  money: number,
): string {
  const followups =
    (counts.followup_completed ?? 0) +
    (counts.followup_rescheduled ?? 0) +
    (counts.followup_scheduled ?? 0) +
    (counts.followup_cancelled ?? 0) +
    (counts.call ?? 0) +
    (counts.whatsapp ?? 0);
  const newEnquiries = counts.lead_created ?? 0;
  const payments = counts.payment_recorded ?? 0;

  const parts: string[] = [];
  if (followups > 0)
    parts.push(`${followups} follow-up${followups === 1 ? "" : "s"}`);
  if (newEnquiries > 0)
    parts.push(`${newEnquiries} new ${newEnquiries === 1 ? "enquiry" : "enquiries"}`);
  if (payments > 0) {
    const m = shortMoney(money);
    parts.push(m ? `${m} collected` : `${payments} payment${payments === 1 ? "" : "s"}`);
  }

  const head = `${total} action${total === 1 ? "" : "s"}`;
  return parts.length ? `${head} · ${parts.join(" · ")}` : head;
}

export function TodayActivitySection({
  items,
  total,
  countsByType,
  moneyCollectedToday,
}: TodayActivitySectionProps) {
  const hiddenCount = Math.max(0, total - items.length);

  return (
    <section
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--ledger-radius-card)",
      }}
    >
      {/* Header — always-visible summary so the owner gets the "I got stuff
          done" beat without scrolling the list. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 sm:px-5">
        <Eyebrow>Today</Eyebrow>
        <span
          aria-hidden
          className="h-px flex-1"
          style={{ background: "var(--color-border-subtle)" }}
        />
        {total > 0 ? (
          <span className="text-[12.5px] font-semibold" style={{ color: "var(--color-text-muted)" }}>
            {summaryLine(total, countsByType, moneyCollectedToday)}
          </span>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p
          className="px-4 pb-4 text-[13px] sm:px-5"
          style={{ color: "var(--color-text-muted)" }}
        >
          Nothing logged yet today — your calls, payments, and enquiries will
          show up here.
        </p>
      ) : (
        <ul className="border-t" style={{ borderColor: "var(--color-border-subtle)" }}>
          {items.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
          {hiddenCount > 0 ? (
            <li
              className="px-4 py-2 text-center text-[12.5px] font-medium sm:px-5"
              style={{ color: "var(--color-text-faint)" }}
            >
              + {hiddenCount} more today
            </li>
          ) : null}
        </ul>
      )}
    </section>
  );
}

function ActivityRow({ item }: { item: TodayActivityItem }) {
  const Icon = ICON_FOR[item.type] ?? StickyNote;
  const tinted = DONE_TINTED.has(item.type) || isCompletedResolve(item);

  // What happened, against which enquiry, with notes/topic — composed from
  // structured fields rather than the raw description (see helpers above).
  const subject = subjectLabel(item);
  const action = actionLabel(item);
  const detail = detailLine(item);

  const body = (
    <div className="flex min-w-0 items-start gap-2.5 px-4 py-2.5 sm:px-5">
      <Mono
        className="mt-0.5 w-[58px] flex-none text-[11.5px]"
        style={{ color: "var(--color-text-faint)" }}
      >
        {formatTime(item.created_at)}
      </Mono>

      <span
        className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full"
        style={{
          background: tinted
            ? "color-mix(in oklch, var(--follow-done) 16%, var(--color-surface))"
            : "var(--color-surface-raised)",
          color: tinted ? "var(--follow-done)" : "var(--color-text-muted)",
        }}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] leading-snug" style={{ color: "var(--color-text)" }}>
          {subject ? (
            <span className="font-semibold">{subject}</span>
          ) : null}
          {subject ? <span style={{ color: "var(--color-text-faint)" }}> — </span> : null}
          <span style={{ color: "var(--color-text-secondary)" }}>{action}</span>
        </p>
        {detail ? (
          <p
            className="mt-0.5 text-[12px] leading-snug"
            style={{ color: "var(--color-text-muted)" }}
          >
            {detail}
          </p>
        ) : null}
      </div>
    </div>
  );

  return (
    <li className="border-b last:border-b-0" style={{ borderColor: "var(--color-border-subtle)" }}>
      {item.lead_id ? (
        <Link
          href={`/leads/${item.lead_id}`}
          className="block transition-colors hover:bg-[var(--color-surface-raised)] focus:outline-none focus-visible:bg-[var(--color-surface-raised)]"
        >
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );
}
