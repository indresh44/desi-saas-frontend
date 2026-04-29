"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, Trash2, X } from "lucide-react";
import type { Attachment } from "@/lib/types/attachment";

function isImage(mime: string | undefined, filename: string): boolean {
  if (mime?.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp)$/i.test(filename);
}

export function ActivityAttachmentStrip({
  attachments,
  onOpen,
}: {
  attachments: Attachment[];
  onOpen: (index: number) => void;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {attachments.map((att, idx) => {
        const showImage = isImage(undefined, att.filename);
        return (
          <button
            key={att.id}
            type="button"
            onClick={() => onOpen(idx)}
            className="group relative h-16 w-16 overflow-hidden rounded-md border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label={`Open ${att.filename}`}
          >
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={att.file_url}
                alt={att.filename}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            ) : (
              <span className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-[10px] text-muted-foreground">
                <FileText className="h-5 w-5" />
                PDF
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function ActivityAttachmentViewer({
  attachments,
  initialIndex,
  onClose,
  onDelete,
}: {
  attachments: Attachment[];
  initialIndex: number;
  onClose: () => void;
  onDelete: (attachmentId: string) => Promise<void>;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIndex((i) => Math.min(attachments.length - 1, i + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [attachments.length, onClose]);

  if (attachments.length === 0) return null;
  const current = attachments[Math.max(0, Math.min(index, attachments.length - 1))];
  if (!current) return null;
  const showImage = isImage(undefined, current.filename);

  const handleDelete = async () => {
    if (!confirm("Delete this attachment?")) return;
    setDeleting(true);
    try {
      await onDelete(current.id);
      if (attachments.length <= 1) {
        onClose();
      } else {
        setIndex((i) => Math.max(0, Math.min(i, attachments.length - 2)));
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-white">
        <div className="min-w-0 flex-1 truncate text-sm">
          {current.filename}
          <span className="ml-2 text-xs text-white/60">
            {index + 1} / {attachments.length}
          </span>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="ml-2 rounded p-1.5 text-white/80 hover:bg-white/10 hover:text-red-400 disabled:opacity-50"
          aria-label="Delete attachment"
        >
          <Trash2 className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="ml-1 rounded p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {index > 0 ? (
          <button
            type="button"
            onClick={() => setIndex((i) => i - 1)}
            className="absolute left-2 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        ) : null}

        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.file_url}
            alt={current.filename}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-white">
            <FileText className="h-16 w-16" />
            <a
              href={current.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
            >
              Open PDF
            </a>
          </div>
        )}

        {index < attachments.length - 1 ? (
          <button
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            className="absolute right-2 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
