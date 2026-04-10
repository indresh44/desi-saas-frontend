"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Download, FileText, Loader2, Maximize2 } from "lucide-react";
import sellNSettleIcon from "@/app/sellnsettle-icon.png";

const PdfPreviewPage = dynamic(
  () =>
    import("@/components/chat/pdf-preview-page").then(
      (m) => m.PdfPreviewPage,
    ),
  { ssr: false },
);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://sellnsettle.com";

interface InvoiceMeta {
  invoice_number: string;
  total_amount: number;
  due_date: string;
  status: string;
  customer_name: string | null;
  business_name: string;
  items_count: number;
}

function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusClass(status: string): string {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700";
    case "approved":
      return "bg-teal-100 text-teal-700";
    case "sent":
      return "bg-blue-100 text-blue-700";
    case "partial":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-zinc-100 text-zinc-600";
  }
}

function getDocLabel(status: string): string {
  return status === "sent" ? "Estimate" : "Invoice";
}

export function PublicInvoiceView({
  uuid,
  meta,
}: {
  uuid: string;
  meta: InvoiceMeta | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfWidth, setPdfWidth] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setPdfWidth(w);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!meta) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="mx-4 max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-zinc-300" />
          <h1 className="mt-4 text-xl font-semibold text-zinc-900">
            Invoice Not Available
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            This invoice doesn&apos;t exist or is no longer available.
          </p>
          <a
            href="https://sellnsettle.com"
            className="mt-6 inline-block rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
          >
            Go to SellNSettle
          </a>
        </div>
      </div>
    );
  }

  const [pdfUrl] = useState(
    () => `${API_BASE}/api/public/invoices/${uuid}/pdf?t=${Date.now()}`,
  );
  const docLabel = getDocLabel(meta.status);

  // console.log("pdfUrl:", pdfUrl);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `${meta.invoice_number}.pdf`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
            <a href="https://sellnsettle.com" className="flex items-center justify-center gap-2">
            <h1 className="flex items-center gap-2 text-lg font-bold text-[#E8862E]">
              <Image src={sellNSettleIcon} alt="SellNSettle" width={24} height={24} />
              SellNSettle
            </h1>
            </a>
          <span className="text-xs uppercase tracking-widest text-zinc-400">
            {docLabel}
          </span>
        </div>
      </header>

      {/* Invoice info card */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {/* Top row */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-primary">
                  {meta.invoice_number}
                </h1>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(meta.status)}`}
                >
                  {meta.status}
                </span>
              </div>
              {meta.customer_name ? (
                <p className="mt-1 text-sm text-zinc-500">
                  For{" "}
                  <span className="font-medium text-zinc-700">
                    {meta.customer_name}
                  </span>
                </p>
              ) : null}
              <p className="mt-0.5 text-xs text-zinc-400">
                From {meta.business_name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">
                {formatRupees(meta.total_amount)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Due {formatDate(meta.due_date)}
              </p>
            </div>
          </div>

          {/* PDF viewer */}
          <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
            <div
              className="relative cursor-pointer"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {pdfLoading && !pdfError && (
                <div className="flex h-[300px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                </div>
              )}

              {pdfError && (
                <div className="flex h-[200px] flex-col items-center justify-center gap-2">
                  <FileText className="h-10 w-10 text-zinc-300" />
                  <p className="text-sm text-zinc-400">
                    PDF preview unavailable
                  </p>
                </div>
              )}

              {!pdfError && (
                <div
                  ref={containerRef}
                  className={`overflow-hidden transition-all duration-300 ${
                    expanded ? "max-h-[800px]" : "max-h-[400px]"
                  }`}
                >
                  {pdfWidth > 0 && (
                    <PdfPreviewPage
                      file={pdfUrl}
                      width={pdfWidth}
                      onLoadSuccess={() => setPdfLoading(false)}
                      onLoadError={() => {
                        setPdfLoading(false);
                        setPdfError(true);
                      }}
                    />
                  )}
                </div>
              )}

              {!pdfError && !pdfLoading && (
                <div className="absolute right-0 bottom-0 left-0 flex justify-center bg-gradient-to-t from-white/90 to-transparent pb-2 pt-8">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded((prev) => !prev);
                    }}
                    className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm ring-1 ring-zinc-200 transition-colors hover:bg-zinc-50"
                  >
                    <Maximize2 className="h-3 w-3" />
                    {expanded ? "Show less" : "Show more"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Download button */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
            >
              <Download className="h-4 w-4" />
              Download {docLabel}
            </button>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-400">
            Powered by{" "}
            <a
              href="https://sellnsettle.com"
              className="font-medium text-[#E8862E] hover:text-[#E8862E]/80"
            >
              SellNSettle
            </a>{" "}
            — the chat-first CRM for Indian MSMEs
          </p>
        </div>
      </main>
    </div>
  );
}
