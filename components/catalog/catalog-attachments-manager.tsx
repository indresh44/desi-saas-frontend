"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileImage, FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ACCEPTED_ATTACHMENT_FILE_TYPES,
  MAX_ATTACHMENT_FILE_SIZE_BYTES,
} from "@/lib/api/attachments";
import {
  deleteCatalogAttachment,
  fetchCatalogAttachments,
  uploadCatalogAttachment,
} from "@/lib/api/catalog-items";
import type { Attachment } from "@/lib/types/attachment";

type Props = {
  catalogItemId: string;
};

function isImageAttachment(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ext === "jpg" || ext === "jpeg" || ext === "png";
}

function isPdfAttachment(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ext === "pdf";
}

export function CatalogAttachmentsManager({ catalogItemId }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selectedPreviews = useMemo(
    () =>
      selectedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      selectedPreviews.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [selectedPreviews]);

  const loadAttachments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCatalogAttachments(catalogItemId);
      setAttachments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load attachments");
    } finally {
      setIsLoading(false);
    }
  }, [catalogItemId]);

  useEffect(() => {
    void loadAttachments();
  }, [loadAttachments]);

  const onPickFiles = (files: FileList | null) => {
    if (!files) return;

    const incoming = Array.from(files);
    const valid: File[] = [];

    for (const file of incoming) {
      if (!ACCEPTED_ATTACHMENT_FILE_TYPES.includes(file.type)) {
        setError(`Unsupported file type for ${file.name}. Use JPG, PNG, or PDF.`);
        continue;
      }
      if (file.size > MAX_ATTACHMENT_FILE_SIZE_BYTES) {
        setError(`File ${file.name} exceeds 10MB.`);
        continue;
      }
      valid.push(file);
    }

    if (valid.length > 0) {
      setError(null);
      setSelectedFiles((prev) => [...prev, ...valid]);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const onUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);
    try {
      for (const file of selectedFiles) {
        await uploadCatalogAttachment(catalogItemId, file);
      }
      setSelectedFiles([]);
      await loadAttachments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const onDelete = async (attachmentId: string) => {
    setDeletingId(attachmentId);
    setError(null);
    try {
      await deleteCatalogAttachment(attachmentId);
      setAttachments((prev) => prev.filter((item) => item.id !== attachmentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete attachment");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Attachments</h3>
          <p className="text-xs text-zinc-500">Upload multiple JPG, PNG, or PDF files (max 10MB each).</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          multiple
          className="hidden"
          onChange={(event) => onPickFiles(event.target.files)}
          disabled={isUploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4" />
          Choose files
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      {selectedPreviews.length > 0 ? (
        <div className="space-y-2 rounded-md bg-zinc-50 p-2">
          {selectedPreviews.map((item) => (
            <div key={`${item.name}-${item.size}`} className="flex items-center gap-2">
              {item.previewUrl ? (
                <img src={item.previewUrl} alt={item.name} className="h-10 w-10 rounded object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-zinc-200 text-zinc-600">
                  <FileText className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-zinc-800">{item.name}</p>
                <p className="text-xs text-zinc-500">{(item.size / 1024).toFixed(0)} KB</p>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <Button type="button" size="sm" onClick={onUpload} disabled={isUploading}>
              {isUploading ? "Uploading..." : `Upload ${selectedPreviews.length} file(s)`}
            </Button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="h-10 animate-pulse rounded bg-zinc-100" />
      ) : attachments.length === 0 ? (
        <p className="text-xs text-zinc-500">No attachments added yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {attachments.map((attachment) => {
            const isImage = isImageAttachment(attachment.filename);
            const isPdf = isPdfAttachment(attachment.filename);

            return (
              <div key={attachment.id} className="rounded-md border border-zinc-200 p-2">
                <a href={attachment.file_url} target="_blank" rel="noopener noreferrer" className="block">
                  {isImage ? (
                    <img
                      src={attachment.file_url}
                      alt={attachment.filename}
                      className="h-24 w-full rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-full items-center justify-center rounded bg-zinc-100 text-zinc-600">
                      {isPdf ? <FileText className="h-6 w-6" /> : <FileImage className="h-6 w-6" />}
                    </div>
                  )}
                </a>
                <div className="mt-2 flex items-start justify-between gap-2">
                  <a
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="line-clamp-2 text-xs text-zinc-700 hover:text-zinc-900"
                    title={attachment.filename}
                  >
                    {attachment.filename}
                  </a>
                  <button
                    type="button"
                    onClick={() => onDelete(attachment.id)}
                    className="text-zinc-400 hover:text-red-600"
                    disabled={deletingId === attachment.id}
                    title="Delete attachment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
