import { apiClient } from "@/lib/api/client";
import type {
  AdminAuditLog,
  AdminBusinessDetail,
  AdminBusinessSummary,
  AdminDeleteResponse,
} from "@/lib/types/admin";

const BASE = "/api/admin";

export async function listAdminBusinesses(): Promise<AdminBusinessSummary[]> {
  const result = await apiClient<AdminBusinessSummary[]>(`${BASE}/businesses`);
  return result.data ?? [];
}

export async function getAdminBusiness(
  businessId: string,
): Promise<AdminBusinessDetail> {
  const result = await apiClient<AdminBusinessDetail>(
    `${BASE}/businesses/${businessId}`,
  );
  if (!result.data) {
    throw new Error("Business not found");
  }
  return result.data;
}

export async function deleteAdminBusiness(
  businessId: string,
  confirmName: string,
): Promise<AdminDeleteResponse> {
  const result = await apiClient<AdminDeleteResponse>(
    `${BASE}/businesses/${businessId}`,
    {
      method: "DELETE",
      body: { confirm_name: confirmName },
    },
  );
  if (!result.data) {
    throw new Error("Delete failed");
  }
  return result.data;
}

export async function listAdminAudit(
  params: { limit?: number; offset?: number } = {},
): Promise<AdminAuditLog[]> {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  const path = `${BASE}/audit${query ? `?${query}` : ""}`;
  const result = await apiClient<AdminAuditLog[]>(path);
  return result.data ?? [];
}
