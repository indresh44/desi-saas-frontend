import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type { DashboardPaymentSummary } from "@/lib/types/dashboard";

export async function fetchDashboardPaymentSummary(): Promise<DashboardPaymentSummary> {
  const result = await apiClient<DashboardPaymentSummary>(
    API_ENDPOINTS.dashboardPaymentSummary,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  return result.data;
}
