"use client";

import { useEffect, useState } from "react";
import { AttachmentPreviewModal } from "@/components/attachments/attachment-preview-modal";
import { AttachmentThumbnailStrip } from "@/components/attachments/attachment-thumbnail-strip";
import { fetchPaymentAttachments } from "@/lib/api/invoices";
import type { PaymentAttachment } from "@/lib/types/invoice";

type Props = {
  paymentId: string;
};

export function PaymentAttachmentPreview({ paymentId }: Props) {
  const [attachments, setAttachments] = useState<PaymentAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

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

  const openPreview = (index: number) => {
    setPreviewIndex(index);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <AttachmentThumbnailStrip
        attachments={attachments}
        maxVisible={4}
        onSelect={openPreview}
      />

      <AttachmentPreviewModal
        attachments={attachments}
        startIndex={previewIndex}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  );
}