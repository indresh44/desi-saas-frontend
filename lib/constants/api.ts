const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const rawDefaultUserId = process.env.NEXT_PUBLIC_DEFAULT_USER_ID;

export const API_BASE_URL = rawApiBaseUrl
  ? rawApiBaseUrl.replace(/\/$/, "")
  : "http://172.105.53.206:8000";

export const DEFAULT_USER_ID = rawDefaultUserId?.trim() || "ba61cf8f-d920-4bc0-88d0-b2773fd60a9d";

export const API_ENDPOINTS = {
  leads: "/api/v1/leads",
  customersSearch: "/api/v1/customers/search",
  customersByPhone: "/api/v1/customers/by-phone",
  customers: "/api/v1/customers",
  whatsappConversations: "/api/v1/whatsapp/conversations",
  whatsappMessages: "/api/v1/whatsapp/conversations",
  whatsappSendText: "/api/v1/whatsapp/messages/text",
  whatsappFindOrCreate: "/api/v1/whatsapp/conversations/find-or-create-by-lead",
  pipelines: "/api/v1/pipelines",
  pipelineStages: "/api/v1/pipeline-stages",
  leadFollowUps: "/api/v1/lead_followups",
  leadFollowUpsToday: "/api/v1/lead_followups/today",
  leadActivities: "/api/v1/lead_activities",
  invoices: "/api/v1/invoices",
  payments: "/api/v1/payments",
  tasks: "/api/v1/tasks",
  catalogItems: "/api/v1/catalog-items",
  customerOutstanding: (id: string) => `/api/v1/customers/${id}/outstanding`,
} as const;