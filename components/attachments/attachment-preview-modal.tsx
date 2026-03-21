"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PreviewAttachment } from "@/components/attachments/attachment-thumbnail-strip";

type Props = {
  attachments: PreviewAttachment[];
  startIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (attachmentId: string) => Promise<void>;
};

function getExtension(attachment: PreviewAttachment): string {
  const source = attachment.filename || attachment.file_url;
  const cleanSource = source.split("?")[0]?.split("#")[0] ?? "";
  const parts = cleanSource.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function isImage(attachment: PreviewAttachment): boolean {
  const extension = getExtension(attachment);
  return extension === "jpg" || extension === "jpeg" || extension === "png";
}

function isPdf(attachment: PreviewAttachment): boolean {
  return getExtension(attachment) === "pdf";
}

export function AttachmentPreviewModal({
  attachments,
  startIndex,
  isOpen,
  onClose,
  onDelete,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentAttachment = attachments[currentIndex];

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex, isOpen]);

  if (!isOpen || !currentAttachment) {
    return null;
  }

  const total = attachments.length;

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(currentAttachment.id);
      if (total <= 1) {
        onClose();
      } else {
        setCurrentIndex((prev) => (prev >= total - 1 ? total - 2 : prev));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close preview"
        className="fixed inset-0 z-40 bg-black/65"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{currentAttachment.filename}</p>
              <p className="text-xs text-zinc-400">
                {currentIndex + 1} / {total}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={currentAttachment.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded border border-zinc-700 px-2 py-1 text-xs hover:bg-zinc-900"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open
              </a>
              {onDelete ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="border-red-700 bg-transparent text-red-300 hover:bg-red-950 hover:text-red-200"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              ) : null}
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative flex h-[72vh] items-center justify-center bg-zinc-900">
            {total > 1 ? (
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-zinc-700 bg-zinc-950/90 p-2 text-zinc-200 hover:bg-zinc-900"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : null}

            <div className="h-full w-full p-4">
              {isImage(currentAttachment) ? (
                <div className="relative h-full w-full">
                  <Image
                    src={currentAttachment.file_url}
                    alt={currentAttachment.filename}
                    fill
                    sizes="100vw"
                    unoptimized
                    className="rounded object-contain"
                  />
                </div>
              ) : isPdf(currentAttachment) ? (
                <iframe
                  src={currentAttachment.file_url}
                  className="h-full w-full rounded border border-zinc-800 bg-white"
                  title={currentAttachment.filename}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <a
                    href={currentAttachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
                  >
                    Open file
                  </a>
                </div>
              )}
            </div>

            {total > 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-zinc-700 bg-zinc-950/90 p-2 text-zinc-200 hover:bg-zinc-900"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
