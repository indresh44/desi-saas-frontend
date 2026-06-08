"use client";

import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { firstName, telHref, whatsappHref } from "@/lib/contact";
import type { Lead } from "@/lib/types/lead";
import type { NextActionType } from "@/lib/types/next-action";
import { FOLLOWUPS, type FollowupKind } from "./tokens";
import { FollowupPill } from "./followup-pill";
import { LedgerButton } from "./button";
import { SourceTag } from "./source-tag";
import { StageBadge } from "./stage-badge";
import { WhatsAppIcon } from "./icons";

/**
 * Desktop enquiries ledger — §7.9.
 *
 * Columns: status edge (4px) · Enquiry · Customer · Source · Stage
 *          · Follow-up · Added · Value · Actions
 *
 * Accepts real `Lead[]` (the type returned by `fetchLeads`). Optional
 * inline grouping — pass `groups` to render group-header rows that span
 * the full table (matches the prototype's `dir-ledger.jsx`).
 *
 * Density variant via `density="compact"` drops row padding to 8px
 * per the spec.
 *
 * Behaviour:
 *   - Row click → navigates to `/leads/{id}` (delegates via Next router).
 *     Override with `onSelect` for a non-routing surface.
 *   - WhatsApp button → calls `onWhatsApp(lead)` if provided, else opens
 *     the wa.me deep link in a new tab.
 *   - Call button → opens the tel: dialer if the customer has a phone.
 */
export function LedgerEnquiryTable({
  leads,
  groups,
  density = "comfortable",
  onSelect,
  onWhatsApp,
  sourceLabel,
  className,
}: {
  /** Flat list — used when `groups` is omitted. */
  leads?: Lead[];
  /** Grouped list — overrides `leads` when provided. */
  groups?: { key: string; label: string; items: Lead[] }[];
  density?: "comfortable" | "compact";
  /** Override the default row click (which routes to `/leads/{id}`). */
  onSelect?: (lead: Lead) => void;
  /** Override the WhatsApp button (e.g. open an in-app chat drawer). */
  onWhatsApp?: (lead: Lead) => void;
  /** Map a raw `lead.source` value to its pretty label. */
  sourceLabel?: (source: string | null) => string | null;
  className?: string;
}) {
  const router = useRouter();
  const rowPadding = density === "compact" ? "8px 16px" : "13px 16px";

  // Resolve the dataset — `groups` wins when present, else fall back to
  // a single anonymous group around `leads`.
  const resolvedGroups: { key: string; label: string; items: Lead[] }[] =
    groups ?? [{ key: "__all__", label: "", items: leads ?? [] }];

  const handleSelect = (lead: Lead) => {
    if (onSelect) {
      onSelect(lead);
      return;
    }
    router.push(`/leads/${lead.id}`);
  };

  return (
    <div
      className={cn("overflow-hidden", className)}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--ledger-radius-control)",
      }}
    >
      <table className="ledger-table w-full" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <Th width={4} />
            <Th>Enquiry</Th>
            <Th>Customer</Th>
            <Th>Source</Th>
            <Th>Stage</Th>
            <Th>Follow-up</Th>
            <Th>Added</Th>
            <Th align="right">Value</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {resolvedGroups.map((group) => (
            <GroupBlock
              key={group.key}
              group={group}
              rowPadding={rowPadding}
              showHeader={group.key !== "__all__"}
              onSelect={handleSelect}
              onWhatsApp={onWhatsApp}
              sourceLabel={sourceLabel}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupBlock({
  group,
  rowPadding,
  showHeader,
  onSelect,
  onWhatsApp,
  sourceLabel,
}: {
  group: { key: string; label: string; items: Lead[] };
  rowPadding: string;
  showHeader: boolean;
  onSelect: (lead: Lead) => void;
  onWhatsApp?: (lead: Lead) => void;
  sourceLabel?: (source: string | null) => string | null;
}) {
  return (
    <>
      {showHeader && (
        <tr>
          <td style={{ width: 4, padding: 0 }} />
          <td
            colSpan={8}
            style={{
              background: "var(--color-surface-raised)",
              padding: "8px 16px",
            }}
          >
            <span className="inline-flex items-center gap-[9px]">
              <span
                className="text-[13px] font-bold tracking-[-0.005em]"
                style={{ color: "var(--color-text)" }}
              >
                {group.label}
              </span>
              <span
                className="ledger-mono text-[12px]"
                style={{ color: "var(--color-text-faint)" }}
              >
                {group.items.length}
              </span>
            </span>
          </td>
        </tr>
      )}
      {group.items.map((lead) => (
        <Row
          key={lead.id}
          lead={lead}
          padding={rowPadding}
          onSelect={onSelect}
          onWhatsApp={onWhatsApp}
          sourceLabel={sourceLabel}
        />
      ))}
    </>
  );
}

function Row({
  lead,
  padding,
  onSelect,
  onWhatsApp,
  sourceLabel,
}: {
  lead: Lead;
  padding: string;
  onSelect: (lead: Lead) => void;
  onWhatsApp?: (lead: Lead) => void;
  sourceLabel?: (source: string | null) => string | null;
}) {
  const followupKind: FollowupKind = lead.nextAction
    ? FOLLOWUP_KIND[lead.nextAction.type]
    : "none";
  const stripeColor = FOLLOWUPS[followupKind].stripe
    ? FOLLOWUPS[followupKind].color
    : "transparent";

  const sourceText = sourceLabel?.(lead.source) ?? lead.source ?? null;
  const addedLabel = formatAddedDate(lead.createdAt);
  const valueLabel = lead.estimatedValue ?? "—";

  const handleCall = () => {
    const tel = telHref(lead.customerPhone);
    if (tel) window.location.href = tel;
  };
  const handleWhatsApp = () => {
    if (onWhatsApp) {
      onWhatsApp(lead);
      return;
    }
    const wa = whatsappHref(
      lead.customerPhone,
      `Hi ${firstName(lead.customerName)}, just following up on ${lead.title}.`,
    );
    if (wa) window.open(wa, "_blank", "noopener,noreferrer");
  };

  return (
    <tr onClick={() => onSelect(lead)} style={{ cursor: "pointer" }}>
      <td style={{ width: 4, padding: 0 }}>
        <div
          aria-hidden
          style={{
            width: 4,
            minHeight: 46,
            height: "100%",
            background: stripeColor,
          }}
        />
      </td>
      <Td padding={padding}>
        <div
          className="text-[14px] font-semibold tracking-[-0.005em]"
          style={{ color: "var(--color-text)" }}
        >
          {lead.title}
        </div>
      </Td>
      <Td padding={padding}>
        <span style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>
          {lead.customerName ?? "Unknown customer"}
        </span>
      </Td>
      <Td padding={padding}>
        <SourceTag source={sourceText} />
      </Td>
      <Td padding={padding}>
        {lead.stageName ? (
          <StageBadge name={lead.stageName} color={lead.stageColor} />
        ) : null}
      </Td>
      <Td padding={padding}>
        {lead.nextAction ? (
          <FollowupPill kind={followupKind} label={lead.nextAction.label || undefined} />
        ) : (
          <FollowupPill kind="none" />
        )}
      </Td>
      <Td padding={padding}>
        {addedLabel ? (
          <span
            className="ledger-mono text-[12.5px]"
            style={{ color: "var(--color-text-faint)" }}
          >
            {addedLabel}
          </span>
        ) : null}
      </Td>
      <Td padding={padding} align="right">
        <span
          className="ledger-mono text-[13.5px] font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          {valueLabel}
        </span>
      </Td>
      <Td padding={padding} align="right">
        <div
          className="flex items-center justify-end gap-2"
          onClick={(ev) => ev.stopPropagation()}
        >
          <LedgerButton
            variant="whatsapp"
            size="icon"
            aria-label="WhatsApp"
            onClick={handleWhatsApp}
            disabled={!lead.customerPhone && !onWhatsApp}
          >
            <WhatsAppIcon size={15} />
          </LedgerButton>
          <LedgerButton
            variant="action"
            size="icon"
            aria-label="Call"
            onClick={handleCall}
            disabled={!lead.customerPhone}
          >
            <Phone className="size-[15px]" strokeWidth={1.8} />
          </LedgerButton>
        </div>
      </Td>
    </tr>
  );
}

const FOLLOWUP_KIND: Record<NextActionType, FollowupKind> = {
  followup_overdue: "overdue",
  followup_due_today: "today",
  no_followup_set: "unset",
  gone_quiet: "quiet",
  followup_upcoming: "scheduled",
  none: "none",
};

function formatAddedDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function Th({
  children,
  align = "left",
  width,
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
  width?: number;
}) {
  return (
    <th
      style={{
        textAlign: align,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "var(--color-text-faint)",
        padding: width === 4 ? 0 : "12px 16px",
        background: "var(--color-surface-raised)",
        borderBottom: "1px solid var(--color-border)",
        width,
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  padding,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  padding: string;
}) {
  return (
    <td
      style={{
        padding,
        textAlign: align,
        verticalAlign: "middle",
        fontSize: 13.5,
      }}
    >
      {children}
    </td>
  );
}
