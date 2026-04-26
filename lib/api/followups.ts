import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import {
  CancelFollowUpInput,
  CreateFollowUpInput,
  LeadFollowUp,
  MarkFollowUpDoneInput,
  RescheduleFollowUpInput,
} from "@/lib/types/followup";

type LeadFollowUpApiResponse = {
  id: string;
  lead_id: string;
  scheduled_at: string;
  note: string | null;
  status: "pending" | "done" | "cancelled";
  created_by: string;
  created_at: string;
  completed_at: string | null;
  lead_title?: string;
  customer_name?: string;
  customer_phone?: string;
};

function withQuery(path: string, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

function toFollowUpModel(raw: LeadFollowUpApiResponse): LeadFollowUp {
  return {
    id: raw.id,
    leadId: raw.lead_id,
    scheduledAt: raw.scheduled_at,
    note: raw.note,
    status: raw.status,
    createdBy: raw.created_by,
    createdAt: raw.created_at,
    completedAt: raw.completed_at,
    leadTitle: raw.lead_title,
    customerName: raw.customer_name,
    customerPhone: raw.customer_phone,
  };
}

export async function fetchTodaysFollowUps(): Promise<LeadFollowUp[]> {
  const result = await apiClient<LeadFollowUpApiResponse[]>(
    API_ENDPOINTS.leadFollowUpsToday,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  return result.data.map(toFollowUpModel);
}

export async function fetchLeadFollowUps(
  leadId: string
): Promise<LeadFollowUp[]> {
  const path = withQuery(API_ENDPOINTS.leadFollowUps, { lead_id: leadId });

  const result = await apiClient<LeadFollowUpApiResponse[]>(path, {
    method: "GET",
    cache: "no-store",
  });

  return result.data.map(toFollowUpModel);
}

export async function createFollowUp(
  input: CreateFollowUpInput
): Promise<LeadFollowUp> {
  const result = await apiClient<LeadFollowUpApiResponse>(
    API_ENDPOINTS.leadFollowUps,
    {
      method: "POST",
      body: input,
    }
  );

  return toFollowUpModel(result.data);
}

export async function markFollowUpDone(
  id: string,
  input: MarkFollowUpDoneInput
): Promise<LeadFollowUp> {
  const result = await apiClient<LeadFollowUpApiResponse>(
    `${API_ENDPOINTS.leadFollowUps}/${id}/done`,
    {
      method: "PATCH",
      body: input,
    }
  );

  return toFollowUpModel(result.data);
}

export async function rescheduleFollowUp(
  id: string,
  input: RescheduleFollowUpInput
): Promise<LeadFollowUp> {
  const result = await apiClient<LeadFollowUpApiResponse>(
    `${API_ENDPOINTS.leadFollowUps}/${id}/reschedule`,
    {
      method: "PATCH",
      body: input,
    }
  );

  return toFollowUpModel(result.data);
}

export async function cancelFollowUp(
  id: string,
  input: CancelFollowUpInput
): Promise<LeadFollowUp> {
  const result = await apiClient<LeadFollowUpApiResponse>(
    `${API_ENDPOINTS.leadFollowUps}/${id}/cancel`,
    {
      method: "PATCH",
      body: input,
    }
  );

  return toFollowUpModel(result.data);
}
