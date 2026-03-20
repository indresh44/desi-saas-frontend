import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import {
  CreateCustomerInput,
  Customer,
  CustomerByPhoneResponse,
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

export async function searchCustomers(query: string): Promise<Customer[]> {
  const path = withQuery(API_ENDPOINTS.customersSearch, { query });
  const result = await apiClient<Customer[]>(path, {
    method: "GET",
    cache: "no-store",
  });

  return result.data;
}

export async function fetchCustomers(): Promise<Customer[]> {
  const result = await apiClient<Customer[]>(API_ENDPOINTS.customers, {
    method: "GET",
    cache: "no-store",
  });

  return result.data;
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
  const result = await apiClient<Customer>(API_ENDPOINTS.customers, {
    method: "POST",
    body: input,
  });

  return result.data;
}

export async function updateCustomer(
  customerId: string,
  input: UpdateCustomerInput
): Promise<Customer> {
  const result = await apiClient<Customer>(API_ENDPOINTS.customerById(customerId), {
    method: "PATCH",
    body: input,
  });

  return result.data;
}