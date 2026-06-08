export interface OverdueInvoiceSummary {
  invoice_id: string;
  lead_id: string | null;
  invoice_number: string;
  customer_name: string | null;
  customer_phone: string | null;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  due_date: string;
  days_overdue: number;
}

export interface DashboardPaymentSummary {
  collections_this_month: number;
  collections_last_month: number;
  total_outstanding: number;
  outstanding_invoice_count: number;
  overdue_invoices: OverdueInvoiceSummary[];
}

// ---------------------------------------------------------------------------
// Assistant-tasks dashboard section
// ---------------------------------------------------------------------------

export type AssistantTaskStatus =
  | "queued"
  | "running"
  | "awaiting_approval"
  | "done"
  | "failed";

export interface AssistantTaskSummary {
  id: string;
  session_id: string;       // routes the carousel's confirm/cancel
  batch_id: string;
  sequence_index: number;
  description: string;
  status: AssistantTaskStatus;
  created_at: string;
  updated_at: string;

  // Populated for awaiting-approval rows whose result.kind === "awaiting_confirm".
  // NULL for ask_user / running / done / failed — the carousel keys on
  // prepared_action_id presence to choose between the normal render and the
  // "open in chat" fallback.
  prepared_action_id: string | null;
  preview: string | null;
  editable_fields: string[];

  // For terminal rows: a short user-facing blurb. result_kind mirrors
  // task.result.kind without making the frontend peek into JSONB.
  result_kind: string | null;
  answer: string | null;
  error_message: string | null;

  // ---- Dashboard presentation fields (Phase-1 polish) ----
  // Server-derived. The frontend renders an expandable row keyed on
  // these — see `recently-done-row.tsx`.
  notable: boolean;
  icon: AssistantTaskIcon;
  short_label: string;
}

export type AssistantTaskIcon =
  | "payment"
  | "followup"
  | "invoice"
  | "lead"
  | "customer"
  | "catalog"
  | "write"
  | "read";

export interface AssistantTasksResponse {
  running: AssistantTaskSummary[];
  awaiting_approval: AssistantTaskSummary[];
  // Tasks paused on an ask_user question (status='awaiting_approval' +
  // pending_action_id=NULL in the DB; the backend splits them out of
  // awaiting_approval since they need a question answered, not a
  // write approved). Default to [] for forward-compat with older
  // backends that don't return this field.
  needs_input?: AssistantTaskSummary[];
  recently_done: AssistantTaskSummary[];
}
