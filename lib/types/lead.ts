import type { LeadFollowUp } from "@/lib/types/followup";
import type { NextActionSummary } from "@/lib/types/next-action";

export type DemandTagApiItem = {
  id: string;
  // Server-side canonical form: lowercase, trimmed, whitespace-collapsed.
  // The UI Title Cases at render time — never mutate the stored value.
  name: string;
};

export type LeadApiResponseItem = {
  customer_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  stage_id: string;
  stage_name: string | null;
  stage_color: string | null;
  title: string;
  source: string | null;
  service_date: string | null;
  estimated_value: string | null;
  assigned_to: string | null;
  notes: string | null;
  business_id: string;
  id: string;
  created_at: string;
  updated_at: string;
  // Backend started returning this from `GET /leads` and
  // `GET /leads/{id}` after the next-action cascade shipped. Optional
  // here so older deploys / responses without it don't break the parser.
  next_action?: NextActionSummary | null;
  // 0045 — per-enquiry computed intelligence. All three are optional so
  // pre-0045 deploys keep parsing. Each renders independently and hides
  // when null / empty.
  requirement_summary?: string | null;
  activity_summary?: string | null;
  demand_tags?: DemandTagApiItem[] | null;
};

export type DemandTag = {
  id: string;
  // Stored canonical form: lowercase. Title-case at render time only.
  name: string;
};

export type Lead = {
  customerId: string;
  customerName: string | null;
  customerPhone: string | null;
  stageId: string;
  stageName: string | null;
  stageColor: string | null;
  title: string;
  source: string | null;
  serviceDate: string | null;
  estimatedValue: string | null;
  assignedTo: string | null;
  notes: string | null;
  businessId: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  // Per-lead next action computed server-side. NULL when the backend
  // didn't provide one (older deploy, or terminal lead's NONE branch
  // collapses to null on the frontend side — see `toLeadModel`).
  nextAction: NextActionSummary | null;
  // 0044 — populated only by the dashboard's leads-needing-action endpoint
  // (which bulk-stitches the lead's earliest pending follow-up). Other
  // endpoints leave this undefined; consumers must treat undefined and
  // null as equivalent ("no open follow-up").
  openFollowup?: LeadFollowUp | null;
  // 0045 — per-enquiry computed intelligence. The two summaries are
  // static text from background LLM jobs (absolute dates only — render
  // verbatim, never re-relativise). `demandTags` is always an array
  // (empty when the lead has no tags), so callers can skip null checks.
  requirementSummary: string | null;
  activitySummary: string | null;
  demandTags: DemandTag[];
};

export type CreateLeadInput = {
  customerId: string;
  stageId: string;
  title: string;
  source?: string | null;
  serviceDate?: string | null;
  estimatedValue?: string | null;
  assignedTo?: string | null;
  notes?: string | null;
  businessId: string;
};