export interface OverdueInvoiceSummary {
  invoice_id: string;
  lead_id: string | null;
  invoice_number: string;
  customer_name: string | null;
  customer_phone: string | null;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  due_date: string;
  days_overdue: number;
}

export interface DashboardPaymentSummary {
  collections_this_month: number;
  collections_last_month: number;
  total_outstanding: number;
  outstanding_invoice_count: number;
  overdue_invoices: OverdueInvoiceSummary[];
}
