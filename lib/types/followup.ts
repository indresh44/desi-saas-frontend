export type FollowUpStatus = "pending" | "done" | "cancelled";

/** Per-type tally of the current consecutive retry-negative streak, derived
 *  server-side from the activity log (resets on any positive outcome). Drives
 *  the per-type attempt chips on the card and the sheet's "Earlier attempts"
 *  header. Keys mirror the backend retry outcomes. */
export interface NegativeAttempts {
  no_answer: number;
  busy: number;
  wa_not_replied: number;
  total: number;
}

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
  /** Derived retry tally; null/undefined when not computed by the endpoint. */
  negativeAttempts?: NegativeAttempts | null;
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
