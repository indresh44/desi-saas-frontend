import { apiClient } from "@/lib/api/client";
import {
  CreateActivityInput,
  LeadActivity,
  UpdateActivityInput,
} from "@/lib/types/activity";

type LeadActivityApiResponse = {
  id: string;
  lead_id: string;
  // Backend enum is broader than the four user-logged types this surface
  // used to assume — see ActivityType union in lib/types/activity.ts for
  // the full set. Typed loosely here so a backend that adds a new type
  // (e.g. via migration 0042's lead_created / invoice_sent / etc.) doesn't
  // 500 the response parse.
  type: string;
  description: string;
  // NULL since backend 0042 (system actor / pre-enrichment rows).
  created_by: string | null;
  created_at: string;
  actor_type?: "human" | "ai" | "task" | "system" | null;
  payload?: Record<string, unknown> | null;
  chat_session_id?: string | null;
  task_id?: string | null;
};

function toActivityModel(raw: LeadActivityApiResponse): LeadActivity {
  return {
    id: raw.id,
    leadId: raw.lead_id,
    type: raw.type as LeadActivity["type"],
    description: raw.description,
    createdBy: raw.created_by,
    createdAt: raw.created_at,
    actorType: raw.actor_type ?? null,
    payload: raw.payload ?? null,
    chatSessionId: raw.chat_session_id ?? null,
    taskId: raw.task_id ?? null,
  };
}

export async function fetchLeadActivities(
  leadId: string
): Promise<LeadActivity[]> {
  const path = `/api/v1/leads/${leadId}/activities`;

  const result = await apiClient<LeadActivityApiResponse[]>(path, {
    method: "GET",
    cache: "no-store",
  });

  return result.data.map(toActivityModel);
}

export async function createActivity(
  leadId: string,
  input: CreateActivityInput
): Promise<LeadActivity> {
  const path = `/api/v1/leads/${leadId}/activities`;

  const result = await apiClient<LeadActivityApiResponse>(path, {
    method: "POST",
    body: input,
  });

  return toActivityModel(result.data);
}

export async function updateActivity(
  leadId: string,
  activityId: string,
  input: UpdateActivityInput
): Promise<LeadActivity> {
  const path = `/api/v1/leads/${leadId}/activities/${activityId}`;

  const result = await apiClient<LeadActivityApiResponse>(path, {
    method: "PATCH",
    body: input,
  });

  return toActivityModel(result.data);
}
