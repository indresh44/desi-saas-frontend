const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const API_BASE_URL = rawApiBaseUrl
  ? rawApiBaseUrl.replace(/\/$/, "")
  // : "http://172.105.53.206:8000";
  : "http://localhost:8000"

export const API_ENDPOINTS = {
  leads: "/api/v1/leads",
  customersSearch: "/api/v1/customers/search",
  customersByPhone: "/api/v1/customers/by-phone",
  customers: "/api/v1/customers",
  customerById: (id: string) => `/api/v1/customers/${id}`,
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
  meetings: "/api/v1/meetings",
  dashboardPaymentSummary: "/api/v1/dashboard/payment-summary",
  customerOutstanding: (id: string) => `/api/v1/customers/${id}/outstanding`,
  invoiceById: (id: string) => `/api/v1/invoices/${id}`,
} as const;