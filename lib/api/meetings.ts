import { apiClient } from "./client";
import { API_ENDPOINTS } from "../constants/api";
import {
  CreateMeetingInput,
  Meeting,
  MeetingApiResponse,
  MeetingListApiResponse,
  UpdateMeetingInput,
  toMeetingModel,
} from "../types/meeting";

function withQuery(base: string, params: Record<string, string | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value!)}`)
    .join("&");
  return qs ? `${base}?${qs}` : base;
}

export async function fetchMeetings(
  filters?: {
    customer_id?: string;
    lead_id?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ meetings: Meeting[]; total: number }> {
  const path = withQuery(API_ENDPOINTS.meetings, {
    customer_id: filters?.customer_id,
    lead_id: filters?.lead_id,
    status: filters?.status,
    from_date: filters?.from_date,
    to_date: filters?.to_date,
    limit: filters?.limit?.toString(),
    offset: filters?.offset?.toString(),
  });

  const { data } = await apiClient<MeetingListApiResponse>(path);

  return {
    meetings: data.items.map(toMeetingModel),
    total: data.total,
  };
}

export async function createMeeting(
  input: CreateMeetingInput
): Promise<Meeting> {
  const { data } = await apiClient<MeetingApiResponse>(API_ENDPOINTS.meetings, {
    method: "POST",
    body: input,
  });

  return toMeetingModel(data);
}

export async function updateMeeting(
  meetingId: string,
  input: UpdateMeetingInput
): Promise<Meeting> {
  const { data } = await apiClient<MeetingApiResponse>(`${API_ENDPOINTS.meetings}/${meetingId}`, {
    method: "PATCH",
    body: input,
  });

  return toMeetingModel(data);
}

export async function deleteMeeting(
  meetingId: string
): Promise<void> {
  await apiClient<null>(`${API_ENDPOINTS.meetings}/${meetingId}`, {
    method: "DELETE",
  });
}
