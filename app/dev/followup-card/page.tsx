"use client";

import { useState } from "react";

import { FollowupActionCard } from "@/components/followup-card/followup-action-card";
import type {
  ResolveFollowupRequest,
  ResolveFollowupResult,
} from "@/lib/api/resolve-followup";
import type { LeadFollowUp } from "@/lib/types/followup";
import type { Lead } from "@/lib/types/lead";
import type { PipelineStage } from "@/lib/types/pipeline";

// --- Mock data (mirrors the interior_designer persona pipeline) -----

const STAGES: PipelineStage[] = [
  { id: "stage-new", pipelineId: "p1", name: "New Enquiry", position: 1, color: "#6366f1" },
  { id: "stage-interested", pipelineId: "p1", name: "Interested", position: 2, color: "#f59e0b" },
  { id: "stage-visit", pipelineId: "p1", name: "Site Visit Scheduled", position: 3, color: "#8b5cf6" },
  { id: "stage-wip", pipelineId: "p1", name: "WIP", position: 4, color: "#3b82f6" },
  { id: "stage-done", pipelineId: "p1", name: "Completed", position: 5, color: "#10b981" },
  { id: "stage-lost", pipelineId: "p1", name: "Lost", position: 6, color: "#ef4444" },
];

function mkLead(overrides: Partial<Lead>): Lead {
  return {
    id: "lead-1",
    businessId: "biz-1",
    customerId: "cust-1",
    customerName: "Rajesh Kumar",
    customerPhone: "+91 90000 00000",
    stageId: "stage-new",
    stageName: "New Enquiry",
    stageColor: "#6366f1",
    title: "3BHK modular kitchen — Sector 47",
    source: "whatsapp",
    serviceDate: null,
    estimatedValue: "250000",
    assignedTo: null,
    notes: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    nextAction: {
      type: "followup_due_today",
      label: "Follow up today — last spoke 5 days ago",
      urgency_rank: 2,
      relevant_date: new Date().toISOString(),
    },
    requirementSummary: null,
    activitySummary: null,
    demandTags: [],
    ...overrides,
  };
}

function mkFollowup(overrides: Partial<LeadFollowUp>): LeadFollowUp {
  return {
    id: "fup-1",
    leadId: "lead-1",
    scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    note: null,
    status: "pending",
    createdBy: "user-1",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    attemptCount: 0,
    lastOutcome: null,
    negativeAttempts: null,
    ...overrides,
  };
}

// Mock resolveFn — echoes a plausible response so the resolved card renders
// without hitting the backend. It honours set_no_followup / stage_to so the
// resolved state text reads correctly.
function mockResolve(stages: PipelineStage[]) {
  return async function (
    _id: string,
    body: ResolveFollowupRequest,
  ): Promise<ResolveFollowupResult> {
    await new Promise((r) => setTimeout(r, 350));
    const lead = mkLead({});
    const stage = body.stage_to
      ? stages.find((s) => s.name.toLowerCase() === body.stage_to?.toLowerCase())
      : undefined;
    const nextFollowup: LeadFollowUp | null =
      body.set_no_followup || !body.next_dt
        ? null
        : mkFollowup({
            id: "fup-next",
            scheduledAt: body.next_dt,
            status: "pending",
            attemptCount: 0,
          });
    // Mirror the backend: retry "just log" / reschedule and WhatsApp
    // "wait for reply" / check-in keep the follow-up open (pending); only
    // positive / terminal / mark-lost complete it.
    const keepsOpen =
      (["no_answer", "busy", "wa_not_replied"].includes(body.outcome) &&
        !body.stage_to) ||
      body.outcome === "wa_sent";
    return {
      followup: mkFollowup({
        status: keepsOpen ? "pending" : "done",
        completedAt: keepsOpen ? null : new Date().toISOString(),
        lastOutcome: body.outcome,
      }),
      lead: stage
        ? { ...lead, stageId: stage.id, stageName: stage.name, stageColor: stage.color }
        : lead,
      nextFollowup,
      activitiesCreated: stage ? 2 : 1,
    };
  };
}

// --- Scenarios ----------------------------------------------------------

const SCENARIOS = [
  {
    key: "new-enquiry-fresh",
    title: "New Enquiry · fresh follow-up",
    description:
      'Lead is in the FIRST pipeline stage. Positive outcome should pre-select "Interested" (triage), not "Site Visit Scheduled".',
    lead: mkLead({}),
    followup: mkFollowup({ note: "Send revised quote — 3 modular options" }),
  },
  {
    key: "new-enquiry-2x-attempts",
    title: "New Enquiry · prior negatives (No answer ×2 · Busy ×1)",
    description:
      "Pending card should show one tally chip per type ('↻ No answer ×2', '↻ Busy ×1'). The sheet header repeats them as 'Earlier attempts'.",
    lead: mkLead({}),
    followup: mkFollowup({
      attemptCount: 3,
      lastOutcome: "no_answer",
      negativeAttempts: { no_answer: 2, busy: 1, wa_not_replied: 0, total: 3 },
    }),
  },
  {
    key: "retry-flow",
    title: "Retry flow — picking 'No answer'",
    description:
      "'No answer' (retry) should default to [Reschedule] with date chips + Regarding, and offer [Mark lost] (forces Lost).",
    lead: mkLead({}),
    followup: mkFollowup({
      attemptCount: 1,
      lastOutcome: "no_answer",
      negativeAttempts: { no_answer: 1, busy: 0, wa_not_replied: 0, total: 1 },
    }),
  },
  {
    key: "mid-pipeline",
    title: "Mid-pipeline · 'Site Visit Scheduled'",
    description:
      "Active stage → Call chips show 'Spoke' (not 'Interested'). A positive outcome pre-selects the next stage ('WIP'), changeable.",
    lead: mkLead({
      stageId: "stage-visit",
      stageName: "Site Visit Scheduled",
      stageColor: "#8b5cf6",
      customerName: "Anjali Verma",
      title: "Living room makeover — 2BHK",
      estimatedValue: "120000",
    }),
    followup: mkFollowup({ id: "fup-2", leadId: "lead-2" }),
  },
  {
    key: "awaiting-reply",
    title: "WhatsApp · awaiting reply (holding state)",
    description:
      "Follow-up already flagged 'sent · awaiting reply'. The card shows an 'Awaiting reply' button; tapping opens the WhatsApp sheet WITHOUT the 'Sent · awaiting reply' chip (log the resolution).",
    lead: mkLead({}),
    followup: mkFollowup({
      lastOutcome: "wa_sent",
      note: "Sent intro + portfolio link",
    }),
  },
  {
    key: "no-phone",
    title: "Lead without a phone number",
    description: "WhatsApp + Call buttons must be disabled with a hover tooltip.",
    lead: mkLead({ customerPhone: null, customerName: "Neha (no phone)" }),
    followup: mkFollowup({ id: "fup-3" }),
  },
] as const;

export default function FollowupCardDemoPage() {
  const [resetCounter, setResetCounter] = useState(0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          /dev — internal preview
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">
          FollowupActionCard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mock data. Submissions are stubbed so the resolved-state UI renders
          without hitting the API. Resize the window to verify the mobile
          bottom-sheet vs. desktop centered-modal behaviour.
        </p>
        <button
          type="button"
          onClick={() => setResetCounter((n) => n + 1)}
          className="mt-3 inline-flex items-center text-sm text-primary hover:underline"
        >
          ↻ Reset all cards
        </button>
      </header>

      <div className="space-y-6">
        {SCENARIOS.map((scenario) => (
          <section key={scenario.key + resetCounter} className="space-y-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {scenario.title}
              </h2>
              <p className="text-xs text-muted-foreground">{scenario.description}</p>
            </div>
            <FollowupActionCard
              followup={scenario.followup}
              lead={scenario.lead}
              stages={STAGES}
              resolveFn={mockResolve(STAGES)}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
