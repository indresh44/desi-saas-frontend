export type InvoiceStatus = "draft" | "sent" | "paid" | "partial" | "overdue";
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
  invoiceNumber: string;
  pdfUrl: string | null;
  totalAmount: number;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  createdAt: string;
  items?: InvoiceItem[];
}

export interface InvoiceApiResponse {
  id: string;
  business_id: string;
  lead_id: string | null;
  booking_id: string | null;
  invoice_number: string;
  pdf_url: string | null;
  total_amount: number;
  status: InvoiceStatus;
  issued_date: string;
  due_date: string;
  created_at: string;
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
