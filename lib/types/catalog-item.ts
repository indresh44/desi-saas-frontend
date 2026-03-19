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
}

export interface UpdateCatalogItemInput {
  name?: string;
  description?: string | null;
  unit?: string;
  custom_unit?: string | null;
  default_rate?: number;
  gst_percent?: number;
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
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}
