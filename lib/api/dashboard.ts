import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type {
  AssistantTasksResponse,
  DashboardPaymentSummary,
} from "@/lib/types/dashboard";

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

export async function fetchAssistantTasks(
  recentlyDoneLimit = 10,
): Promise<AssistantTasksResponse> {
  // Sibling endpoint (not an extension of payment-summary). Backend caps
  // recentlyDoneLimit at 50 server-side so a degenerate request can't
  // bloat the response.
  const result = await apiClient<AssistantTasksResponse>(
    `${API_ENDPOINTS.dashboardAssistantTasks}?recently_done_limit=${recentlyDoneLimit}`,
    { method: "GET", cache: "no-store" },
  );
  return result.data;
}
