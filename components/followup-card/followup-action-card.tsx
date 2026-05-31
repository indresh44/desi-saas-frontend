"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  resolveFollowup,
  type ResolveChannel,
  type ResolveFollowupRequest,
  type ResolveFollowupResult,
} from "@/lib/api/resolve-followup";
import type { LeadFollowUp } from "@/lib/types/followup";
import type { Lead } from "@/lib/types/lead";
import type { PipelineStage } from "@/lib/types/pipeline";
import { cn } from "@/lib/utils";

import { OUTCOME_META } from "./outcome-config";
import { OutcomeSheet } from "./outcome-sheet";

// --- Helpers -----------------------------------------------------------

function digitsOnly(phone: string | null): string | null {
  if (!phone) return null;
  const stripped = phone.replace(/\D/g, "");
  return stripped.length >= 8 ? stripped : null;
}

function waLink(phone: string | null): string | null {
  const d = digitsOnly(phone);
  return d ? `https://wa.me/${d}` : null;
}

function telLink(phone: string | null): string | null {
  const d = digitsOnly(phone);
  return d ? `tel:${d}` : null;
}

function shortMoney(value: string | null): string | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n >= 100000) return `₹${(n / 100000).toFixed(n >= 1000000 ? 1 : 2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function relativeTime(iso: string): string {
  const ts = new Date(iso).getTime();
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 24 * 60 * 60_000) return `${Math.floor(diff / (60 * 60_000))}h ago`;
  return new Date(iso).toLocaleDateString();
}

// --- Component ---------------------------------------------------------

export interface FollowupActionCardProps {
  followup: LeadFollowUp;
  lead: Lead;
  stages: PipelineStage[];
  onResolved?: (result: ResolveFollowupResult) => void;
  /** Injects a stub for the resolve POST — used by the demo page at
   * /dev/followup-card to render the resolved-state UI without hitting
   * the API. Production callers leave this undefined. */
  resolveFn?: (
    id: string,
    body: ResolveFollowupRequest,
  ) => Promise<ResolveFollowupResult>;
}

type CardState = "pending" | "awaiting" | "resolved";

interface ResolvedSummary {
  result: ResolveFollowupResult;
  request: ResolveFollowupRequest;
  resolvedAt: string;
}

export function FollowupActionCard({
  followup,
  lead,
  stages,
  onResolved,
  resolveFn,
}: FollowupActionCardProps) {
  const [cardState, setCardState] = useState<CardState>("pending");
  const [lastChannel, setLastChannel] = useState<ResolveChannel>("call");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetChannel, setSheetChannel] = useState<ResolveChannel>("call");
  const [resolved, setResolved] = useState<ResolvedSummary | null>(null);

  const phoneCallHref = useMemo(() => telLink(lead.customerPhone), [lead.customerPhone]);
  const phoneWaHref = useMemo(() => waLink(lead.customerPhone), [lead.customerPhone]);
  const noPhone = !lead.customerPhone;

  function openSheet(channel: ResolveChannel) {
    setSheetChannel(channel);
    setLastChannel(channel);
    setSheetOpen(true);
  }

  function handleCallTap() {
    if (phoneCallHref) window.open(phoneCallHref, "_self");
    setCardState("awaiting");
    setLastChannel("call");
  }

  function handleWaTap() {
    if (phoneWaHref) window.open(phoneWaHref, "_blank", "noopener,noreferrer");
    setCardState("awaiting");
    setLastChannel("whatsapp");
  }

  async function handleSubmit(request: ResolveFollowupRequest) {
    const result = await (resolveFn ?? resolveFollowup)(followup.id, request);
    setResolved({
      result,
      request,
      resolvedAt: new Date().toISOString(),
    });
    setCardState("resolved");
    onResolved?.(result);
  }

  // --- Render -------------------------------------------------------

  return (
    <>
      {cardState === "pending" ? (
        <PendingCard
          followup={followup}
          lead={lead}
          phoneAvailable={!noPhone}
          onCall={handleCallTap}
          onWhatsApp={handleWaTap}
          onDone={() => openSheet(lastChannel)}
        />
      ) : cardState === "awaiting" ? (
        <AwaitingCard
          lead={lead}
          channel={lastChannel}
          onLog={() => openSheet(lastChannel)}
          onCancel={() => setCardState("pending")}
        />
      ) : resolved ? (
        <ResolvedCard
          lead={lead}
          summary={resolved}
        />
      ) : null}

      <OutcomeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        channel={sheetChannel}
        followup={followup}
        lead={lead}
        stages={stages}
        onSubmit={handleSubmit}
        onSwitchChannel={(next) => setSheetChannel(next)}
      />
    </>
  );
}

// --- Card sub-components ----------------------------------------------

function CardShell({
  tone,
  children,
}: {
  tone: "neutral" | "amber" | "teal" | "rose";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-sm transition-colors",
        tone === "neutral" && "border-border bg-card",
        tone === "amber" && "border-amber-200 bg-amber-50",
        tone === "teal" && "border-teal-200 bg-teal-50",
        tone === "rose" && "border-rose-200 bg-rose-50",
      )}
    >
      {children}
    </div>
  );
}

function PendingCard({
  followup,
  lead,
  phoneAvailable,
  onCall,
  onWhatsApp,
  onDone,
}: {
  followup: LeadFollowUp;
  lead: Lead;
  phoneAvailable: boolean;
  onCall: () => void;
  onWhatsApp: () => void;
  onDone: () => void;
}) {
  const value = shortMoney(lead.estimatedValue);
  const attempts = followup.attemptCount ?? 0;
  const nextActionLine = lead.nextAction?.label ?? null;

  return (
    <CardShell tone="neutral">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-foreground">
              {lead.customerName ?? "Unknown customer"}
            </h3>
            {lead.stageName ? (
              <span
                className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground"
                style={lead.stageColor ? { color: lead.stageColor, borderColor: lead.stageColor } : undefined}
              >
                {lead.stageName}
              </span>
            ) : null}
            {value ? (
              <span className="text-xs font-semibold text-muted-foreground">
                {value}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{lead.title}</p>
          {nextActionLine ? (
            <p className="mt-1 text-xs text-muted-foreground">{nextActionLine}</p>
          ) : null}
          {attempts >= 1 ? (
            <span className="mt-2 inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800">
              Called {attempts}× ·{" "}
              {followup.lastOutcome === "busy"
                ? "busy"
                : "no answer"}
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          onClick={onWhatsApp}
          disabled={!phoneAvailable}
          title={phoneAvailable ? undefined : "No phone number on file"}
          className="sm:flex-1"
        >
          <MessageCircle data-icon="inline-start" /> WhatsApp
        </Button>
        <Button
          variant="outline"
          onClick={onCall}
          disabled={!phoneAvailable}
          title={phoneAvailable ? undefined : "No phone number on file"}
          className="sm:flex-1"
        >
          <Phone data-icon="inline-start" /> Call
        </Button>
        <Button onClick={onDone} className="sm:flex-1">
          Done
        </Button>
      </div>
    </CardShell>
  );
}

function AwaitingCard({
  lead,
  channel,
  onLog,
  onCancel,
}: {
  lead: Lead;
  channel: ResolveChannel;
  onLog: () => void;
  onCancel: () => void;
}) {
  return (
    <CardShell tone="amber">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-amber-900">
          {channel === "call" ? "Called" : "Messaged"} {lead.customerName ?? "this lead"} — what happened?
        </h3>
        <p className="text-sm text-amber-800/80">
          Log the outcome and we'll line up the next step.
        </p>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button onClick={onLog} className="sm:flex-1">
          Log outcome
        </Button>
        <Button variant="ghost" onClick={onCancel} className="sm:flex-none">
          Cancel
        </Button>
      </div>
    </CardShell>
  );
}

function ResolvedCard({
  lead,
  summary,
}: {
  lead: Lead;
  summary: ResolvedSummary;
}) {
  const { result, request, resolvedAt } = summary;
  const outcomeMeta = OUTCOME_META[request.outcome];
  const isLost = outcomeMeta.bucket === "terminal" || outcomeMeta.bucket === "wrong_number";
  const tone: "teal" | "rose" = isLost ? "rose" : "teal";

  const resultLine = (() => {
    if (result.nextFollowup) {
      const when = new Date(result.nextFollowup.scheduledAt).toLocaleString();
      return `${outcomeMeta.title} — next follow-up ${when}`;
    }
    if (isLost) return `${outcomeMeta.title} — closed`;
    if (request.set_no_followup) return `${outcomeMeta.title} — done, no next step set`;
    return `${outcomeMeta.title} — rescheduled`;
  })();

  return (
    <CardShell tone={tone}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{outcomeMeta.icon}</span>
          <h3
            className={cn(
              "text-base font-semibold",
              tone === "teal" ? "text-teal-900" : "text-rose-900",
            )}
          >
            {lead.customerName ?? lead.title}
          </h3>
        </div>
        <p
          className={cn(
            "text-sm",
            tone === "teal" ? "text-teal-800/90" : "text-rose-800/90",
          )}
        >
          {resultLine}
        </p>
        <div
          className={cn(
            "rounded-md border px-3 py-2 text-xs",
            tone === "teal"
              ? "border-teal-200 bg-white/60 text-teal-900"
              : "border-rose-200 bg-white/60 text-rose-900",
          )}
        >
          <div>
            {outcomeMeta.icon} <strong>{outcomeMeta.title}</strong> · {relativeTime(resolvedAt)}
          </div>
          {request.note ? (
            <div className="mt-1 italic">&ldquo;{request.note}&rdquo;</div>
          ) : null}
        </div>
        {request.set_no_followup && !isLost ? (
          <p className="text-xs italic text-muted-foreground">
            🛟 No next step set — will resurface if it goes quiet.
          </p>
        ) : null}
      </div>
    </CardShell>
  );
}
