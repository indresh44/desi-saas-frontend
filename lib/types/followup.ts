export type FollowUpStatus = "pending" | "done" | "cancelled";

export interface LeadFollowUp {
  id: string;
  leadId: string;
  scheduledAt: string;
  note: string | null;
  status: FollowUpStatus;
  createdBy: string;
  createdAt: string;
  completedAt: string | null;
  // enriched fields returned by /today endpoint:
  leadTitle?: string;
  customerName?: string;
  customerPhone?: string;
}

export interface CreateFollowUpInput {
  lead_id: string;
  scheduled_at: string;
  note?: string;
}

export interface MarkFollowUpDoneInput {
  note?: string;
}

export interface RescheduleFollowUpInput {
  scheduled_at: string;
  note?: string;
}

export interface CancelFollowUpInput {
  note?: string;
}
