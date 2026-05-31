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
  // 0044 — outcome tracking fields. attemptCount drives the "Called Nx"
  // red badge on the action card; lastOutcome is rendered as the
  // subtitle ("Last attempt: no answer").
  attemptCount: number;
  lastOutcome: string | null;
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
