import { apiClient } from "@/lib/api/client";
import {
  CreateActivityInput,
  LeadActivity,
  UpdateActivityInput,
} from "@/lib/types/activity";

type LeadActivityApiResponse = {
  id: string;
  lead_id: string;
  type: "call" | "whatsapp" | "meeting" | "note" | "status_change";
  description: string;
  created_by: string;
  created_at: string;
};

function toActivityModel(raw: LeadActivityApiResponse): LeadActivity {
  return {
    id: raw.id,
    leadId: raw.lead_id,
    type: raw.type,
    description: raw.description,
    createdBy: raw.created_by,
    createdAt: raw.created_at,
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
