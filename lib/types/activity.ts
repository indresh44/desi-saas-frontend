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
  | "invoice_sent"           // 0042 new
  | "invoice_approved"
  | "invoice_cancelled"      // 0042 new
  | "invoice_adjusted"       // 0042 new
  | "payment_recorded"
  | "payment_edited"
  | "payment_voided"
  | "payment_moved"
  | "lead_created"           // 0042 new
  | "lead_updated";          // 0042 new

export type ActorType = "human" | "ai" | "task" | "system";

export interface LeadActivity {
  id: string;
  leadId: string;
  type: ActivityType;
  description: string;
  // NULL since 0042 — SYSTEM-actor activities (e.g. WhatsApp webhook)
  // have no real user; previously these were misattributed to a random
  // business user. NULL is the honest answer.
  createdBy: string | null;
  createdAt: string;
  // 0042 — diary fields. NULL on pre-enrichment rows; populated for new
  // writes via the backend's central create_lead_activity chokepoint.
  actorType?: ActorType | null;
  payload?: Record<string, unknown> | null;
  chatSessionId?: string | null;
  taskId?: string | null;
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
  invoice_sent: "Invoice sent",
  invoice_approved: "Invoice approved",
  invoice_cancelled: "Invoice cancelled",
  invoice_adjusted: "Invoice adjusted",
  payment_recorded: "Payment",
  payment_edited: "Payment edited",
  payment_voided: "Payment voided",
  payment_moved: "Payment moved",
  lead_created: "Lead created",
  lead_updated: "Lead updated",
};

export interface UpdateActivityInput {
  type?: ActivityType;
  description?: string;
}
