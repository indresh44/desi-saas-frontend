export interface ChatThread {
  thread_id: number;
  context_type: "dashboard" | "customer" | "lead" | "global";
  context_id: string | null;
}

export interface ChatAction {
  action_type: string;
  display_label: string;
  prefilled_data: Record<string, unknown>;
  form_name?: string | null;
  status: "pending" | "confirmed" | "cancelled";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: ChatAction | null;
  suggestions?: string[];
  timestamp: Date;
}

export interface ChatMessageRequest {
  message: string;
  context_type: "dashboard" | "customer" | "lead" | "global";
  context_id?: string | null;
  thread_id?: number | null;
}

export interface ChatMessageResponse {
  thread_id: number;
  reply: string;
  action?: {
    action_type: string;
    display_label: string;
    prefilled_data: Record<string, unknown>;
    form_name?: string | null;
  } | null;
  suggestions: string[];
  tokens_used: number;
}

export interface ChatConfirmRequest {
  thread_id: number;
  action_type: string;
  confirmed_data: Record<string, unknown>;
}

export interface ChatConfirmResponse {
  thread_id: number;
  reply: string;
  suggestions: string[];
}

export interface ChatHistoryMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: {
    action_type: string;
    display_label: string;
    prefilled_data: Record<string, unknown>;
    form_name?: string | null;
  } | null;
  suggestions?: string[];
  timestamp: string;
}

export interface ChatThreadRequest {
  context_type: "dashboard" | "customer" | "lead" | "global";
  context_id?: string | null;
}

export interface ChatThreadResponse {
  thread_id: number;
  context_type: "dashboard" | "customer" | "lead" | "global";
  context_id: string | null;
  is_new?: boolean;
}

export type MentionCategory = "customer" | "item";

export interface MentionCategoryOption {
  key: MentionCategory;
  label: string;
  icon: string;
}

export interface MentionEntity {
  id: string;
  name: string;
  subtitle?: string;
}

export interface InsertedMention {
  id: string;
  type: MentionCategory;
  displayName: string;
  startIndex: number;
  endIndex: number;
}
