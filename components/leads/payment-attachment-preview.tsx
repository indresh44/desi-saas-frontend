"use client";

import { useEffect, useState } from "react";
import { fetchPaymentAttachments } from "@/lib/api/invoices";
import type { PaymentAttachment } from "@/lib/types/invoice";

type Props = {
  paymentId: string;
};

function getAttachmentExtension(attachment: PaymentAttachment): string {
  const source = attachment.filename || attachment.file_url;
  const cleanSource = source.split("?")[0]?.split("#")[0] ?? "";
  const parts = cleanSource.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

export function PaymentAttachmentPreview({ paymentId }: Props) {
  const [attachments, setAttachments] = useState<PaymentAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAttachments = async () => {
      setIsLoading(true);

      try {
        const data = await fetchPaymentAttachments(paymentId);
        if (isMounted) {
          setAttachments(data);
        }
      } catch {
        if (isMounted) {
          setAttachments([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadAttachments();

    return () => {
      isMounted = false;
    };
  }, [paymentId]);

  if (isLoading) {
    return <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />;
  }

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((attachment) => {
        const extension = getAttachmentExtension(attachment);
        const isImage = extension === "jpg" || extension === "jpeg" || extension === "png";
        const isPdf = extension === "pdf";

        if (isImage) {
          return (
            <a
              key={attachment.id}
              href={attachment.file_url}
              target="_blank"
              rel="noopener noreferrer"
              title={attachment.filename}
            >
              <img
                src={attachment.file_url}
                alt={attachment.filename}
                className="h-12 w-12 rounded border border-gray-200 object-cover transition hover:opacity-80"
              />
            </a>
          );
        }

        if (isPdf) {
          return (
            <a
              key={attachment.id}
              href={attachment.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600 transition hover:bg-red-100"
            >
              <span aria-hidden="true">📄</span>
              <span>{attachment.filename}</span>
            </a>
          );
        }

        return null;
      })}
    </div>
  );
}