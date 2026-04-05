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