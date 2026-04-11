"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { renderDeliverable } from "@/lib/utils/format";

export interface PublicInvoiceItemPhoto {
  id: string;
  file_url: string;
  filename: string;
  is_primary: boolean;
  sort_order: number;
}

export interface PublicInvoiceItem {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  quantity: number;
  rate: number;
  gst_percent: number;
  amount: number;
  deliverables: string[] | null;
  photos: PublicInvoiceItemPhoto[];
}

export interface PackageViewProps {
  business: { name: string };
  customer: { name: string | null };
  invoice: {
    invoiceNumber: string;
    totalAmount: number;
    subtotal: number;
    taxTotal: number;
    dueDate: string | null;
    status: string;
  };
  items: PublicInvoiceItem[];
  onDownloadPdf: () => void;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function PackageItemCard({ item }: { item: PublicInvoiceItem }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const sortedPhotos = [...item.photos].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const hasPhotos = sortedPhotos.length > 0;

  return (
    <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white mb-4">
      {hasPhotos && (
        <div className="relative aspect-[16/9] bg-zinc-100">
          <img
            src={sortedPhotos[currentPhotoIndex].file_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          {sortedPhotos.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full">
              {currentPhotoIndex + 1} of {sortedPhotos.length}
            </span>
          )}
          {sortedPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setCurrentPhotoIndex(
                    (currentPhotoIndex - 1 + sortedPhotos.length) %
                      sortedPhotos.length
                  )
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentPhotoIndex(
                    (currentPhotoIndex + 1) % sortedPhotos.length
                  )
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold text-zinc-900">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-zinc-500 mt-0.5">{item.description}</p>
        )}

        {item.deliverables && item.deliverables.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {item.deliverables.map((d, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-zinc-700"
              >
                <span className="text-zinc-400 mt-0.5">•</span>
                <span>{renderDeliverable(d)}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 pt-3 border-t border-zinc-100 flex justify-between items-end">
          <div>
            <span className="text-lg font-semibold text-zinc-900">
              {formatINR(item.rate)}
            </span>
            {item.quantity > 1 && (
              <span className="text-sm text-zinc-500 ml-1">
                × {item.quantity} {item.unit}
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-400">
            {item.gst_percent > 0
              ? `+ ${item.gst_percent}% GST`
              : "No GST"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function PackageView({
  business,
  customer,
  invoice,
  items,
  onDownloadPdf,
}: PackageViewProps) {
  return (
    <div>
      {/* Package header */}
      <div className="text-center mb-6">
        <h1 className="text-lg font-semibold text-zinc-900">{business.name}</h1>
        {customer.name && (
          <p className="text-sm text-zinc-500 mt-1">
            Prepared for {customer.name}
          </p>
        )}
        <p className="text-2xl font-bold text-zinc-900 mt-2">
          {formatINR(invoice.totalAmount)}
        </p>
        {invoice.dueDate && (
          <p className="text-xs text-zinc-400 mt-1">
            Due{" "}
            {new Date(invoice.dueDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Item cards */}
      {items.map((item) => (
        <PackageItemCard key={item.id} item={item} />
      ))}

      {/* Totals card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 mt-2 mb-6">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-zinc-500">
            <span>Subtotal</span>
            <span>{formatINR(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>GST</span>
            <span>{formatINR(invoice.taxTotal)}</span>
          </div>
          <div className="flex justify-between font-semibold text-zinc-900 pt-1.5 border-t border-zinc-100">
            <span>Total</span>
            <span>{formatINR(invoice.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Download formal estimate button */}
      <div className="text-center">
        <button
          type="button"
          onClick={onDownloadPdf}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download formal estimate
        </button>
      </div>
    </div>
  );
}
