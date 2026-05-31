import type { LeadFollowUp } from "@/lib/types/followup";
import type { NextActionSummary } from "@/lib/types/next-action";

export type LeadApiResponseItem = {
  customer_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  stage_id: string;
  stage_name: string | null;
  stage_color: string | null;
  title: string;
  source: string | null;
  service_date: string | null;
  estimated_value: string | null;
  assigned_to: string | null;
  notes: string | null;
  business_id: string;
  id: string;
  created_at: string;
  updated_at: string;
  // Backend started returning this from `GET /leads` and
  // `GET /leads/{id}` after the next-action cascade shipped. Optional
  // here so older deploys / responses without it don't break the parser.
  next_action?: NextActionSummary | null;
};

export type Lead = {
  customerId: string;
  customerName: string | null;
  customerPhone: string | null;
  stageId: string;
  stageName: string | null;
  stageColor: string | null;
  title: string;
  source: string | null;
  serviceDate: string | null;
  estimatedValue: string | null;
  assignedTo: string | null;
  notes: string | null;
  businessId: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  // Per-lead next action computed server-side. NULL when the backend
  // didn't provide one (older deploy, or terminal lead's NONE branch
  // collapses to null on the frontend side — see `toLeadModel`).
  nextAction: NextActionSummary | null;
  // 0044 — populated only by the dashboard's leads-needing-action endpoint
  // (which bulk-stitches the lead's earliest pending follow-up). Other
  // endpoints leave this undefined; consumers must treat undefined and
  // null as equivalent ("no open follow-up").
  openFollowup?: LeadFollowUp | null;
};

export type CreateLeadInput = {
  customerId: string;
  stageId: string;
  title: string;
  source?: string | null;
  serviceDate?: string | null;
  estimatedValue?: string | null;
  assignedTo?: string | null;
  notes?: string | null;
  businessId: string;
};