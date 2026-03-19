import { apiClient } from "@/lib/api/client";
import { DEFAULT_USER_ID } from "@/lib/constants/api";
import { CreateActivityInput, LeadActivity } from "@/lib/types/activity";

type LeadActivityApiResponse = {
  id: string;
  lead_id: string;
  type: "call" | "whatsapp" | "meeting" | "note" | "status_change";
  description: string;
  created_by: string;
  created_at: string;
};

function getUserHeader(userId: string) {
  return { "X-User-Id": userId || DEFAULT_USER_ID };
}

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
  leadId: string,
  userId = DEFAULT_USER_ID
): Promise<LeadActivity[]> {
  const path = `/api/v1/leads/${leadId}/activities`;

  const result = await apiClient<LeadActivityApiResponse[]>(path, {
    method: "GET",
    headers: getUserHeader(userId),
    cache: "no-store",
  });

  return result.data.map(toActivityModel);
}

export async function createActivity(
  input: CreateActivityInput,
  userId = DEFAULT_USER_ID
): Promise<LeadActivity> {
  const path = `/api/v1/leads/${input.lead_id}/activities`;

  const result = await apiClient<LeadActivityApiResponse>(path, {
    method: "POST",
    headers: getUserHeader(userId),
    body: input,
  });

  return toActivityModel(result.data);
}
