import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import {
  SendWhatsAppTextInput,
  WhatsAppConversationRead,
  WhatsAppMessageRead,
} from "@/lib/types/whatsapp";

function withQuery(path: string, params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

export async function fetchLeadConversation(
  leadId: string
): Promise<WhatsAppConversationRead | null> {
  const path = withQuery(API_ENDPOINTS.whatsappConversations, { lead_id: leadId });
  const result = await apiClient<WhatsAppConversationRead[]>(path, {
    method: "GET",
    cache: "no-store",
  });

  return result.data[0] ?? null;
}

export async function fetchConversationMessages(
  conversationId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<WhatsAppMessageRead[]> {
  const { limit = 50, offset = 0 } = options;

  const path = withQuery(
    `${API_ENDPOINTS.whatsappMessages}/${conversationId}/messages`,
    { limit, offset }
  );

  const result = await apiClient<WhatsAppMessageRead[]>(path, {
    method: "GET",
    cache: "no-store",
  });

  return result.data;
}

export async function findOrCreateConversationByLead(
  leadId: string
): Promise<WhatsAppConversationRead> {
  const result = await apiClient<WhatsAppConversationRead>(
    API_ENDPOINTS.whatsappFindOrCreate,
    {
      method: "POST",
      body: { lead_id: leadId },
    }
  );

  return result.data;
}

export async function sendWhatsAppText(
  input: SendWhatsAppTextInput
): Promise<WhatsAppMessageRead> {
  const result = await apiClient<WhatsAppMessageRead>(API_ENDPOINTS.whatsappSendText, {
    method: "POST",
    body: input,
  });

  return result.data;
}