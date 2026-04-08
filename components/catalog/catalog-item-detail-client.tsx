"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CatalogAttachmentsManager } from "@/components/catalog/catalog-attachments-manager";
import { fetchCatalogItemById } from "@/lib/api/catalog-items";
import type { CatalogItem } from "@/lib/types/catalog-item";

type Props = {
  itemId: string;
};

const UNIT_LABELS: Record<string, string> = {
  piece: "Piece",
  sq_ft: "Sq. Ft.",
  meter: "Meter",
  kg: "Kg",
  hour: "Hour",
  session: "Session",
  month: "Month",
  trip: "Trip",
  lot: "Lot",
};

function formatRupees(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CatalogItemDetailClient({ itemId }: Props) {
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchCatalogItemById(itemId);
        if (mounted) {
          setItem(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unable to load catalog item");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [itemId]);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/catalog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
      </div>

      {isLoading ? (
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : item ? (
        <>
          <div className="rounded-lg border bg-card p-4">
            <h1 className="text-xl font-semibold text-primary">{item.name}</h1>
            {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-1">
                Unit: {item.unit === "custom" ? item.customUnit : UNIT_LABELS[item.unit] || item.unit}
              </span>
              <span className="rounded-full bg-muted px-2 py-1">Rate: {formatRupees(item.defaultRate)}</span>
              <span className="rounded-full bg-muted px-2 py-1">GST: {item.gstPercent}%</span>
              <span className="rounded-full bg-muted px-2 py-1">{item.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>

          <CatalogAttachmentsManager catalogItemId={item.id} />
        </>
      ) : null}
    </section>
  );
}
