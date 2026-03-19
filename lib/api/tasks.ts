import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { CreateTaskInput, Task, TaskStatus } from "@/lib/types/task";

type TaskApiResponse = {
  id: string;
  business_id: string;
  lead_id: string | null;
  title: string;
  assigned_to: string;
  status: "pending" | "in_progress" | "done";
  due_date: string | null;
  priority: number;
  created_at: string;
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

function toTaskModel(raw: TaskApiResponse): Task {
  return {
    id: raw.id,
    businessId: raw.business_id,
    leadId: raw.lead_id,
    title: raw.title,
    assignedTo: raw.assigned_to,
    status: raw.status,
    dueDate: raw.due_date,
    priority: raw.priority,
    createdAt: raw.created_at,
  };
}

export async function fetchLeadTasks(
  leadId: string
): Promise<Task[]> {
  const path = withQuery(API_ENDPOINTS.tasks, { lead_id: leadId });

  const result = await apiClient<TaskApiResponse[]>(path, {
    method: "GET",
    cache: "no-store",
  });

  return result.data.map(toTaskModel);
}

export async function createTask(
  input: CreateTaskInput
): Promise<Task> {
  const result = await apiClient<TaskApiResponse>(API_ENDPOINTS.tasks, {
    method: "POST",
    body: input,
  });

  return toTaskModel(result.data);
}

export async function updateTask(
  id: string,
  data: Partial<{ status: TaskStatus }>
): Promise<Task> {
  const result = await apiClient<TaskApiResponse>(`${API_ENDPOINTS.tasks}/${id}`, {
    method: "PATCH",
    body: data,
  });

  return toTaskModel(result.data);
}
