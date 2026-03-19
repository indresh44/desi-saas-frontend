export type TaskStatus = "pending" | "in_progress" | "done";

export interface Task {
  id: string;
  businessId: string;
  leadId: string | null;
  title: string;
  assignedTo: string;
  status: TaskStatus;
  dueDate: string | null;
  priority: number;
  createdAt: string;
}

export interface CreateTaskInput {
  lead_id: string;
  title: string;
  assigned_to: string;
  due_date?: string;
  priority: number;
  status: TaskStatus;
}
