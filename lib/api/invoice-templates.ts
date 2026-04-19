import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type {
  CreateTemplateInput,
  InvoiceTemplate,
  InvoiceTemplateApiResponse,
  InvoiceTemplateItem,
  InvoiceTemplateItemApiResponse,
  InvoiceTemplateListApiResponse,
  PricingMode,
  TemplatePricedResponse,
  UpdateTemplateInput,
} from "@/lib/types/invoice-template";

function toItemModel(raw: InvoiceTemplateItemApiResponse): InvoiceTemplateItem {
  return {
    id: raw.id,
    templateId: raw.template_id,
    catalogItemId: raw.catalog_item_id,
    name: raw.name,
    description: raw.description,
    unit: raw.unit,
    quantity: Number(raw.quantity ?? 0),
    unitPrice: Number(raw.unit_price ?? 0),
    gstPercent: Number(raw.gst_percent ?? 0),
    amount: Number(raw.amount ?? 0),
    sacCode: raw.sac_code,
    deliverables: raw.deliverables ?? null,
    sortOrder: Number(raw.sort_order ?? 0),
    createdAt: raw.created_at,
  };
}

function toTemplateModel(raw: InvoiceTemplateApiResponse): InvoiceTemplate {
  return {
    id: raw.id,
    businessId: raw.business_id,
    sourceInvoiceId: raw.source_invoice_id,
    name: raw.name,
    subtotal: Number(raw.subtotal ?? 0),
    taxTotal: Number(raw.tax_total ?? 0),
    totalAmount: Number(raw.total_amount ?? 0),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    items: raw.items?.map(toItemModel),
  };
}

export async function fetchTemplates(search?: string): Promise<InvoiceTemplate[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("limit", "100");
  const query = params.toString();
  const path = query
    ? `${API_ENDPOINTS.invoiceTemplates}?${query}`
    : API_ENDPOINTS.invoiceTemplates;

  const { data } = await apiClient<InvoiceTemplateListApiResponse>(path, {
    method: "GET",
    cache: "no-store",
  });
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map((raw) => ({
    id: raw.id,
    businessId: raw.business_id,
    sourceInvoiceId: raw.source_invoice_id,
    name: raw.name,
    subtotal: Number(raw.subtotal ?? 0),
    taxTotal: Number(raw.tax_total ?? 0),
    totalAmount: Number(raw.total_amount ?? 0),
    itemsCount: Number(raw.items_count ?? 0),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }));
}

export async function fetchTemplate(id: string): Promise<InvoiceTemplate> {
  const { data } = await apiClient<InvoiceTemplateApiResponse>(
    API_ENDPOINTS.invoiceTemplateById(id),
    { method: "GET", cache: "no-store" }
  );
  return toTemplateModel(data);
}

export async function createTemplate(
  input: CreateTemplateInput
): Promise<InvoiceTemplate> {
  const { data } = await apiClient<InvoiceTemplateApiResponse>(
    API_ENDPOINTS.invoiceTemplates,
    { method: "POST", body: input }
  );
  return toTemplateModel(data);
}

export async function createTemplateFromInvoice(
  invoiceId: string,
  name: string
): Promise<InvoiceTemplate> {
  const { data } = await apiClient<InvoiceTemplateApiResponse>(
    API_ENDPOINTS.invoiceTemplateFromInvoice(invoiceId),
    { method: "POST", body: { name } }
  );
  return toTemplateModel(data);
}

export async function updateTemplate(
  id: string,
  input: UpdateTemplateInput
): Promise<InvoiceTemplate> {
  const { data } = await apiClient<InvoiceTemplateApiResponse>(
    API_ENDPOINTS.invoiceTemplateById(id),
    { method: "PATCH", body: input }
  );
  return toTemplateModel(data);
}

export async function deleteTemplate(id: string): Promise<void> {
  await apiClient<null>(API_ENDPOINTS.invoiceTemplateById(id), {
    method: "DELETE",
  });
}

export async function duplicateTemplate(id: string): Promise<InvoiceTemplate> {
  const { data } = await apiClient<InvoiceTemplateApiResponse>(
    API_ENDPOINTS.invoiceTemplateDuplicate(id),
    { method: "POST" }
  );
  return toTemplateModel(data);
}

export async function fetchTemplatePriced(
  id: string,
  mode: PricingMode
): Promise<TemplatePricedResponse> {
  const path = `${API_ENDPOINTS.invoiceTemplatePriced(id)}?mode=${mode}`;
  const { data } = await apiClient<TemplatePricedResponse>(path, {
    method: "GET",
    cache: "no-store",
  });
  return data;
}
