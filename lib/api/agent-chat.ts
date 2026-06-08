/**
 * Client for the agent-chat surface. One thin function per endpoint; all share
 * the project-wide apiClient<T> for bearer-token + 401-retry.
 */

import { apiClient } from "@/lib/api/client";
import type {
  AgentChatEnvelope,
  AgentChatSessionDetail,
  AgentChatSessionSummary,
} from "@/lib/types/agent-chat";

interface SessionListResponse {
  sessions: AgentChatSessionSummary[];
}

export async function createAgentChatSession(
  title?: string | null,
): Promise<AgentChatSessionSummary> {
  const { data } = await apiClient<AgentChatSessionSummary>(
    "/api/v1/agent-chat/sessions",
    { method: "POST", body: { title: title ?? null } },
  );
  return data;
}

export async function listAgentChatSessions(
  limit = 50,
): Promise<AgentChatSessionSummary[]> {
  const { data } = await apiClient<SessionListResponse>(
    `/api/v1/agent-chat/sessions?limit=${limit}`,
  );
  return data.sessions;
}

export async function getAgentChatSession(
  sessionId: string,
): Promise<AgentChatSessionDetail> {
  const { data } = await apiClient<AgentChatSessionDetail>(
    `/api/v1/agent-chat/sessions/${sessionId}`,
  );
  return data;
}

export async function sendAgentChatMessage(
  sessionId: string,
  message: string,
): Promise<AgentChatEnvelope> {
  const { data } = await apiClient<AgentChatEnvelope>(
    `/api/v1/agent-chat/sessions/${sessionId}/message`,
    { method: "POST", body: { message } },
  );
  return data;
}

export async function confirmAgentChatAction(
  sessionId: string,
  preparedActionId: string,
  edits?: Record<string, unknown>,
): Promise<AgentChatEnvelope> {
  const { data } = await apiClient<AgentChatEnvelope>(
    `/api/v1/agent-chat/sessions/${sessionId}/confirm`,
    {
      method: "POST",
      body: { prepared_action_id: preparedActionId, edits: edits ?? null },
    },
  );
  return data;
}

export async function cancelAgentChatAction(
  sessionId: string,
  preparedActionId: string,
): Promise<AgentChatEnvelope> {
  const { data } = await apiClient<AgentChatEnvelope>(
    `/api/v1/agent-chat/sessions/${sessionId}/cancel`,
    { method: "POST", body: { prepared_action_id: preparedActionId } },
  );
  return data;
}

/**
 * Dismiss a stuck ask_user task — the escape hatch for the dashboard's
 * needs_input bucket. The endpoint name is generic
 * (/sessions/{id}/tasks/{task_id}/dismiss) but the backend refuses
 * anything other than an ask_user task, so this can't accidentally
 * skip a prepared write's confirm flow.
 */
export async function dismissAgentChatTask(
  sessionId: string,
  taskId: string,
): Promise<AgentChatEnvelope> {
  const { data } = await apiClient<AgentChatEnvelope>(
    `/api/v1/agent-chat/sessions/${sessionId}/tasks/${taskId}/dismiss`,
    { method: "POST" },
  );
  return data;
}
