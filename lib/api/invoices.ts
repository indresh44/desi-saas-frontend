import { apiClient } from "@/lib/api/client";
import {
  fetchAttachments,
  uploadAttachment as uploadEntityAttachment,
} from "@/lib/api/attachments";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type { AttachmentEntityType } from "@/lib/types/attachment";
import {
  CreateInvoiceInput,
  CreatePaymentInput,
  CustomerOutstanding,
  Invoice,
  InvoiceApiResponse,
  InvoiceItem,
  InvoiceListApiResponse,
  InvoiceListResult,
  InvoiceListSummary,
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
    quoteId: raw.quote_id ?? null,
    invoiceNumber: raw.invoice_number,
    pdfUrl: raw.pdf_url,
    subtotal: Number(raw.subtotal ?? 0),
    taxTotal: Number(raw.tax_total ?? 0),
    totalAmount: raw.total_amount,
    amountPaid: Number(raw.amount_paid ?? 0),
    status: raw.status,
    issuedDate: raw.issued_date,
    dueDate: raw.due_date,
    createdAt: raw.created_at,
    customerName: raw.customer_name ?? null,
    customerPhone: raw.customer_phone ?? null,
    leadTitle: raw.lead_title ?? null,
    items: raw.items?.map((item) => toInvoiceItemModel(item as InvoiceItemApiResponse)),
  };
}

function toInvoiceListSummaryModel(summary: InvoiceListApiResponse["summary"]): InvoiceListSummary {
  return {
    totalOutstanding: Number(summary.total_outstanding ?? 0),
    outstandingCount: Number(summary.outstanding_count ?? 0),
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
  const { items } = await fetchInvoices({ lead_id: leadId, limit: 100, offset: 0 });
  if (!includeItems || items.length === 0) {
    return items;
  }

  const itemsByInvoice = await Promise.all(
    items.map(async (invoice) => {
      const invoiceItems = await fetchInvoiceItems(invoice.id);
      return [invoice.id, invoiceItems] as const;
    })
  );

  const invoiceItemsMap = new Map(itemsByInvoice);
  return items.map((invoice) => ({
    ...invoice,
    items: invoiceItemsMap.get(invoice.id) ?? [],
  }));
}

export async function fetchInvoices(filters?: {
  customer_id?: string;
  lead_id?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}): Promise<InvoiceListResult> {
  const path = withQuery(API_ENDPOINTS.invoices, {
    customer_id: filters?.customer_id,
    lead_id: filters?.lead_id,
    status: filters?.status,
    from_date: filters?.from_date,
    to_date: filters?.to_date,
    limit: filters?.limit?.toString(),
    offset: filters?.offset?.toString(),
  });

  const result = await apiClient<InvoiceListApiResponse | InvoiceApiResponse[]>(path, {
    method: "GET",
    cache: "no-store",
  });

  if (Array.isArray(result.data)) {
    const items = result.data.map(toInvoiceModel);
    return {
      items,
      total: items.length,
      limit: Number(filters?.limit ?? items.length),
      offset: Number(filters?.offset ?? 0),
      summary: {
        totalOutstanding: items
          .filter((invoice) => invoice.status !== "paid" && invoice.status !== "draft")
          .reduce((sum, invoice) => {
            const totalAmount = Number(invoice.totalAmount ?? 0);
            const amountPaid = Number(invoice.amountPaid ?? 0);
            return sum + Math.max(totalAmount - amountPaid, 0);
          }, 0),
        outstandingCount: items.filter(
          (invoice) => invoice.status !== "paid" && invoice.status !== "draft"
        ).length,
      },
    };
  }

  const payload = result.data;
  const safeItems = Array.isArray(payload.items) ? payload.items : [];
  const safeSummary = payload.summary ?? { total_outstanding: 0, outstanding_count: 0 };

  return {
    items: safeItems.map(toInvoiceModel),
    total: Number(payload.total ?? safeItems.length),
    limit: Number(payload.limit ?? filters?.limit ?? 20),
    offset: Number(payload.offset ?? filters?.offset ?? 0),
    summary: toInvoiceListSummaryModel(safeSummary),
  };
}

export async function fetchInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
  const result = await apiClient<InvoiceItemApiResponse[]>(
    API_ENDPOINTS.invoiceItemsById(invoiceId),
    {
      method: "GET",
      cache: "no-store",
    }
  );

  return Array.isArray(result.data) ? result.data.map(toInvoiceItemModel) : [];
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

  return Array.isArray(result.data) ? result.data.map(toPaymentModel) : [];
}

export async function fetchPaymentAttachments(
  paymentId: string
): Promise<PaymentAttachment[]> {
  return fetchAttachments("payment", paymentId);
}

export async function uploadAttachment(
  entityType: string,
  entityId: string,
  file: File
): Promise<PaymentAttachment> {
  return uploadEntityAttachment(entityType as AttachmentEntityType, entityId, file);
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
