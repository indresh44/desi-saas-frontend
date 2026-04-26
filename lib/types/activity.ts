export type ActivityType =
  | "call"
  | "whatsapp"
  | "meeting"
  | "note"
  | "status_change"
  | "followup_scheduled"
  | "followup_rescheduled"
  | "followup_completed"
  | "followup_cancelled"
  | "invoice_created"
  | "invoice_approved"
  | "payment_recorded"
  | "payment_edited"
  | "payment_voided"
  | "payment_moved";

export interface LeadActivity {
  id: string;
  leadId: string;
  type: ActivityType;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateActivityInput {
  lead_id: string;
  type: ActivityType;
  description: string;
}
