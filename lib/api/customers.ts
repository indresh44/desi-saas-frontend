import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS, DEFAULT_USER_ID } from "@/lib/constants/api";
import {
  CreateCustomerInput,
  Customer,
  CustomerByPhoneResponse,
} from "@/lib/types/customer";

function getUserHeader(userId: string) {
  return {
    "X-User-Id": userId || DEFAULT_USER_ID,
  };
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

export async function searchCustomers(
  query: string,
  userId = DEFAULT_USER_ID
): Promise<Customer[]> {
  const path = withQuery(API_ENDPOINTS.customersSearch, { query });
  const result = await apiClient<Customer[]>(path, {
    method: "GET",
    headers: getUserHeader(userId),
    cache: "no-store",
  });

  return result.data;
}

export async function fetchCustomers(
  userId = DEFAULT_USER_ID
): Promise<Customer[]> {
  const result = await apiClient<Customer[]>(API_ENDPOINTS.customers, {
    method: "GET",
    headers: getUserHeader(userId),
    cache: "no-store",
  });

  return result.data;
}

export async function getCustomerByPhone(
  phone: string,
  userId = DEFAULT_USER_ID
): Promise<CustomerByPhoneResponse> {
  const path = withQuery(API_ENDPOINTS.customersByPhone, { phone });
  const result = await apiClient<CustomerByPhoneResponse>(path, {
    method: "GET",
    headers: getUserHeader(userId),
    cache: "no-store",
  });

  return result.data;
}

export async function createCustomer(
  input: CreateCustomerInput,
  userId = DEFAULT_USER_ID
): Promise<Customer> {
  const result = await apiClient<Customer>(API_ENDPOINTS.customers, {
    method: "POST",
    headers: getUserHeader(userId),
    body: input,
  });

  return result.data;
}