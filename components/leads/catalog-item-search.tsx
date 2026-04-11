"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { searchCatalogItems } from "@/lib/api/catalog-items";
import type { CatalogItem } from "@/lib/types/catalog-item";

interface CatalogItemSearchProps {
  onSelect: (item: CatalogItem) => void;
  placeholder?: string;
}

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

function formatUnit(item: CatalogItem): string {
  if (item.unit === "custom") {
    return item.customUnit?.trim() || "Unit";
  }
  return UNIT_LABELS[item.unit] || item.unit;
}

function formatRupees(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function CatalogItemSearch({
  onSelect,
  placeholder = "Search catalog...",
}: CatalogItemSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CatalogItem[]>([]);
  const blurTimeoutRef = useRef<number | null>(null);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await searchCatalogItems(trimmedQuery);
        setResults(data);
      } catch (searchError) {
        if (
          typeof searchError === "object" &&
          searchError !== null &&
          "message" in searchError &&
          typeof searchError.message === "string"
        ) {
          setError(searchError.message);
        } else {
          setError("Unable to search catalog items.");
        }
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [trimmedQuery]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const showDropdown = useMemo(
    () => isOpen && trimmedQuery.length >= 2,
    [isOpen, trimmedQuery.length]
  );

  const handleFocus = () => {
    if (blurTimeoutRef.current !== null) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
      blurTimeoutRef.current = null;
    }, 150);
  };

  const handleSelect = (item: CatalogItem) => {
    onSelect(item);
    setQuery("");
    setResults([]);
    setError(null);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-muted-foreground">Catalog</label>
      <div className="relative mt-1">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-sm text-foreground outline-none transition focus:border-primary"
        />
      </div>

      {showDropdown ? (
        <div className="absolute left-0 right-0 z-10 mt-1 rounded-lg border border-border bg-card p-1 shadow-lg">
          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching catalog...
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="px-3 py-2 text-sm text-red-600">{error}</div>
          ) : null}

          {!isLoading && !error && results.length > 0 ? (
            <div className="max-h-56 overflow-y-auto">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full rounded-md px-3 py-2 text-left hover:bg-muted"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelect(item);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {item.gstPercent}% GST
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatRupees(item.defaultRate)} / {formatUnit(item)}
                  </p>
                </button>
              ))}
            </div>
          ) : null}

          {!isLoading && !error && results.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              <p>No items found</p>
              <p className="text-xs text-muted-foreground">
                You can still type the details manually below
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
