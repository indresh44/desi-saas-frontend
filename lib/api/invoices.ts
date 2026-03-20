import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import {
  CreateInvoiceInput,
  CreatePaymentInput,
  CustomerOutstanding,
  Invoice,
  InvoiceApiResponse,
  InvoiceItem,
  Payment,
  PaymentAttachment,
  UpdateInvoiceInput,
} from "@/lib/types/invoice";

type InvoiceItemApiResponse = {
  id: string;
  invoice_id: string;
  catalog_item_id?: string | null;
  name?: string;
  description?: string | null;
  unit?: string | null;
  quantity: number;
  rate?: number;
  unit_price?: number;
  gst_percent: number;
  line_total?: number;
  amount?: number;
  sort_order?: number;
};

type PaymentApiResponse = {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: "upi" | "cash" | "bank_transfer" | "card";
  payment_date: string;
  reference: string | null;
  created_at: string;
};

type AttachmentUploadResponse = {
  id: string;
  file_url: string;
  filename: string;
};

function withQuery(path: string, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

function toInvoiceItemModel(raw: InvoiceItemApiResponse): InvoiceItem {
  const rate = Number(raw.rate ?? raw.unit_price ?? 0);
  const lineTotal = Number(raw.line_total ?? raw.amount ?? raw.quantity * rate);

  return {
    id: raw.id,
    invoiceId: raw.invoice_id,
    catalogItemId: raw.catalog_item_id ?? null,
    name: raw.name ?? raw.description ?? "",
    description: raw.description ?? "",
    unit: raw.unit ?? "piece",
    quantity: raw.quantity,
    rate,
    unitPrice: rate,
    gstPercent: raw.gst_percent,
    lineTotal,
    amount: lineTotal,
    sortOrder: raw.sort_order ?? null,
  };
}

function toInvoiceModel(raw: InvoiceApiResponse): Invoice {
  return {
    id: raw.id,
    businessId: raw.business_id,
    leadId: raw.lead_id,
    bookingId: raw.booking_id,
    invoiceNumber: raw.invoice_number,
    pdfUrl: raw.pdf_url,
    totalAmount: raw.total_amount,
    status: raw.status,
    issuedDate: raw.issued_date,
    dueDate: raw.due_date,
    createdAt: raw.created_at,
    items: raw.items?.map((item) => toInvoiceItemModel(item as InvoiceItemApiResponse)),
  };
}

function toPaymentModel(raw: PaymentApiResponse): Payment {
  return {
    id: raw.id,
    invoiceId: raw.invoice_id,
    amount: raw.amount,
    paymentMethod: raw.payment_method,
    paymentDate: raw.payment_date,
    reference: raw.reference,
    createdAt: raw.created_at,
  };
}

export async function fetchLeadInvoices(
  leadId: string, includeItems = false
): Promise<Invoice[]> {
  const path = withQuery(API_ENDPOINTS.invoices, { lead_id: leadId, include_items: includeItems ? "true" : undefined });

  const result = await apiClient<InvoiceApiResponse[]>(path, {
    method: "GET",
    cache: "no-store",
  });

  return result.data.map(toInvoiceModel);
}

export async function createInvoice(
  input: CreateInvoiceInput
): Promise<Invoice> {
  const result = await apiClient<InvoiceApiResponse>(API_ENDPOINTS.invoices, {
    method: "POST",
    body: input,
  });

  return toInvoiceModel(result.data);
}

export async function updateInvoice(
  invoiceId: string,
  input: UpdateInvoiceInput
): Promise<Invoice> {
  const result = await apiClient<InvoiceApiResponse>(API_ENDPOINTS.invoiceById(invoiceId), {
    method: "PATCH",
    body: input,
  });

  return toInvoiceModel(result.data);
}

export async function fetchCustomerOutstanding(
  customerId: string
): Promise<CustomerOutstanding> {
  const result = await apiClient<CustomerOutstanding>(
    API_ENDPOINTS.customerOutstanding(customerId),
    {
      method: "GET",
      cache: "no-store",
    }
  );

  return result.data;
}

export async function createPayment(
  input: CreatePaymentInput
): Promise<Payment> {
  const result = await apiClient<PaymentApiResponse>(API_ENDPOINTS.payments, {
    method: "POST",
    body: input,
  });

  return toPaymentModel(result.data);
}

export async function fetchInvoicePayments(
  invoiceId: string
): Promise<Payment[]> {
  const path = withQuery(API_ENDPOINTS.payments, { invoice_id: invoiceId });

  const result = await apiClient<PaymentApiResponse[]>(path, {
    method: "GET",
    cache: "no-store",
  });

  return result.data.map(toPaymentModel);
}

export async function fetchPaymentAttachments(
  paymentId: string
): Promise<PaymentAttachment[]> {
  const path = withQuery("/api/v1/attachments", {
    entity_type: "payment",
    entity_id: paymentId,
  });

  const result = await apiClient<PaymentAttachment[]>(path, {
    method: "GET",
    cache: "no-store",
  });

  return result.data;
}

export async function uploadAttachment(
  entityType: string,
  entityId: string,
  file: File
): Promise<AttachmentUploadResponse> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("entity_type", entityType);
  formData.append("entity_id", entityId);

  const result = await apiClient<AttachmentUploadResponse>(
    "/api/v1/attachments/upload",
    {
    method: "POST",
    body: formData,
    }
  );

  return result.data;
}

export async function getInvoicePdf(
  invoiceId: string,
  force: boolean = false,
): Promise<string> {
  const path = force
    ? `/api/v1/invoices/${invoiceId}/pdf?force=true`
    : `/api/v1/invoices/${invoiceId}/pdf`;
  const { data } = await apiClient<{ pdf_url: string }>(path);
  return data.pdf_url;
}
