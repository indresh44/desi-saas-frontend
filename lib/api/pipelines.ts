import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { Pipeline, PipelineStage } from "@/lib/types/pipeline";

type PipelineApiResponse = {
  id: string;
  name: string;
  business_id: string;
  created_at: string;
};

type PipelineStageApiResponse = {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  color: string;
};

function withQuery(path: string, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

function toPipelineModel(raw: PipelineApiResponse): Pipeline {
  return {
    id: raw.id,
    name: raw.name,
    businessId: raw.business_id,
    createdAt: raw.created_at,
  };
}

function toPipelineStageModel(raw: PipelineStageApiResponse): PipelineStage {
  return {
    id: raw.id,
    pipelineId: raw.pipeline_id,
    name: raw.name,
    position: raw.position,
    color: raw.color,
  };
}

export async function fetchPipelines(): Promise<Pipeline[]> {
  const result = await apiClient<PipelineApiResponse[]>(API_ENDPOINTS.pipelines, {
    method: "GET",
    cache: "no-store",
  });

  return result.data.map(toPipelineModel);
}

export async function fetchPipelineStages(
  pipelineId: string
): Promise<PipelineStage[]> {
  const path = withQuery(API_ENDPOINTS.pipelineStages, { pipeline_id: pipelineId });

  const result = await apiClient<PipelineStageApiResponse[]>(path, {
    method: "GET",
    cache: "no-store",
  });

  return result.data.map(toPipelineStageModel);
}

export async function fetchAllStages(): Promise<PipelineStage[]> {
  const result = await apiClient<PipelineStageApiResponse[]>(API_ENDPOINTS.pipelineStages, {
    method: "GET",
    cache: "no-store",
  });

  return result.data.map(toPipelineStageModel);
}
