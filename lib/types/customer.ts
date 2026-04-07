export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  gstNumber?: string | null;
  createdAt?: string;
};

export type CustomerApiResponse = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  gst_number?: string | null;
  created_at?: string;
};

export type CustomerByPhoneResponse = {
  found: boolean;
  customer: Customer | null;
};

export type CreateCustomerInput = {
  name: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  gst_number?: string | null;
};

export type UpdateCustomerInput = {
  name?: string;
  phone?: string;
  email?: string | null;
  notes?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  gst_number?: string | null;
};

export type CustomerRecentActivityApiResponse = {
  type: string;
  description: string;
  date: string;
  lead_title: string | null;
};

export type CustomerSummaryApiResponse = {
  customer: CustomerApiResponse;
  lifetime_value: number;
  total_outstanding: number;
  total_leads: number;
  active_leads: number;
  total_invoices: number;
  upcoming_meetings: number;
  recent_activities: CustomerRecentActivityApiResponse[];
};

export type CustomerRecentActivity = {
  type: string;
  description: string;
  date: string;
  leadTitle: string | null;
};

export type CustomerSummary = {
  customer: Customer;
  lifetimeValue: number;
  totalOutstanding: number;
  totalLeads: number;
  activeLeads: number;
  totalInvoices: number;
  upcomingMeetings: number;
  recentActivities: CustomerRecentActivity[];
};