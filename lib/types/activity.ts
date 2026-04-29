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
  type: ActivityType;
  description: string;
}

export type EditableActivityType =
  | "call"
  | "whatsapp"
  | "meeting"
  | "note";

export const EDITABLE_ACTIVITY_TYPES: ReadonlySet<ActivityType> = new Set<ActivityType>([
  "call",
  "whatsapp",
  "meeting",
  "note",
]);

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  call: "Call",
  whatsapp: "WhatsApp",
  meeting: "Meeting",
  note: "Note",
  status_change: "Stage moved",
  followup_scheduled: "Follow-up scheduled",
  followup_rescheduled: "Follow-up rescheduled",
  followup_completed: "Follow-up done",
  followup_cancelled: "Follow-up cancelled",
  invoice_created: "Invoice created",
  invoice_approved: "Invoice approved",
  payment_recorded: "Payment",
  payment_edited: "Payment edited",
  payment_voided: "Payment voided",
  payment_moved: "Payment moved",
};

export interface UpdateActivityInput {
  type?: ActivityType;
  description?: string;
}
