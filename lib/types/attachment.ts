export type AttachmentEntityType =
  | "lead"
  | "lead_activity"
  | "payment"
  | "catalog"
  | "quote"
  | "invoice"
  | "invoice_item"
  | "task";

export interface Attachment {
  id: string;
  business_id: string;
  entity_type: AttachmentEntityType;
  entity_id: string;
  filename: string;
  file_url: string;
  file_size: number;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}
