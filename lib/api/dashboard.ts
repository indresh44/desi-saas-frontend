import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { fetchLeadFollowUps } from "@/lib/api/followups";
import { toLeadModel } from "@/lib/api/leads";
import { toNegativeAttempts } from "@/lib/api/resolve-followup";
import type { Lead } from "@/lib/types/lead";
import type {
  AssistantTasksResponse,
  DashboardPaymentSummary,
  TodayActivityResponse,
} from "@/lib/types/dashboard";
import type { LeadFollowUp } from "@/lib/types/followup";
import type {
  LeadContext,
  LeadContextApiResponse,
  LeadsNeedingActionApiResponse,
  NextActionType,
  OpenFollowupApi,
} from "@/lib/types/next-action";


// Local converter — `lib/api/followups.ts:toFollowUpModel` is module-private
// and the shape returned here is a strict subset (no enriched lead_title /
// customer_* fields), so duplicating is cheaper than exporting + widening.
function toOpenFollowupModel(raw: OpenFollowupApi): LeadFollowUp {
  return {
    id: raw.id,
    leadId: raw.lead_id,
    scheduledAt: raw.scheduled_at,
    note: raw.note,
    status: raw.status,
    createdBy: raw.created_by,
    createdAt: raw.created_at,
    completedAt: raw.completed_at,
    attemptCount: raw.attempt_count,
    lastOutcome: raw.last_outcome,
    negativeAttempts: toNegativeAttempts(raw.negative_attempts),
  };
}

export interface LeadsNeedingActionResult {
  items: Lead[];
  total: number;
  countsByType: Record<NextActionType, number>;
}

export interface LeadsNeedingActionWithFollowupsResult
  extends LeadsNeedingActionResult {
  /** Map of leadId -> the earliest pending follow-up for that lead, or
   * null if there isn't one (cascade types NO_FOLLOWUP_SET and some
   * GONE_QUIET rows). Populated by a per-lead fan-out — TODO: collapse
   * to a single round-trip once the backend includes `open_followup`
   * directly in the leads-needing-action response. */
  openFollowupByLeadId: Record<string, LeadFollowUp | null>;
}

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

export async function fetchLeadsNeedingAction(
  limit = 10,
): Promise<LeadsNeedingActionResult> {
  // Endpoint returns top-N + total + counts. We project the items through
  // `toLeadModel` so callers receive the same camel-cased `Lead` shape
  // they get from `fetchLeads()` — including the `nextAction` field and
  // the dashboard-only `openFollowup` (0044, bulk-stitched server-side).
  const result = await apiClient<LeadsNeedingActionApiResponse>(
    `${API_ENDPOINTS.dashboardLeadsNeedingAction}?limit=${limit}`,
    { method: "GET", cache: "no-store" },
  );
  return {
    items: result.data.items.map((item) => {
      const lead = toLeadModel(item);
      return {
        ...lead,
        openFollowup: item.open_followup
          ? toOpenFollowupModel(item.open_followup)
          : null,
      };
    }),
    total: result.data.total,
    countsByType: result.data.counts_by_type,
  };
}

export async function fetchLeadsNeedingActionWithFollowups(
  limit = 10,
): Promise<LeadsNeedingActionWithFollowupsResult> {
  const base = await fetchLeadsNeedingAction(limit);

  // Per-lead fan-out. Earliest pending wins; null when none exists.
  // Failures on individual leads degrade to null so one 5xx doesn't
  // sink the whole home page.
  const entries = await Promise.all(
    base.items.map(async (lead): Promise<[string, LeadFollowUp | null]> => {
      try {
        const followups = await fetchLeadFollowUps(lead.id);
        const earliestPending = followups
          .filter((f) => f.status === "pending")
          .sort(
            (a, b) =>
              new Date(a.scheduledAt).getTime() -
              new Date(b.scheduledAt).getTime(),
          )[0];
        return [lead.id, earliestPending ?? null];
      } catch {
        return [lead.id, null];
      }
    }),
  );

  return {
    ...base,
    openFollowupByLeadId: Object.fromEntries(entries),
  };
}

export async function fetchLeadContext(leadId: string): Promise<LeadContext> {
  const result = await apiClient<LeadContextApiResponse>(
    API_ENDPOINTS.leadContext(leadId),
    { method: "GET", cache: "no-store" },
  );
  const raw = result.data;
  return {
    enquiryNote: raw.enquiry_note,
    aiSummary: raw.ai_summary,
    recentFollowups: raw.recent_followups.map((f) => ({
      id: f.id,
      scheduledAt: f.scheduled_at,
      note: f.note,
      status: f.status,
      completedAt: f.completed_at,
    })),
    recentActivity: raw.recent_activity.map((a) => ({
      id: a.id,
      createdAt: a.created_at,
      type: a.type,
      description: a.description,
    })),
  };
}

export async function fetchTodayActivity(
  limit = 50,
): Promise<TodayActivityResponse> {
  // Bottom-of-dashboard daily diary. Owner actions only (the backend filters
  // actor_type=human); the response is already in snake_case shape the
  // component reads directly — no camel-case projection needed.
  const result = await apiClient<TodayActivityResponse>(
    `${API_ENDPOINTS.dashboardTodayActivity}?limit=${limit}`,
    { method: "GET", cache: "no-store" },
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
