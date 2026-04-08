"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Maximize2,
  MessageCircle,
  Share2,
} from "lucide-react";
import { shareInvoicePdf, buildBrandedInvoiceUrl } from "@/lib/utils/share";
import { API_BASE_URL } from "@/lib/constants/api";
import { getAccessToken } from "@/lib/auth/token-store";

const PdfPreviewPage = dynamic(
  () =>
    import("@/components/chat/pdf-preview-page").then(
      (module) => module.PdfPreviewPage,
    ),
  {
    ssr: false,
  },
);

interface PdfPreviewCardProps {
  pdf: {
    url: string;
    invoice_id: string;
    invoice_number: string;
  };
}

export function PdfPreviewCard({ pdf }: PdfPreviewCardProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // Use backend endpoint for PDF preview (avoids R2 CORS)
  const token = getAccessToken();
  const previewFile = {
    url: `${API_BASE_URL}/api/v1/invoices/${pdf.invoice_id}/pdf/download`,
    httpHeaders: token ? { Authorization: `Bearer ${token}` } : ({} as Record<string, string>),
  };
  const previewWidth = expanded ? 370 : 350;

  function handleDownload() {
    window.open(pdf.url, "_blank", "noopener,noreferrer");
  }

  async function handleDownloadFile() {
    try {
      const response = await fetch(previewFile.url, {
        headers: previewFile.httpHeaders,
      });
      if (!response.ok) {
        window.open(pdf.url, "_blank", "noopener,noreferrer");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pdf.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(pdf.url, "_blank", "noopener,noreferrer");
    }
  }

  async function handleShare() {
    setIsSharing(true);
    try {
      await shareInvoicePdf(pdf.invoice_id, pdf.invoice_number);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share failed:", error);
      }
    } finally {
      setIsSharing(false);
    }
  }

  async function handleWhatsAppShare() {
    setIsSharing(true);
    try {
      const result = await shareInvoicePdf(pdf.invoice_id, pdf.invoice_number);
      // If native share wasn't available or failed, fall back to wa.me link
      if (result === "error") {
        const brandedUrl = buildBrandedInvoiceUrl(pdf.invoice_id, pdf.invoice_number);
        const message = `Hi, please find your Invoice ${pdf.invoice_number}.\n\nView & download: ${brandedUrl}`;
        const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(waUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("WhatsApp share failed:", error);
        const brandedUrl = buildBrandedInvoiceUrl(pdf.invoice_id, pdf.invoice_number);
        const message = `Hi, please find your Invoice ${pdf.invoice_number}.\n\nView & download: ${brandedUrl}`;
        const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(waUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <div className="mt-1.5 overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div
        className="relative cursor-pointer bg-zinc-50"
        onClick={() => setExpanded((current) => !current)}
      >
        {pdfLoading && !pdfLoadError && (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        )}

        {pdfLoadError && (
          <div className="flex h-[120px] flex-col items-center justify-center gap-2">
            <FileText className="h-8 w-8 text-zinc-300" />
            <p className="text-[11px] text-zinc-400">Preview unavailable</p>
          </div>
        )}

        {!pdfLoadError && (
          <div
            className={`flex justify-center overflow-hidden transition-all duration-200 ${
              expanded ? "max-h-[500px]" : "max-h-[280px]"
            }`}
          >
            <PdfPreviewPage
              file={previewFile}
              width={previewWidth}
              onLoadSuccess={() => setPdfLoading(false)}
              onLoadError={() => {
                setPdfLoading(false);
                setPdfLoadError(true);
              }}
            />
          </div>
        )}

        {!pdfLoadError && !pdfLoading && (
          <div className="absolute right-0 bottom-0 left-0 flex justify-center bg-gradient-to-t from-white/90 to-transparent pb-1.5 pt-6">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setExpanded((current) => !current);
              }}
              className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-zinc-500 shadow-sm ring-1 ring-zinc-200 transition-colors hover:bg-zinc-50"
            >
              <Maximize2 className="h-3 w-3" />
              {expanded ? "Show less" : "Show more"}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-zinc-100 px-3 py-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-50">
          <FileText className="h-4 w-4 text-red-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-zinc-800">
            {pdf.invoice_number}.pdf
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="shrink-0 rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          aria-label="Open in new tab"
          title="Open in new tab"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex border-t border-zinc-100">
        <button
          type="button"
          onClick={() => void handleDownloadFile()}
          className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </button>

        <div className="w-px bg-zinc-100" />

        <button
          type="button"
          onClick={() => void handleShare()}
          disabled={isSharing}
          className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
        >
          {isSharing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Share2 className="h-3.5 w-3.5" />
          )}
          Share
        </button>

        <div className="w-px bg-zinc-100" />

        <button
          type="button"
          onClick={() => void handleWhatsAppShare()}
          disabled={isSharing}
          className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
        >
          {isSharing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <MessageCircle className="h-3.5 w-3.5" />
          )}
          WhatsApp
        </button>
      </div>
    </div>
  );
}
