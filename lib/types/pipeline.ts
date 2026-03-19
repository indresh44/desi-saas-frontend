export interface Pipeline {
  id: string;
  name: string;
  businessId: string;
  createdAt: string;
}

export interface PipelineStage {
  id: string;
  pipelineId: string;
  name: string;
  position: number;
  color: string;
}
