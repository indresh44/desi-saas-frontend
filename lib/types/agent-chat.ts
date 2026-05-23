/**
 * Wire types for the /api/v1/agent-chat surface.
 *
 * One uniform assistant envelope is returned from /message, /confirm, and
 * /cancel — `kind` drives the renderer. Keep these in lockstep with
 * crm-saas-backend/app/api/v1/agent_chat.py.
 */

export type AgentChatKind =
  | "text"
  | "done"
  | "ask_user"
  | "awaiting_confirm"
  | "commit_result"
  | "cancelled"
  | "error"
  | "exhausted";

export interface AgentChatTurnDetail {
  turn: number;
  thought: string;
  action: Record<string, unknown>;
  observation_summary: string;
}

export interface AgentChatTokens {
  turns: number;
  total_input_tokens: number;
  total_output_tokens: number;
  // per_turn / by_model are present but loosely shaped — render as JSON.
  [key: string]: unknown;
}

/** Server message row, exactly as returned by GET /sessions/{id}. */
export interface AgentChatMessage {
  id: string;
  role: "user" | "assistant";
  kind: AgentChatKind;
  content: string | null;
  payload: Record<string, unknown> | null;
  turn_detail: AgentChatTurnDetail[] | null;
  tokens: AgentChatTokens | null;
  created_at: string;
}

/** Envelope returned from /message, /confirm, /cancel. Shape-equivalent to
 *  AgentChatMessage + session_id + awaiting_action_id. */
export interface AgentChatEnvelope {
  session_id: string;
  message_id: string;
  kind: AgentChatKind;
  content: string | null;
  payload: Record<string, unknown>;
  turn_detail: AgentChatTurnDetail[];
  tokens: AgentChatTokens | null;
  created_at: string;
  awaiting_action_id: string | null;
}

export interface AgentChatSessionSummary {
  id: string;
  title: string | null;
  updated_at: string;
  awaiting_action_id: string | null;
}

export interface AgentChatSessionDetail {
  id: string;
  title: string | null;
  awaiting_action_id: string | null;
  updated_at: string;
  messages: AgentChatMessage[];
}

// --- payload shapes per kind (best-effort; payload is loosely typed on the
// wire, narrow at the use site rather than forcing a discriminated union here)

export interface AwaitingConfirmPayload {
  prepared_action_id: string;
  preview: string;
  editable_fields: string[];
}

export interface CommitResultPayload {
  prepared_action_id: string;
  capability: string;
  commit_result: Record<string, unknown>;
}

export interface ErrorPayload {
  error: { code?: string; message?: string; [k: string]: unknown };
}
