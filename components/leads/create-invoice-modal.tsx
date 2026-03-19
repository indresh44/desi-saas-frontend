"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { searchCatalogItems } from "@/lib/api/catalog-items";
import { createInvoice } from "@/lib/api/invoices";
import type { CatalogItem } from "@/lib/types/catalog-item";

type LineItem = {
  id: string;
  catalogItemId: string | null;
  name: string;
  description: string;
  unit: string;
  qty: number;
  unit_price: number;
  gstPercent: number;
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

const lineItemSchema = z.object({
  catalogItemId: z.string().trim().min(1).nullable().optional(),
  name: z.string().trim().min(1, "Item name is required."),
  description: z.string().trim().optional(),
  unit: z.string().trim().optional().default("piece"),
  qty: z.number().positive("Quantity must be greater than 0."),
  unit_price: z.number().positive("Unit price must be greater than 0."),
  gstPercent: z
    .number()
    .min(0, "GST must be between 0 and 28.")
    .max(28, "GST must be between 0 and 28."),
});

const createInvoiceSchema = z.object({
  dueDate: z.string().min(1, "Due date is required."),
  items: z.array(lineItemSchema).min(1),
});

const cellInputCls =
  "w-full border-none bg-transparent px-0 py-1.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400";

function createEmptyLineItem(): LineItem {
  return {
    id: crypto.randomUUID(),
    catalogItemId: null,
    name: "",
    description: "",
    unit: "",
    qty: 1,
    unit_price: 0,
    gstPercent: 0,
  };
}

function getCatalogUnitLabel(item: CatalogItem): string {
  if (item.unit === "custom") {
    return item.customUnit?.trim() || "Unit";
  }

  return UNIT_LABELS[item.unit] || item.unit;
}

function roundAmount(value: number): number {
  return Math.round(Number.isFinite(value) ? value : 0);
}

function calcLineTotal(item: LineItem): number {
  return item.qty * item.unit_price;
}

function calcLineTax(item: LineItem): number {
  return (calcLineTotal(item) * item.gstPercent) / 100;
}

type Props = {
  leadId: string;
  onCreated: () => void;
  onClose: () => void;
};

export function CreateInvoiceModal({ leadId, onCreated, onClose }: Props) {
  const [items, setItems] = useState<LineItem[]>([createEmptyLineItem()]);
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSearchRowId, setActiveSearchRowId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<CatalogItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const blurTimeoutRef = useRef<number | null>(null);
  const nameCellRefs = useRef<Record<string, HTMLTableCellElement | null>>({});
  const [dropdownAnchor, setDropdownAnchor] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const updateDropdownAnchor = (id: string) => {
    const cell = nameCellRefs.current[id];
    if (cell) {
      const rect = cell.getBoundingClientRect();
      setDropdownAnchor({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 280),
      });
    }
  };

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeSearchRowId) ?? null,
    [activeSearchRowId, items]
  );

  const activeQuery = activeItem?.name.trim() ?? "";

  useEffect(() => {
    if (!isSearchOpen || !activeSearchRowId || activeQuery.length < 2) {
      setIsSearching(false);
      setSearchError(null);
      setSearchResults([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);

      try {
        const results = await searchCatalogItems(activeQuery);
        setSearchResults(results);
      } catch (searchErr) {
        if (
          typeof searchErr === "object" &&
          searchErr !== null &&
          "message" in searchErr &&
          typeof searchErr.message === "string"
        ) {
          setSearchError(searchErr.message);
        } else {
          setSearchError("Unable to search catalog items.");
        }

        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeQuery, activeSearchRowId, isSearchOpen]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyLineItem()]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    delete nameCellRefs.current[id];

    if (activeSearchRowId === id) {
      setActiveSearchRowId(null);
      setIsSearchOpen(false);
      setSearchResults([]);
      setSearchError(null);
    }
  };

  const updateItem = (id: string, patch: Partial<LineItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const handleNameChange = (id: string, nextName: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          name: nextName,
          catalogItemId:
            item.catalogItemId && nextName !== item.name ? null : item.catalogItemId,
        };
      })
    );

    setActiveSearchRowId(id);
    setIsSearchOpen(true);
    updateDropdownAnchor(id);
  };

  const handleNameFocus = (id: string) => {
    if (blurTimeoutRef.current !== null) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    setActiveSearchRowId(id);
    setIsSearchOpen(true);
    updateDropdownAnchor(id);
  };

  const handleNameBlur = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      setIsSearchOpen(false);
      blurTimeoutRef.current = null;
    }, 150);
  };

  const handleCatalogSelect = (rowId: string, catalogItem: CatalogItem) => {
    updateItem(rowId, {
      catalogItemId: catalogItem.id,
      name: catalogItem.name,
      description: catalogItem.description || "",
      unit: getCatalogUnitLabel(catalogItem),
      unit_price: catalogItem.defaultRate,
      gstPercent: catalogItem.gstPercent,
    });
    setActiveSearchRowId(rowId);
    setIsSearchOpen(false);
    setSearchResults([]);
    setSearchError(null);
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + calcLineTotal(item), 0),
    [items]
  );
  const taxTotal = useMemo(
    () => items.reduce((sum, item) => sum + calcLineTax(item), 0),
    [items]
  );
  const grandTotal = subtotal + taxTotal;

  const handleSubmit = async () => {
    setError(null);

    const parsedInput = createInvoiceSchema.safeParse({
      dueDate,
      items,
    });

    if (!parsedInput.success) {
      const firstIssue = parsedInput.error.issues[0];
      if (firstIssue.path[0] === "items" && typeof firstIssue.path[1] === "number") {
        setError(`Row ${firstIssue.path[1] + 1}: ${firstIssue.message}`);
      } else {
        setError(firstIssue.message);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().slice(0, 10);
      await createInvoice(
        {
          invoice: {
            lead_id: leadId,
            status: "draft",
            issued_date: today,
            due_date: parsedInput.data.dueDate,
          },
          items: parsedInput.data.items.map((item, index) => ({
            catalog_item_id: item.catalogItemId ?? null,
            name: item.name,
            description: item.description || undefined,
            unit: item.unit || "piece",
            quantity: item.qty,
            unit_price: item.unit_price,
            gst_percent: item.gstPercent,
            sort_order: index,
          })),
        }
      );
      onCreated();
      onClose();
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
      ) {
        setError((err as { message: string }).message);
      } else {
        setError("Unable to create invoice.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-zinc-900/40"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <h2 className="text-base font-semibold text-zinc-900">New Invoice</h2>
            <Button type="button" size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/70 text-xs text-muted-foreground">
                    <th className="w-[30%] px-2 py-2 text-left font-medium">Name</th>
                    <th className="w-[20%] px-2 py-2 text-left font-medium">Description</th>
                    <th className="w-[10%] px-2 py-2 text-left font-medium">Unit</th>
                    <th className="w-[8%] px-2 py-2 text-left font-medium">Qty</th>
                    <th className="w-[12%] px-2 py-2 text-left font-medium">Unit Price (₹)</th>
                    <th className="w-[8%] px-2 py-2 text-left font-medium">GST %</th>
                    <th className="w-[12%] px-2 py-2 text-right font-medium">Total</th>
                    <th className="w-[28px] px-1 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    return (
                      <tr key={item.id} className="border-b border-border/50 align-top last:border-b-0">
                        <td
                          className="px-2 py-1"
                          ref={(el) => { nameCellRefs.current[item.id] = el; }}
                        >
                          <input
                            className={cellInputCls}
                            placeholder="Search or type..."
                            value={item.name}
                            onChange={(event) => handleNameChange(item.id, event.target.value)}
                            onFocus={() => handleNameFocus(item.id)}
                            onBlur={handleNameBlur}
                            onKeyDown={(event) => {
                              if (event.key === "Escape") {
                                setIsSearchOpen(false);
                              }
                            }}
                          />
                          {item.catalogItemId ? (
                            <span className="block text-[11px] text-muted-foreground">
                              from catalog
                            </span>
                          ) : null}
                        </td>
                        <td className="px-2 py-1">
                          <input
                            className={cellInputCls}
                            placeholder="-"
                            value={item.description}
                            onChange={(event) =>
                              updateItem(item.id, { description: event.target.value })
                            }
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            className={cellInputCls}
                            placeholder="-"
                            value={item.unit}
                            onChange={(event) => updateItem(item.id, { unit: event.target.value })}
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            className={`${cellInputCls} w-12`}
                            value={item.qty}
                            onChange={(event) =>
                              updateItem(item.id, { qty: Number(event.target.value) || 0 })
                            }
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            className={`${cellInputCls} w-20`}
                            value={item.unit_price || ""}
                            onChange={(event) =>
                              updateItem(item.id, { unit_price: Number(event.target.value) || 0 })
                            }
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="number"
                            min="0"
                            max="28"
                            step="1"
                            className={`${cellInputCls} w-11`}
                            value={item.gstPercent}
                            onChange={(event) =>
                              updateItem(item.id, { gstPercent: Number(event.target.value) || 0 })
                            }
                          />
                        </td>
                        <td className="whitespace-nowrap px-2 py-1 text-right text-sm font-medium text-zinc-900">
                          ₹{roundAmount(calcLineTotal(item)).toLocaleString("en-IN")}
                        </td>
                        <td className="py-1 text-center">
                          {items.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="p-0.5 text-lg leading-none text-muted-foreground/50 hover:text-destructive"
                              aria-label="Remove line item"
                            >
                              ×
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="py-2 text-sm text-primary hover:underline"
            >
              + Add line item
            </button>

            <div className="space-y-1 border-t pt-2">
              <div className="flex justify-end gap-8 px-2 text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="w-24 text-right">
                  ₹{roundAmount(subtotal).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-end gap-8 px-2 text-sm text-muted-foreground">
                <span>Tax</span>
                <span className="w-24 text-right">
                  ₹{roundAmount(taxTotal).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-end gap-8 border-t px-2 pt-2 text-sm font-medium">
                <span>Grand total</span>
                <span className="w-24 text-right">
                  ₹{roundAmount(grandTotal).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-700">Due Date</label>
              <input
                type="date"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-4 py-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Invoice"}
            </Button>
          </div>
        </div>
      </div>

      {isSearchOpen && activeSearchRowId !== null && dropdownAnchor !== null && activeQuery.length >= 2
        ? createPortal(
            <div
              style={{
                position: "fixed",
                top: dropdownAnchor.top,
                left: dropdownAnchor.left,
                width: dropdownAnchor.width,
                zIndex: 9999,
              }}
              className="rounded-lg border border-zinc-200 bg-white p-1 shadow-lg"
            >
              {isSearching ? (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching catalog...
                </div>
              ) : null}

              {!isSearching && searchError ? (
                <div className="px-3 py-2 text-sm text-red-600">{searchError}</div>
              ) : null}

              {!isSearching && !searchError && searchResults.length > 0 ? (
                <div className="max-h-56 overflow-y-auto">
                  {searchResults.map((catalogItem) => (
                    <button
                      key={catalogItem.id}
                      type="button"
                      className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left hover:bg-zinc-100"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleCatalogSelect(activeSearchRowId!, catalogItem);
                      }}
                    >
                      <span className="min-w-0 truncate text-sm font-medium text-zinc-900">
                        {catalogItem.name}
                      </span>
                      <span className="shrink-0 text-xs text-zinc-500">
                        ₹{roundAmount(catalogItem.defaultRate).toLocaleString("en-IN")} /{" "}
                        {getCatalogUnitLabel(catalogItem)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}

              {!isSearching && !searchError && searchResults.length === 0 ? (
                <div className="px-3 py-2 text-sm text-zinc-500">
                  <p>No items found</p>
                  <p className="text-xs text-zinc-400">
                    You can still type the details manually below
                  </p>
                </div>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </>
  );
}
