export type MeetingStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export interface MeetingApiResponse {
  id: string;
  business_id: string;
  customer_id: string;
  lead_id: string | null;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  status: MeetingStatus;
  notes: string | null;
  gcal_event_id: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  lead_title: string | null;
}

export interface Meeting {
  id: string;
  businessId: string;
  customerId: string;
  leadId: string | null;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  status: MeetingStatus;
  notes: string | null;
  gcalEventId: string | null;
  createdAt: string;
  updatedAt: string;
  customerName: string | null;
  customerPhone: string | null;
  leadTitle: string | null;
}

export interface MeetingListApiResponse {
  items: MeetingApiResponse[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateMeetingInput {
  customer_id: string;
  lead_id?: string | null;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  notes?: string | null;
}

export interface UpdateMeetingInput {
  title?: string;
  customer_id?: string;
  lead_id?: string | null;
  scheduled_at?: string;
  duration_minutes?: number;
  status?: MeetingStatus;
  notes?: string | null;
}

export function toMeetingModel(raw: MeetingApiResponse): Meeting {
  return {
    id: raw.id,
    businessId: raw.business_id,
    customerId: raw.customer_id,
    leadId: raw.lead_id,
    title: raw.title,
    scheduledAt: raw.scheduled_at,
    durationMinutes: raw.duration_minutes,
    status: raw.status,
    notes: raw.notes,
    gcalEventId: raw.gcal_event_id,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    customerName: raw.customer_name,
    customerPhone: raw.customer_phone,
    leadTitle: raw.lead_title,
  };
}
