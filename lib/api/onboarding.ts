import { apiClient } from "@/lib/api/client";

export interface HealthCheckResponse {
  ai_available: boolean;
}

export interface SetPersonaResponse {
  business_type: string;
  onboarding_status: string;
  pipeline_stages: { name: string; color: string }[];
}

export interface AddCatalogItemResponse {
  item_id: string;
  name: string;
  price: number;
}

export interface CompleteOnboardingResponse {
  onboarding_status: string;
}

export interface PipelinePreviewResponse {
  stages: { name: string; color: string }[];
}

export interface SetLanguageResponse {
  preferred_language: string;
}

export async function setLanguage(language: string): Promise<SetLanguageResponse> {
  const result = await apiClient<SetLanguageResponse>("/api/v1/onboarding/language", {
    method: "POST",
    body: { language },
  });
  return result.data;
}

export async function checkAiHealth(): Promise<HealthCheckResponse> {
  const result = await apiClient<HealthCheckResponse>("/api/v1/onboarding/health");
  return result.data;
}

export async function setPersona(
  persona: string,
  label?: string
): Promise<SetPersonaResponse> {
  const result = await apiClient<SetPersonaResponse>("/api/v1/onboarding/persona", {
    method: "POST",
    body: { persona, label },
  });
  return result.data;
}

export async function addCatalogItem(
  name: string,
  price: number
): Promise<AddCatalogItemResponse> {
  const result = await apiClient<AddCatalogItemResponse>(
    "/api/v1/onboarding/catalog-item",
    {
      method: "POST",
      body: { name, price },
    }
  );
  return result.data;
}

export async function completeOnboarding(
  method: string = "form"
): Promise<CompleteOnboardingResponse> {
  const result = await apiClient<CompleteOnboardingResponse>(
    "/api/v1/onboarding/complete",
    {
      method: "POST",
      body: { method },
    }
  );
  return result.data;
}

export async function getPipelinePreview(
  persona: string
): Promise<PipelinePreviewResponse> {
  const result = await apiClient<PipelinePreviewResponse>(
    `/api/v1/onboarding/pipeline-preview/${persona}`
  );
  return result.data;
}
