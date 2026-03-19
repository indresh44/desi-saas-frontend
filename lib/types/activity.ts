export type ActivityType = "call" | "whatsapp" | "meeting" | "note" | "status_change";

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
