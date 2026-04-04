import { apiClient } from "@/lib/api/client";
import {
  ChatConfirmRequest,
  ChatConfirmResponse,
  ChatHistoryMessage,
  ChatMessageRequest,
  ChatMessageResponse,
  ChatThreadRequest,
  ChatThreadResponse,
} from "@/lib/types/chat";

type BackendChatAction = {
  type: string;
  form_name?: string | null;
  prefilled_data?: Record<string, unknown> | null;
};

type BackendChatMessageResponse = {
  thread_id: number;
  reply: string;
  action?: BackendChatAction | null;
  suggestions: string[];
  tokens_used: number;
  pdf?: {
    url: string;
    invoice_id: string;
    invoice_number: string;
  } | null;
};

type BackendChatHistoryResponse = {
  thread_id: number;
  context_type: "dashboard" | "customer" | "lead" | "global";
  context_id: string | null;
  messages: Array<{
    id: number;
    role: "user" | "assistant";
    content: string;
    created_at: string;
    tool_name?: string | null;
    tokens_used?: number | null;
  }>;
};

function getDisplayLabel(actionType: string): string {
  switch (actionType) {
    case "create_lead":
      return "Create Lead";
    case "update_lead_stage":
      return "Update Stage";
    case "schedule_followup":
      return "Schedule Follow-up";
    case "record_payment":
      return "Record Payment";
    case "send_payment_reminder":
      return "Send Payment Reminder";
    default:
      return actionType
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
  }
}

function getFrontendActionType(action: BackendChatAction): string {
  if (action.form_name) {
    return action.form_name;
  }

  return action.type.replace(/^confirm_/, "");
}

function normalizePrefilledData(
  actionType: string,
  raw: Record<string, unknown>
): Record<string, unknown> {
  if (actionType === "create_lead") {
    return {
      title: raw.title ?? raw.requirement ?? "",
      customer_name: raw.customer_name ?? raw.name ?? "",
      customer_phone: raw.customer_phone ?? raw.phone ?? "",
      source: raw.source ?? "",
      estimated_value: raw.estimated_value ?? null,
      notes: raw.notes ?? "",
      customer_id: raw.customer_id ?? null,
      default_stage_id: raw.default_stage_id ?? null,
      default_stage_name: raw.default_stage_name ?? null,
    };
  }

  if (actionType === "update_lead_stage") {
    return {
      lead_id: raw.lead_id ?? "",
      lead_title: raw.lead_title ?? "",
      current_stage: raw.current_stage ?? raw.current_stage_name ?? raw.current_stage_id ?? "",
      new_stage: raw.new_stage ?? raw.target_stage_name ?? "",
      target_stage_id: raw.target_stage_id ?? null,
    };
  }

  if (actionType === "schedule_followup") {
    const scheduledAt = typeof raw.scheduled_at === "string" ? raw.scheduled_at : "";
    const [datePart, timePartWithZone = ""] = scheduledAt.split("T");
    const timePart = timePartWithZone.slice(0, 5);

    return {
      lead_id: raw.lead_id ?? null,
      lead_title: raw.lead_title ?? "",
      customer_name: raw.customer_name ?? "",
      followup_type: raw.followup_type ?? "call",
      scheduled_date: raw.scheduled_date ?? datePart ?? "",
      scheduled_time: raw.scheduled_time ?? timePart ?? "",
      notes: raw.notes ?? raw.note ?? "",
    };
  }

  if (actionType === "create_invoice") {
    return {
      customer_id: raw.customer_id ?? null,
      customer_name: raw.customer_name ?? "",
      lead_id: raw.lead_id ?? null,
      issued_date: raw.issued_date ?? "",
      due_date: raw.due_date ?? "",
      items: Array.isArray(raw.items) ? raw.items : [],
      notes: raw.notes ?? "",
      subtotal: raw.subtotal ?? 0,
      tax_total: raw.tax_total ?? 0,
      total_amount: raw.total_amount ?? 0,
    };
  }

  if (actionType === "add_lead_note") {
    return {
      lead_id: raw.lead_id ?? null,
      lead_title: raw.lead_title ?? "",
      note: raw.note ?? "",
    };
  }

  if (actionType === "record_payment") {
    return {
      invoice_id: raw.invoice_id ?? null,
      invoice_number: raw.invoice_number ?? "",
      customer_name: raw.customer_name ?? "",
      amount: raw.amount ?? 0,
      payment_method: raw.payment_method ?? "upi",
      reference: raw.reference ?? "",
      payment_date: raw.payment_date ?? "",
      notes: raw.notes ?? "",
      total_amount: raw.total_amount ?? 0,
      amount_already_paid: raw.amount_already_paid ?? 0,
      balance_due: raw.balance_due ?? 0,
    };
  }

  if (actionType === "send_payment_reminder") {
    return {
      customer_name: raw.customer_name ?? "",
      customer_phone: raw.customer_phone ?? "",
      outstanding_amount: raw.outstanding_amount ?? 0,
      invoice_numbers: raw.invoice_numbers ?? "",
      message: raw.message ?? "",
      tone: raw.tone ?? raw.message_tone ?? "polite",
      whatsapp_url: raw.whatsapp_url ?? "",
    };
  }

  return raw;
}

function mapConfirmPayload(payload: ChatConfirmRequest): ChatConfirmRequest {
  if (payload.action_type === "create_lead") {
    return {
      ...payload,
      action_type: "confirm_create_lead",
      confirmed_data: {
        name: payload.confirmed_data.customer_name ?? "",
        phone: payload.confirmed_data.customer_phone ?? "",
        requirement: payload.confirmed_data.title ?? "",
        source: payload.confirmed_data.source ?? null,
        estimated_value: payload.confirmed_data.estimated_value ?? null,
        notes: payload.confirmed_data.notes ?? "",
        customer_id: payload.confirmed_data.customer_id ?? null,
        default_stage_id: payload.confirmed_data.default_stage_id ?? null,
      },
    };
  }

  if (payload.action_type === "update_lead_stage") {
    return {
      ...payload,
      action_type: "confirm_update_lead_stage",
      confirmed_data: {
        lead_id: payload.confirmed_data.lead_id,
        target_stage_id: payload.confirmed_data.target_stage_id,
      },
    };
  }

  if (payload.action_type === "schedule_followup") {
    const scheduledDate = String(payload.confirmed_data.scheduled_date ?? "");
    const scheduledTime = String(payload.confirmed_data.scheduled_time ?? "");
    const scheduledAt =
      scheduledDate && scheduledTime
        ? `${scheduledDate}T${scheduledTime}:00+00:00`
        : null;

    return {
      ...payload,
      action_type: "confirm_schedule_followup",
      confirmed_data: {
        lead_id: payload.confirmed_data.lead_id,
        scheduled_date: scheduledDate,
        scheduled_at: scheduledAt,
        note: payload.confirmed_data.notes ?? "",
      },
    };
  }

  if (payload.action_type === "create_invoice" || payload.action_type === "confirm_create_invoice") {
    return {
      ...payload,
      action_type: "confirm_create_invoice",
      confirmed_data: {
        customer_id: payload.confirmed_data.customer_id ?? null,
        lead_id: payload.confirmed_data.lead_id ?? null,
        issued_date: payload.confirmed_data.issued_date ?? null,
        due_date: payload.confirmed_data.due_date ?? null,
        items: payload.confirmed_data.items ?? [],
        notes: payload.confirmed_data.notes ?? null,
      },
    };
  }

  if (payload.action_type === "add_lead_note" || payload.action_type === "confirm_add_lead_note") {
    return {
      ...payload,
      action_type: "confirm_add_lead_note",
      confirmed_data: {
        lead_id: payload.confirmed_data.lead_id,
        note: payload.confirmed_data.note ?? "",
      },
    };
  }

  if (payload.action_type === "record_payment" || payload.action_type === "confirm_record_payment") {
    return {
      ...payload,
      action_type: "confirm_record_payment",
      confirmed_data: {
        invoice_id: payload.confirmed_data.invoice_id,
        invoice_number: payload.confirmed_data.invoice_number ?? "",
        amount: payload.confirmed_data.amount ?? 0,
        payment_method: payload.confirmed_data.payment_method ?? "upi",
        reference: payload.confirmed_data.reference ?? "",
        payment_date: payload.confirmed_data.payment_date ?? "",
        notes: payload.confirmed_data.notes ?? "",
      },
    };
  }

  if (
    payload.action_type === "send_payment_reminder" ||
    payload.action_type === "confirm_send_payment_reminder"
  ) {
    return {
      ...payload,
      action_type: "confirm_send_payment_reminder",
      confirmed_data: {
        customer_name: payload.confirmed_data.customer_name ?? "",
        customer_phone: payload.confirmed_data.customer_phone ?? "",
        outstanding_amount: payload.confirmed_data.outstanding_amount ?? 0,
        invoice_numbers: payload.confirmed_data.invoice_numbers ?? "",
        message: payload.confirmed_data.message ?? "",
        tone: payload.confirmed_data.tone ?? "polite",
        whatsapp_url: payload.confirmed_data.whatsapp_url ?? "",
      },
    };
  }

  return payload;
}

function normalizeAction(action?: BackendChatAction | null) {
  if (!action) {
    return null;
  }

  const actionType = getFrontendActionType(action);
  const prefilledData = action.prefilled_data ?? {};

  return {
    action_type: actionType,
    display_label: getDisplayLabel(actionType),
    form_name: action.form_name ?? null,
    prefilled_data: normalizePrefilledData(actionType, prefilledData),
  };
}

export async function sendChatMessage(
  payload: ChatMessageRequest
): Promise<ChatMessageResponse> {
  const { data } = await apiClient<BackendChatMessageResponse>("/api/v1/chat/message", {
    method: "POST",
    body: payload,
  });

  return {
    ...data,
    action: normalizeAction(data.action),
  };
}

export async function confirmChatAction(
  payload: ChatConfirmRequest
): Promise<ChatConfirmResponse> {
  const { data } = await apiClient<BackendChatMessageResponse>("/api/v1/chat/confirm", {
    method: "POST",
    body: mapConfirmPayload(payload),
  });

  return {
    thread_id: data.thread_id,
    reply: data.reply,
    suggestions: data.suggestions,
  };
}

export async function fetchChatHistory(
  threadId: number,
  limit = 20
): Promise<ChatHistoryMessage[]> {
  const { data } = await apiClient<BackendChatHistoryResponse>(
    `/api/v1/chat/history/${threadId}?limit=${limit}`
  );

  return data.messages.map((message) => ({
    id: String(message.id),
    role: message.role,
    content: message.content,
    timestamp: message.created_at,
    action: null,
    suggestions: [],
  }));
}

export async function getOrCreateThread(
  payload: ChatThreadRequest
): Promise<ChatThreadResponse> {
  const { data } = await apiClient<ChatThreadResponse>("/api/v1/chat/thread", {
    method: "POST",
    body: payload,
  });

  return data;
}
