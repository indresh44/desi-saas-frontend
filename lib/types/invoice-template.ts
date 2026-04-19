export interface InvoiceTemplateItem {
  id: string;
  templateId: string;
  catalogItemId: string | null;
  name: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  gstPercent: number;
  amount: number;
  sacCode: string | null;
  deliverables: string[] | null;
  sortOrder: number;
  createdAt: string;
}

export interface InvoiceTemplate {
  id: string;
  businessId: string;
  sourceInvoiceId: string | null;
  name: string;
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  itemsCount?: number;
  createdAt: string;
  updatedAt: string;
  items?: InvoiceTemplateItem[];
}

export interface InvoiceTemplateListItemApiResponse {
  id: string;
  business_id: string;
  source_invoice_id: string | null;
  name: string;
  subtotal: number;
  tax_total: number;
  total_amount: number;
  items_count: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceTemplateItemApiResponse {
  id: string;
  template_id: string;
  catalog_item_id: string | null;
  name: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  gst_percent: number;
  amount: number;
  sac_code: string | null;
  deliverables: string[] | null;
  sort_order: number;
  created_at: string;
}

export interface InvoiceTemplateApiResponse {
  id: string;
  business_id: string;
  source_invoice_id: string | null;
  name: string;
  subtotal: number;
  tax_total: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
  items?: InvoiceTemplateItemApiResponse[];
}

export interface InvoiceTemplateListApiResponse {
  items: InvoiceTemplateListItemApiResponse[];
  total: number;
}

export interface CreateTemplateItemInput {
  catalog_item_id?: string | null;
  name: string;
  description: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  gst_percent: number;
  sac_code?: string | null;
  deliverables?: string[] | null;
  sort_order?: number;
}

export interface CreateTemplateInput {
  name: string;
  items: CreateTemplateItemInput[];
}

export interface UpdateTemplateInput {
  name?: string;
  items?: CreateTemplateItemInput[];
}

export type PricingMode = "template" | "catalog";

export interface TemplatePricedItem {
  id: string;
  catalog_item_id: string | null;
  name: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  gst_percent: number;
  sac_code: string | null;
  deliverables: string[] | null;
  sort_order: number;
  template_unit_price: number;
  template_gst_percent: number;
  price_changed: boolean;
  has_catalog_link: boolean;
}

export interface TemplatePricedResponse {
  template_id: string;
  template_name: string;
  template_saved_at: string;
  mode: PricingMode;
  items: TemplatePricedItem[];
  subtotal: number;
  tax_total: number;
  total_amount: number;
}
