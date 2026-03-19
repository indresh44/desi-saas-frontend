export type WhatsAppConversationRead = {
  id: string;
  lead_id: string | null;
  customer_id: string | null;
  phone_number: string;
  contact_name: string | null;
  last_message_at: string | null;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
};

export type WhatsAppMessageStatus =
  | "pending"
  | "accepted"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export type WhatsAppMessageDirection = "incoming" | "outgoing";

export type WhatsAppMessageRead = {
  id: string;
  conversation_id: string;
  direction: WhatsAppMessageDirection;
  message_type: string;
  text_body: string | null;
  status: WhatsAppMessageStatus;
  error_message: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  failed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SendWhatsAppTextInput = {
  conversation_id: string;
  text: string;
};