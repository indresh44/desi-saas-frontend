export interface CatalogItemApiResponse {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  unit: string;
  custom_unit: string | null;
  default_rate: number;
  gst_percent: number;
  is_active: boolean;
  deliverables: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CatalogItem {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  unit: string;
  customUnit: string | null;
  defaultRate: number;
  gstPercent: number;
  isActive: boolean;
  deliverables: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCatalogItemInput {
  name: string;
  description?: string | null;
  unit: string;
  custom_unit?: string | null;
  default_rate: number;
  gst_percent: number;
  deliverables?: string[] | null;
}

export interface UpdateCatalogItemInput {
  name?: string;
  description?: string | null;
  unit?: string;
  custom_unit?: string | null;
  default_rate?: number;
  gst_percent?: number;
  deliverables?: string[] | null;
}

export function toCatalogItemModel(raw: CatalogItemApiResponse): CatalogItem {
  return {
    id: raw.id,
    businessId: raw.business_id,
    name: raw.name,
    description: raw.description,
    unit: raw.unit,
    customUnit: raw.custom_unit,
    defaultRate: Number(raw.default_rate),
    gstPercent: Number(raw.gst_percent),
    isActive: raw.is_active,
    deliverables: raw.deliverables ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}
