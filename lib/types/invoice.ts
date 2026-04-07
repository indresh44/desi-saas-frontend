export type InvoiceStatus = "draft" | "sent" | "approved" | "partial" | "paid";
export type PaymentMethod = "upi" | "cash" | "bank_transfer" | "card";

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  catalogItemId: string | null;
  name: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  unitPrice: number;
  gstPercent: number;
  lineTotal: number;
  amount: number;
  sortOrder: number | null;
}

export interface Invoice {
  id: string;
  businessId: string;
  leadId: string | null;
  bookingId: string | null;
  quoteId?: string | null;
  invoiceNumber: string;
  pdfUrl: string | null;
  subtotal?: number;
  taxTotal?: number;
  totalAmount: number;
  amountPaid?: number;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  createdAt: string;
  customerName?: string | null;
  customerPhone?: string | null;
  leadTitle?: string | null;
  items?: InvoiceItem[];
}

export interface InvoiceApiResponse {
  id: string;
  business_id: string;
  lead_id: string | null;
  booking_id: string | null;
  quote_id?: string | null;
  invoice_number: string;
  pdf_url: string | null;
  subtotal?: number;
  tax_total?: number;
  total_amount: number;
  amount_paid?: number;
  status: InvoiceStatus;
  issued_date: string;
  due_date: string;
  created_at: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  lead_title?: string | null;
  items?: {
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
  }[];
}

export interface InvoiceListSummaryApiResponse {
  total_outstanding: number;
  outstanding_count: number;
}

export interface InvoiceListApiResponse {
  items: InvoiceApiResponse[];
  total: number;
  limit: number;
  offset: number;
  summary: InvoiceListSummaryApiResponse;
}

export interface InvoiceListSummary {
  totalOutstanding: number;
  outstandingCount: number;
}

export interface InvoiceListResult {
  items: Invoice[];
  total: number;
  limit: number;
  offset: number;
  summary: InvoiceListSummary;
}

export interface CreateInvoiceItemInput {
  catalog_item_id?: string | null;
  name: string;
  description?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  gst_percent: number;
  sort_order?: number;
}

export interface UpdateInvoiceItemInput {
  catalog_item_id?: string | null;
  name: string;
  description?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  gst_percent: number;
}

export interface CreateInvoiceInput {
  invoice: {
    lead_id: string;
    status: InvoiceStatus;
    issued_date: string;
    due_date: string;
  };
  items: CreateInvoiceItemInput[];
}

export interface UpdateInvoiceInput {
  invoice: {
    issued_date: string;
    due_date: string;
  };
  items: UpdateInvoiceItemInput[];
}

export interface CustomerOutstanding {
  total_invoiced: number;
  total_paid: number;
  outstanding: number;
  overdue_invoices: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference: string | null;
  createdAt: string;
}

export interface CreatePaymentInput {
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  reference?: string;
}

export interface PaymentAttachment {
  id: string;
  filename: string;
  file_url: string;
  file_size: number;
  created_at: string;
}
