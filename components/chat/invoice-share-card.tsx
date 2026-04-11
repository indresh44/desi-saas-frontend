"use client";

import { useState } from "react";
import { ExternalLink, Loader2, Share2 } from "lucide-react";
import { shareInvoicePdf, buildBrandedInvoiceUrl } from "@/lib/utils/share";

interface InvoiceShareCardProps {
  invoiceId: string;
  invoiceNumber: string;
}

export function InvoiceShareCard({ invoiceId, invoiceNumber }: InvoiceShareCardProps) {
  const [isSharing, setIsSharing] = useState(false);

  const brandedUrl = buildBrandedInvoiceUrl(invoiceId, invoiceNumber);

  async function handleShare() {
    setIsSharing(true);
    try {
      const result = await shareInvoicePdf(invoiceId, invoiceNumber);
      if (result === "error") {
        const message = `Hi, please find your Invoice ${invoiceNumber}.\n\nView & download: ${brandedUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share failed:", error);
      }
    } finally {
      setIsSharing(false);
    }
  }

  function handleView() {
    window.open(brandedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mt-1.5 overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-teal-50">
          <ExternalLink className="h-4 w-4 text-teal-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">
            {invoiceNumber}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Share with your customer
          </p>
        </div>
      </div>

      <div className="flex border-t border-border">
        <button
          type="button"
          onClick={() => void handleShare()}
          disabled={isSharing}
          className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          {isSharing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Share2 className="h-3.5 w-3.5" />
          )}
          Share
        </button>

        <div className="w-px bg-muted" />

        <button
          type="button"
          onClick={handleView}
          className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium text-teal-600 transition-colors hover:bg-teal-50"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Invoice
        </button>
      </div>
    </div>
  );
}
