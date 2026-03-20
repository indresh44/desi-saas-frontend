import { apiClient } from "./client";
import { API_BASE_URL } from "../constants/api";
import {
  BusinessSettingsApiResponse,
  BusinessSettings,
  UpdateBusinessSettingsInput,
  toBusinessSettings,
} from "../types/business-settings";
import { getAccessToken } from "../auth/token-store";

export async function fetchBusinessSettings(): Promise<BusinessSettings> {
  const { data } = await apiClient<BusinessSettingsApiResponse>("/api/v1/businesses/settings");
  return toBusinessSettings(data);
}

export async function updateBusinessSettings(
  input: UpdateBusinessSettingsInput,
): Promise<BusinessSettings> {
  const { data } = await apiClient<BusinessSettingsApiResponse>("/api/v1/businesses/settings", {
    method: "PATCH",
    body: input,
  });
  return toBusinessSettings(data);
}

export async function uploadBusinessLogo(file: File): Promise<BusinessSettings> {
  const formData = new FormData();
  formData.append("file", file);

  const accessToken = getAccessToken();
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/businesses/logo`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Failed to upload logo");
  }

  const data: BusinessSettingsApiResponse = await res.json();
  return toBusinessSettings(data);
}
