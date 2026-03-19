import { apiClient } from "@/lib/api/client";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  DEFAULT_USER_ID,
} from "@/lib/constants/api";
import {
  CreateLeadInput,
  Lead,
  LeadApiResponseItem,
} from "@/lib/types/lead";

function toLeadModel(item: LeadApiResponseItem): Lead {
  return {
    customerId: item.customer_id,
    customerName: item.customer_name,
    customerPhone: item.customer_phone,
    stageId: item.stage_id,
    stageName: item.stage_name,
    stageColor: item.stage_color,
    title: item.title,
    source: item.source,
    serviceDate: item.service_date,
    estimatedValue: item.estimated_value,
    assignedTo: item.assigned_to,
    notes: item.notes,
    businessId: item.business_id,
    id: item.id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function toCreateLeadPayload(input: CreateLeadInput) {
  return {
    customer_id: input.customerId,
    stage_id: input.stageId,
    title: input.title,
    source: input.source,
    service_date: input.serviceDate,
    estimated_value: input.estimatedValue,
    assigned_to: input.assignedTo ?? null,
    notes: input.notes,
    business_id: input.businessId,
  };
}

function isLeadApiResponseItem(value: unknown): value is LeadApiResponseItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.customer_id === "string" &&
    typeof obj.stage_id === "string" &&
    typeof obj.title === "string"
  );
}

function getUserHeader(userId: string) {
  return {
    "X-User-Id": userId || DEFAULT_USER_ID,
  };
}

function withQuery(base: string, params: Record<string, string | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value!)}`)
    .join("&");
  return qs ? `${base}?${qs}` : base;
}

export async function fetchLeads(
  filters?: { customer_id?: string },
  userId = DEFAULT_USER_ID
): Promise<Lead[]> {
  const path = withQuery(API_ENDPOINTS.leads, {
    customer_id: filters?.customer_id,
  });

  const result = await apiClient<LeadApiResponseItem[]>(path, {
    method: "GET",
    headers: getUserHeader(userId),
    cache: "no-store",
  });

  return result.data.map(toLeadModel);
}

export async function createLead(
  input: CreateLeadInput,
  userId = DEFAULT_USER_ID
): Promise<Lead | null> {
  const payload = toCreateLeadPayload(input);

  const result = await apiClient<LeadApiResponseItem | null>(
    API_ENDPOINTS.leads,
    {
      method: "POST",
      headers: getUserHeader(userId),
      body: payload,
    }
  );

  if (!result.data) {
    return null;
  }

  return toLeadModel(result.data);
}

export async function moveLeadStage(
  leadId: string,
  stageId: string,
  userId = DEFAULT_USER_ID
): Promise<Lead | null> {
  const path = `${API_ENDPOINTS.leads}/${leadId}/move`;
  const headers = new Headers(getUserHeader(userId));
  headers.set("Content-Type", "application/json");

  const response = await fetch(
    `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ stage_id: stageId }),
    }
  );

  if (!response.ok) {
    const fallbackMessage = "Failed to move stage";
    let errorMessage = fallbackMessage;

    try {
      const errorBody = (await response.json()) as { message?: string };
      if (errorBody.message) {
        errorMessage = errorBody.message;
      }
    } catch {
      errorMessage = response.statusText || fallbackMessage;
    }

    throw { message: errorMessage, status: response.status };
  }

  const rawText = await response.text();
  if (!rawText) {
    return null;
  }

  const parsed = JSON.parse(rawText) as
    | LeadApiResponseItem
    | { lead?: LeadApiResponseItem | null }
    | null;

  if (!parsed) {
    return null;
  }

  let leadItem: LeadApiResponseItem | null = null;

  if (typeof parsed === "object" && "lead" in parsed) {
    if (isLeadApiResponseItem(parsed.lead)) {
      leadItem = parsed.lead;
    }
  } else if (isLeadApiResponseItem(parsed)) {
    leadItem = parsed;
  }

  if (!leadItem) {
    return null;
  }

  return toLeadModel(leadItem);
}