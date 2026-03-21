import { apiClient } from "@/lib/api/client";
import type { Attachment, AttachmentEntityType } from "@/lib/types/attachment";

export const ACCEPTED_ATTACHMENT_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

export const MAX_ATTACHMENT_FILE_SIZE_BYTES = 10 * 1024 * 1024;

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

export async function fetchAttachments(
  entityType: AttachmentEntityType,
  entityId: string
): Promise<Attachment[]> {
  const path = withQuery("/api/v1/attachments", {
    entity_type: entityType,
    entity_id: entityId,
  });

  const result = await apiClient<Attachment[]>(path, {
    method: "GET",
    cache: "no-store",
  });

  return result.data;
}

export async function fetchAttachmentsBatch(
  entityType: AttachmentEntityType,
  entityIds: string[]
): Promise<Record<string, Attachment[]>> {
  if (entityIds.length === 0) {
    return {};
  }

  const searchParams = new URLSearchParams();
  searchParams.set("entity_type", entityType);
  entityIds.forEach((entityId) => searchParams.append("entity_ids", entityId));

  const result = await apiClient<Record<string, Attachment[]>>(
    `/api/v1/attachments/batch?${searchParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  return result.data;
}

export async function uploadAttachment(
  entityType: AttachmentEntityType,
  entityId: string,
  file: File
): Promise<Attachment> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("entity_type", entityType);
  formData.append("entity_id", entityId);

  const result = await apiClient<Attachment>("/api/v1/attachments/upload", {
    method: "POST",
    body: formData,
  });

  return result.data;
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  await apiClient<void>(`/api/v1/attachments/${attachmentId}`, {
    method: "DELETE",
  });
}
