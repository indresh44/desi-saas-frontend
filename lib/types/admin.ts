export type AdminBusinessSummary = {
  id: string;
  name: string;
  phone: string | null;
  preferred_language: string;
  timezone: string;
  onboarding_status: string;
  created_at: string;
  owner_email: string | null;
  owner_name: string | null;
  owner_last_login_at: string | null;
  user_count: number;
  lead_count: number;
  invoice_count: number;
  payments_captured: number;
  outstanding_amount: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
};

export type AdminBusinessDetail = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  preferred_language: string;
  timezone: string;
  onboarding_status: string;
  onboarding_method: string | null;
  business_type: string | null;
  business_type_label: string | null;
  city: string | null;
  state: string | null;
  gst_number: string | null;
  created_at: string;
  owner: AdminUser | null;
  users: AdminUser[];
  counts: Record<string, number>;
  recent_leads: { id: string; title: string | null; created_at: string }[];
  recent_invoices: {
    id: string;
    invoice_number: string;
    status: string;
    total_amount: number;
    created_at: string;
  }[];
  recent_payments: {
    id: string;
    invoice_id: string;
    amount: number;
    method: string;
    voided_at: string | null;
    created_at: string;
  }[];
};

export type AdminAuditLog = {
  id: string;
  admin_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  before_snapshot: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type AdminDeleteResponse = {
  deleted: boolean;
  snapshot: Record<string, unknown>;
};

export const ADMIN_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_ADMIN === "true";
