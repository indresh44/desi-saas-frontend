"use client";

import Image from "next/image";

export type PreviewAttachment = {
  id: string;
  filename: string;
  file_url: string;
};

type Props = {
  attachments: PreviewAttachment[];
  maxVisible?: number;
  onSelect: (index: number) => void;
  emptyLabel?: string;
};

function extensionOf(attachment: PreviewAttachment): string {
  const source = attachment.filename || attachment.file_url;
  const clean = source.split("?")[0]?.split("#")[0] ?? "";
  const parts = clean.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function isImage(attachment: PreviewAttachment): boolean {
  const ext = extensionOf(attachment);
  return ext === "jpg" || ext === "jpeg" || ext === "png";
}

function isPdf(attachment: PreviewAttachment): boolean {
  return extensionOf(attachment) === "pdf";
}

export function AttachmentThumbnailStrip({
  attachments,
  maxVisible = 4,
  onSelect,
  emptyLabel = "No files",
}: Props) {
  if (attachments.length === 0) {
    return <span className="text-xs text-muted-foreground">{emptyLabel}</span>;
  }

  const visible = attachments.slice(0, maxVisible);
  const extra = attachments.length - visible.length;

  return (
    <div className="flex items-center gap-1.5">
      {visible.map((attachment, index) => {
        if (isImage(attachment)) {
          return (
            <button
              key={attachment.id}
              type="button"
              onClick={() => onSelect(index)}
              className="relative h-10 w-10 overflow-hidden rounded border border-border hover:border-zinc-400"
              title={attachment.filename}
            >
              <Image
                src={attachment.file_url}
                alt={attachment.filename}
                fill
                sizes="40px"
                unoptimized
                className="object-cover"
              />
            </button>
          );
        }

        if (isPdf(attachment)) {
          return (
            <button
              key={attachment.id}
              type="button"
              onClick={() => onSelect(index)}
              className="flex h-10 w-10 items-center justify-center rounded border border-red-200 bg-red-50 text-[10px] font-semibold text-red-600 hover:bg-red-100"
              title={attachment.filename}
            >
              PDF
            </button>
          );
        }

        return (
          <button
            key={attachment.id}
            type="button"
            onClick={() => onSelect(index)}
            className="flex h-10 w-10 items-center justify-center rounded border border-border bg-muted text-[10px] text-muted-foreground hover:bg-muted"
            title={attachment.filename}
          >
            FILE
          </button>
        );
      })}

      {extra > 0 ? (
        <button
          type="button"
          onClick={() => onSelect(maxVisible - 1)}
          className="flex h-10 min-w-10 items-center justify-center rounded border border-border bg-muted px-2 text-xs text-muted-foreground hover:bg-muted"
          title={`${extra} more`}
        >
          +{extra}
        </button>
      ) : null}
    </div>
  );
}
