// Mirror of the backend cascade enum (`app/models/lead.py:NextActionType`).
// Keep these strings in sync — the backend emits these values as `type`.
export type NextActionType =
  | "followup_overdue"
  | "followup_due_today"
  | "no_followup_set"
  | "gone_quiet"
  | "followup_upcoming"
  | "none";

// The 4 cascade types that appear on the dashboard "needs attention" list.
// Matches the backend's `HOME_NEEDS_ACTION_TYPES` set. UPCOMING and NONE are
// excluded by design — the home is for "what should I do today", not the
// full pipeline.
export const HOME_NEEDS_ACTION_TYPES: NextActionType[] = [
  "followup_overdue",
  "followup_due_today",
  "no_followup_set",
  "gone_quiet",
];

export interface NextActionSummary {
  type: NextActionType;
  label: string;          // server-rendered, e.g. "Follow up — 3 days late"
  urgency_rank: number;   // 1 = most urgent, 6 = least
  relevant_date: string | null; // ISO 8601 or null
}

// API response shape for `GET /api/v1/dashboard/leads-needing-action`.
// `items` is sorted urgent-first; `total` is the full count across all
// action types (1-4) so the UI can render "+X more". `counts_by_type`
// always has all four action keys present (zero-fill server-side) so
// rendering is branch-free.
export interface LeadsNeedingActionApiResponse {
  items: LeadApiItemWithNextAction[];
  total: number;
  counts_by_type: Record<NextActionType, number>;
}

// Slightly extended `LeadApiResponseItem` — the only difference is the
// optional `next_action` plus `open_followup` for the dashboard list.
// We keep the existing `LeadApiResponseItem` declaration in
// `lib/types/lead.ts` untouched (it's used by many other endpoints) and
// re-export a widened variant here for the dashboard.
export interface OpenFollowupApi {
  id: string;
  lead_id: string;
  scheduled_at: string;
  note: string | null;
  status: "pending" | "done" | "cancelled";
  created_by: string;
  created_at: string;
  completed_at: string | null;
  attempt_count: number;
  last_outcome: string | null;
}

export interface LeadApiItemWithNextAction {
  customer_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  stage_id: string;
  stage_name: string | null;
  stage_color: string | null;
  title: string;
  source: string | null;
  service_date: string | null;
  estimated_value: string | null;
  assigned_to: string | null;
  notes: string | null;
  business_id: string;
  id: string;
  created_at: string;
  updated_at: string;
  next_action: NextActionSummary | null;
  // 0044 — bulk-stitched on the dashboard endpoint. `null` for items
  // whose cascade type is NO_FOLLOWUP_SET (no pending exists by
  // definition) or GONE_QUIET-without-pending.
  open_followup?: OpenFollowupApi | null;
}

// ---------------------------------------------------------------------------
// Per-lead context bundle (GET /api/v1/leads/{id}/context)
// ---------------------------------------------------------------------------

export type LeadContextFollowupStatus = "pending" | "done" | "cancelled";

export interface LeadContextFollowupApi {
  id: string;
  scheduled_at: string;
  note: string | null;
  status: LeadContextFollowupStatus;
  completed_at: string | null;
}

export interface LeadContextActivityApi {
  id: string;
  created_at: string;
  type: "call" | "whatsapp" | "meeting" | "note";
  description: string;
}

export interface LeadContextApiResponse {
  enquiry_note: string | null;
  ai_summary: string | null;
  recent_followups: LeadContextFollowupApi[];
  recent_activity: LeadContextActivityApi[];
}

// Camel-cased frontend model — same fields, JS-idiomatic naming.
export interface LeadContextFollowup {
  id: string;
  scheduledAt: string;
  note: string | null;
  status: LeadContextFollowupStatus;
  completedAt: string | null;
}

export interface LeadContextActivity {
  id: string;
  createdAt: string;
  type: "call" | "whatsapp" | "meeting" | "note";
  description: string;
}

export interface LeadContext {
  enquiryNote: string | null;
  aiSummary: string | null;
  recentFollowups: LeadContextFollowup[];
  recentActivity: LeadContextActivity[];
}
