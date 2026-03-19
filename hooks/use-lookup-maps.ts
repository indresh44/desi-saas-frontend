"use client";

import { useEffect, useState } from "react";
import { fetchAllStages } from "@/lib/api/pipelines";
import type { PipelineStage } from "@/lib/types/pipeline";

export function useLookupMaps() {
  const [stageMap, setStageMap] = useState<Record<string, PipelineStage>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllStages()
      .then((stages) => {
        setStageMap(Object.fromEntries(stages.map((s) => [s.id, s])));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return { stageMap, isLoading };
}
