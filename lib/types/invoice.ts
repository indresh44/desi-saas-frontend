export type InvoiceStatus = "draft" | "sent" | "paid" | "partial" | "overdue";
export type PaymentMethod = "upi" | "cash" | "bank_transfer" | "card";

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  gstPercent: number;
  amount: number;
}

export interface Invoice {
  id: string;
  businessId: string;
  leadId: string | null;
  bookingId: string | null;
  invoiceNumber: string;
  totalAmount: number;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  createdAt: string;
  items?: InvoiceItem[];
}

export interface CreateInvoiceItemInput {
  description: string;
  quantity: number;
  unit_price: number;
  gst_percent: number;
}

export interface CreateInvoiceInput {
  invoice: {
    lead_id: string;
    total_amount: number;
    status: InvoiceStatus;
    issued_date: string;
    due_date: string;
  };
  items: CreateInvoiceItemInput[];
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
