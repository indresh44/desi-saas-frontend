import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import {
  CreateCustomerInput,
  Customer,
  CustomerApiResponse,
  CustomerByPhoneResponse,
  CustomerSummary,
  CustomerSummaryApiResponse,
  UpdateCustomerInput,
} from "@/lib/types/customer";

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

function toCustomerModel(raw: CustomerApiResponse): Customer {
  return {
    id: raw.id,
    name: raw.name,
    phone: raw.phone,
    email: raw.email,
    notes: raw.notes ?? null,
    address: raw.address ?? null,
    city: raw.city ?? null,
    state: raw.state ?? null,
    gstNumber: raw.gst_number ?? null,
    createdAt: raw.created_at,
  };
}

function toCustomerSummaryModel(raw: CustomerSummaryApiResponse): CustomerSummary {
  return {
    customer: toCustomerModel(raw.customer),
    lifetimeValue: Number(raw.lifetime_value ?? 0),
    totalOutstanding: Number(raw.total_outstanding ?? 0),
    totalLeads: Number(raw.total_leads ?? 0),
    activeLeads: Number(raw.active_leads ?? 0),
    totalInvoices: Number(raw.total_invoices ?? 0),
    upcomingMeetings: Number(raw.upcoming_meetings ?? 0),
    recentActivities: raw.recent_activities.map((activity) => ({
      type: activity.type,
      description: activity.description,
      date: activity.date,
      leadTitle: activity.lead_title,
    })),
  };
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  const path = withQuery(API_ENDPOINTS.customersSearch, { query });
  const result = await apiClient<CustomerApiResponse[]>(path, {
    method: "GET",
    cache: "no-store",
  });

  return result.data.map(toCustomerModel);
}

export async function fetchCustomers(): Promise<Customer[]> {
  const result = await apiClient<CustomerApiResponse[]>(API_ENDPOINTS.customers, {
    method: "GET",
    cache: "no-store",
  });

  return result.data.map(toCustomerModel);
}

export async function fetchCustomer(customerId: string): Promise<Customer> {
  const result = await apiClient<CustomerApiResponse>(
    API_ENDPOINTS.customerById(customerId),
    {
      method: "GET",
      cache: "no-store",
    }
  );

  return toCustomerModel(result.data);
}

export async function getCustomerByPhone(
  phone: string
): Promise<CustomerByPhoneResponse> {
  const path = withQuery(API_ENDPOINTS.customersByPhone, { phone });
  const result = await apiClient<CustomerByPhoneResponse>(path, {
    method: "GET",
    cache: "no-store",
  });

  return result.data;
}

export async function createCustomer(
  input: CreateCustomerInput
): Promise<Customer> {
  const result = await apiClient<CustomerApiResponse>(API_ENDPOINTS.customers, {
    method: "POST",
    body: input,
  });

  return toCustomerModel(result.data);
}

export async function updateCustomer(
  customerId: string,
  input: UpdateCustomerInput
): Promise<Customer> {
  const result = await apiClient<CustomerApiResponse>(API_ENDPOINTS.customerById(customerId), {
    method: "PATCH",
    body: input,
  });

  return toCustomerModel(result.data);
}

export async function fetchCustomerSummary(customerId: string): Promise<CustomerSummary> {
  const result = await apiClient<CustomerSummaryApiResponse>(
    API_ENDPOINTS.customerSummary(customerId),
    {
      method: "GET",
      cache: "no-store",
    }
  );

  return toCustomerSummaryModel(result.data);
}