import { apiClient } from "./client";
import {
  CatalogItem,
  CatalogItemApiResponse,
  CreateCatalogItemInput,
  UpdateCatalogItemInput,
  toCatalogItemModel,
} from "../types/catalog-item";

function withQuery(
  base: string,
  params: Record<string, string | undefined>
): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join("&");
  return qs ? `${base}?${qs}` : base;
}

// List catalog items (default: active only)
export async function fetchCatalogItems(
  search?: string,
  isActive: boolean = true
): Promise<CatalogItem[]> {
  const path = withQuery("/api/v1/catalog-items", {
    search,
    is_active: String(isActive),
  });
  const { data } = await apiClient<CatalogItemApiResponse[]>(path);
  return data.map(toCatalogItemModel);
}

// Create a catalog item
export async function createCatalogItem(
  input: CreateCatalogItemInput
): Promise<CatalogItem> {
  const { data } = await apiClient<CatalogItemApiResponse>(
    "/api/v1/catalog-items",
    {
      method: "POST",
      body: input,
    }
  );
  return toCatalogItemModel(data);
}

// Update a catalog item
export async function updateCatalogItem(
  itemId: string,
  input: UpdateCatalogItemInput
): Promise<CatalogItem> {
  const { data } = await apiClient<CatalogItemApiResponse>(
    `/api/v1/catalog-items/${itemId}`,
    {
      method: "PATCH",
      body: input,
    }
  );
  return toCatalogItemModel(data);
}

// Deactivate (soft delete) a catalog item
export async function deactivateCatalogItem(
  itemId: string
): Promise<CatalogItem> {
  const { data } = await apiClient<CatalogItemApiResponse>(
    `/api/v1/catalog-items/${itemId}`,
    {
      method: "DELETE",
    }
  );
  return toCatalogItemModel(data);
}

// Search catalog items (for typeahead in quote/invoice forms — used later)
// This is the same as fetchCatalogItems with a search param, exported separately
// for semantic clarity in other components.
export async function searchCatalogItems(
  query: string
): Promise<CatalogItem[]> {
  return fetchCatalogItems(query, true);
}
