import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type { Lead, LeadApiResponseItem } from "@/lib/types/lead";
import type { LeadFollowUp } from "@/lib/types/followup";

// Outcome enum mirrors the backend `Outcome` str-Enum (app/models/enums.py).
// Keep in sync — backend Pydantic Literal validation will 422 on drift.
export type Outcome =
  | "no_answer"
  | "busy"
  | "wrong_number"
  | "spoke_interested"
  | "spoke_later"
  | "spoke_not_interested"
  | "wa_sent"
  | "wa_replied"
  | "wa_later"
  | "wa_no_number";

export type ResolveChannel = "call" | "whatsapp";

export interface ResolveFollowupRequest {
  channel: ResolveChannel;
  outcome: Outcome;
  note?: string | null;
  next_dt?: string | null; // ISO 8601
  stage_to?: string | null;
  set_no_followup?: boolean;
}

export interface ResolveFollowupResult {
  followup: LeadFollowUp;
  lead: Lead;
  nextFollowup: LeadFollowUp | null;
  activitiesCreated: number;
}

type FollowupApi = {
  id: string;
  lead_id: string;
  scheduled_at: string;
  note: string | null;
  status: "pending" | "done" | "cancelled";
  created_by: string;
  created_at: string;
  completed_at: string | null;
  attempt_count?: number;
  last_outcome?: string | null;
};

type ResolveApiResponse = {
  followup: FollowupApi;
  lead: LeadApiResponseItem;
  next_followup: FollowupApi | null;
  activities_created: number;
};

function toFollowupModel(raw: FollowupApi): LeadFollowUp {
  return {
    id: raw.id,
    leadId: raw.lead_id,
    scheduledAt: raw.scheduled_at,
    note: raw.note,
    status: raw.status,
    createdBy: raw.created_by,
    createdAt: raw.created_at,
    completedAt: raw.completed_at,
    attemptCount: raw.attempt_count ?? 0,
    lastOutcome: raw.last_outcome ?? null,
  };
}

function toLeadModel(raw: LeadApiResponseItem): Lead {
  return {
    customerId: raw.customer_id,
    customerName: raw.customer_name,
    customerPhone: raw.customer_phone,
    stageId: raw.stage_id,
    stageName: raw.stage_name,
    stageColor: raw.stage_color,
    title: raw.title,
    source: raw.source,
    serviceDate: raw.service_date,
    estimatedValue: raw.estimated_value,
    assignedTo: raw.assigned_to,
    notes: raw.notes,
    businessId: raw.business_id,
    id: raw.id,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    nextAction: raw.next_action ?? null,
    requirementSummary: raw.requirement_summary ?? null,
    activitySummary: raw.activity_summary ?? null,
    demandTags: (raw.demand_tags ?? []).map((t) => ({
      id: t.id,
      name: t.name,
    })),
  };
}

export async function resolveFollowup(
  followupId: string,
  body: ResolveFollowupRequest,
): Promise<ResolveFollowupResult> {
  const result = await apiClient<ResolveApiResponse>(
    API_ENDPOINTS.leadFollowUpResolve(followupId),
    { method: "POST", body },
  );

  return {
    followup: toFollowupModel(result.data.followup),
    lead: toLeadModel(result.data.lead),
    nextFollowup: result.data.next_followup
      ? toFollowupModel(result.data.next_followup)
      : null,
    activitiesCreated: result.data.activities_created,
  };
}
