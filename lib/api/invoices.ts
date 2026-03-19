import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS, DEFAULT_USER_ID } from "@/lib/constants/api";
import {
  CreateInvoiceInput,
  CreatePaymentInput,
  CustomerOutstanding,
  Invoice,
  InvoiceItem,
  Payment,
} from "@/lib/types/invoice";

type InvoiceItemApiResponse = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  gst_percent: number;
  amount: number;
};

type InvoiceApiResponse = {
  id: string;
  business_id: string;
  lead_id: string | null;
  booking_id: string | null;
  invoice_number: string;
  total_amount: number;
  status: "draft" | "sent" | "paid" | "partial" | "overdue";
  issued_date: string;
  due_date: string;
  created_at: string;
  items?: InvoiceItemApiResponse[];
};

type PaymentApiResponse = {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: "upi" | "cash" | "bank_transfer" | "card";
  payment_date: string;
  reference: string | null;
};

function getUserHeader(userId: string) {
  return { "X-User-Id": userId || DEFAULT_USER_ID };
}

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
  return {
    id: raw.id,
    invoiceId: raw.invoice_id,
    description: raw.description,
    quantity: raw.quantity,
    unitPrice: raw.unit_price,
    gstPercent: raw.gst_percent,
    amount: raw.amount,
  };
}

function toInvoiceModel(raw: InvoiceApiResponse): Invoice {
  return {
    id: raw.id,
    businessId: raw.business_id,
    leadId: raw.lead_id,
    bookingId: raw.booking_id,
    invoiceNumber: raw.invoice_number,
    totalAmount: raw.total_amount,
    status: raw.status,
    issuedDate: raw.issued_date,
    dueDate: raw.due_date,
    createdAt: raw.created_at,
    items: raw.items?.map(toInvoiceItemModel),
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
  };
}

export async function fetchLeadInvoices(
  leadId: string,
  userId = DEFAULT_USER_ID
): Promise<Invoice[]> {
  const path = withQuery(API_ENDPOINTS.invoices, { lead_id: leadId });

  const result = await apiClient<InvoiceApiResponse[]>(path, {
    method: "GET",
    headers: getUserHeader(userId),
    cache: "no-store",
  });

  return result.data.map(toInvoiceModel);
}

export async function createInvoice(
  input: CreateInvoiceInput,
  userId = DEFAULT_USER_ID
): Promise<Invoice> {
  const result = await apiClient<InvoiceApiResponse>(API_ENDPOINTS.invoices, {
    method: "POST",
    headers: getUserHeader(userId),
    body: input,
  });

  return toInvoiceModel(result.data);
}

export async function fetchCustomerOutstanding(
  customerId: string,
  userId = DEFAULT_USER_ID
): Promise<CustomerOutstanding> {
  const result = await apiClient<CustomerOutstanding>(
    API_ENDPOINTS.customerOutstanding(customerId),
    {
      method: "GET",
      headers: getUserHeader(userId),
      cache: "no-store",
    }
  );

  return result.data;
}

export async function createPayment(
  input: CreatePaymentInput,
  userId = DEFAULT_USER_ID
): Promise<Payment> {
  const result = await apiClient<PaymentApiResponse>(API_ENDPOINTS.payments, {
    method: "POST",
    headers: getUserHeader(userId),
    body: input,
  });

  return toPaymentModel(result.data);
}
