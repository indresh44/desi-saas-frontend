"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { PricingModeBanner } from "@/components/invoices/templates/pricing-mode-banner";
import { searchCatalogItems } from "@/lib/api/catalog-items";
import { fetchTemplatePriced } from "@/lib/api/invoice-templates";
import { createInvoice, updateInvoice } from "@/lib/api/invoices";
import type { CatalogItem } from "@/lib/types/catalog-item";
import type { Invoice, InvoiceItem } from "@/lib/types/invoice";
import type { PricingMode, TemplatePricedResponse } from "@/lib/types/invoice-template";

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
  "w-full border-none bg-transparent px-0 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground";

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
  onSuccess: () => void;
  onClose: () => void;
  initialInvoice?: Invoice | null;
  initialTemplateId?: string | null;
  onSaveAsTemplate?: () => void;
};

function createLineItemFromInvoiceItem(item: InvoiceItem): LineItem {
  return {
    id: item.id || crypto.randomUUID(),
    catalogItemId: item.catalogItemId,
    name: item.name,
    description: item.description,
    unit: item.unit,
    qty: item.quantity,
    unit_price: item.unitPrice,
    gstPercent: item.gstPercent,
  };
}

function lineItemsFromPricedTemplate(priced: TemplatePricedResponse): LineItem[] {
  return priced.items.map((item) => ({
    id: crypto.randomUUID(),
    catalogItemId: item.catalog_item_id,
    name: item.name,
    description: item.description,
    unit: item.unit,
    qty: item.quantity,
    unit_price: item.unit_price,
    gstPercent: item.gst_percent,
  }));
}

export function CreateInvoiceModal({
  leadId,
  onSuccess,
  onClose,
  initialInvoice,
  initialTemplateId,
  onSaveAsTemplate,
}: Props) {
  const isEditMode = !!initialInvoice;
  const [items, setItems] = useState<LineItem[]>(() =>
    initialInvoice?.items?.length
      ? initialInvoice.items.map(createLineItemFromInvoiceItem)
      : [createEmptyLineItem()]
  );
  const [dueDate, setDueDate] = useState(initialInvoice?.dueDate ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templatePriced, setTemplatePriced] = useState<TemplatePricedResponse | null>(null);
  const [pricingMode, setPricingMode] = useState<PricingMode>("template");
  const [pricingLoading, setPricingLoading] = useState(false);
  const [activeSearchRowId, setActiveSearchRowId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<CatalogItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const blurTimeoutRef = useRef<number | null>(null);
  const nameCellRefs = useRef<Record<string, HTMLElement | null>>({});
  const [dropdownAnchor, setDropdownAnchor] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    setItems(
      initialInvoice?.items?.length
        ? initialInvoice.items.map(createLineItemFromInvoiceItem)
        : [createEmptyLineItem()]
    );
    setDueDate(initialInvoice?.dueDate ?? "");
    setIsSubmitting(false);
    setError(null);
    setActiveSearchRowId(null);
    setIsSearchOpen(false);
    setSearchResults([]);
    setIsSearching(false);
    setSearchError(null);
    setDropdownAnchor(null);
  }, [initialInvoice]);

  useEffect(() => {
    if (!initialTemplateId || initialInvoice) {
      setTemplatePriced(null);
      return;
    }
    let cancelled = false;
    setPricingLoading(true);
    setPricingMode("template");
    fetchTemplatePriced(initialTemplateId, "template")
      .then((priced) => {
        if (cancelled) return;
        setTemplatePriced(priced);
        setItems(lineItemsFromPricedTemplate(priced));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          typeof err === "object" && err && "message" in err
            ? String((err as { message: unknown }).message)
            : "Unable to load template.";
        setError(msg);
      })
      .finally(() => {
        if (!cancelled) setPricingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialTemplateId, initialInvoice]);

  const togglePricingMode = useCallback(async () => {
    if (!initialTemplateId || !templatePriced) return;
    const nextMode: PricingMode = pricingMode === "template" ? "catalog" : "template";
    setPricingLoading(true);
    try {
      const priced = await fetchTemplatePriced(initialTemplateId, nextMode);
      setTemplatePriced(priced);
      setPricingMode(nextMode);
      setItems(lineItemsFromPricedTemplate(priced));
    } catch (err) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Unable to refresh prices.";
      setError(msg);
    } finally {
      setPricingLoading(false);
    }
  }, [initialTemplateId, pricingMode, templatePriced]);

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
      if (isEditMode && initialInvoice) {
        await updateInvoice(initialInvoice.id, {
          invoice: {
            issued_date: initialInvoice.issuedDate,
            due_date: parsedInput.data.dueDate,
          },
          items: parsedInput.data.items.map((item) => ({
            catalog_item_id: item.catalogItemId ?? null,
            name: item.name,
            description: item.description || undefined,
            unit: item.unit || "piece",
            quantity: item.qty,
            unit_price: item.unit_price,
            gst_percent: item.gstPercent,
          })),
        });
      } else {
        const today = new Date().toISOString().slice(0, 10);
        await createInvoice({
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
        });
      }
      onSuccess();
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
        setError(isEditMode ? "Unable to update invoice." : "Unable to create invoice.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
        <div className="flex max-h-[95vh] w-full flex-col rounded-t-xl border border-border bg-card shadow-2xl sm:max-h-[90vh] sm:max-w-5xl sm:rounded-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold text-foreground">
              {isEditMode ? "Edit Invoice" : "New Invoice"}
            </h2>
            <Button type="button" size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {templatePriced ? (
              <PricingModeBanner
                templateName={templatePriced.template_name}
                templateSavedAt={templatePriced.template_saved_at}
                mode={pricingMode}
                onToggle={() => void togglePricingMode()}
                disabled={pricingLoading}
              />
            ) : null}
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {/* ── Mobile: stacked cards (< sm) ── */}
            <div className="space-y-3 sm:hidden">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border bg-muted p-3 space-y-2"
                >
                  {/* Name */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Item Name</label>
                    <div
                      ref={(el) => { nameCellRefs.current[item.id] = el; }}
                    >
                      <input
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Search or type..."
                        value={item.name}
                        onChange={(event) => handleNameChange(item.id, event.target.value)}
                        onFocus={() => handleNameFocus(item.id)}
                        onBlur={handleNameBlur}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") setIsSearchOpen(false);
                        }}
                      />
                      {item.catalogItemId ? (
                        <span className="mt-0.5 block text-xs text-muted-foreground">from catalog</span>
                      ) : null}
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="-"
                      value={item.description}
                      onChange={(event) => updateItem(item.id, { description: event.target.value })}
                    />
                  </div>
                  {/* Unit / Qty / Rate / GST row */}
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Unit</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="-"
                        value={item.unit}
                        onChange={(event) => updateItem(item.id, { unit: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Qty</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="1"
                        step="1"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 md:text-sm"
                        value={item.qty || ""}
                        onFocus={(event) => event.currentTarget.select()}
                        onChange={(event) => updateItem(item.id, { qty: Number(event.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Rate ₹</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="1"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 md:text-sm"
                        value={item.unit_price || ""}
                        onFocus={(event) => event.currentTarget.select()}
                        onChange={(event) => updateItem(item.id, { unit_price: Number(event.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">GST %</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="28"
                        step="1"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 md:text-sm"
                        value={item.gstPercent || ""}
                        onFocus={(event) => event.currentTarget.select()}
                        onChange={(event) => updateItem(item.id, { gstPercent: Number(event.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  {/* Total + remove */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-semibold text-foreground">
                      Total: ₹{roundAmount(calcLineTotal(item)).toLocaleString("en-IN")}
                    </span>
                    {items.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500"
                        aria-label="Remove line item"
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop: table (≥ sm) ── */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-border bg-card">
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
                            value={item.qty || ""}
                            onFocus={(event) => event.currentTarget.select()}
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
                            onFocus={(event) => event.currentTarget.select()}
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
                            value={item.gstPercent || ""}
                            onFocus={(event) => event.currentTarget.select()}
                            onChange={(event) =>
                              updateItem(item.id, { gstPercent: Number(event.target.value) || 0 })
                            }
                          />
                        </td>
                        <td className="whitespace-nowrap px-2 py-1 text-right text-sm font-medium text-foreground">
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
              <label className="block text-sm font-medium text-foreground">Due Date</label>
              <input
                type="date"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
            <div>
              {isEditMode && onSaveAsTemplate ? (
                <Button type="button" variant="outline" onClick={onSaveAsTemplate}>
                  Save as template
                </Button>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEditMode ? "Update Invoice" : "Save Invoice"}
              </Button>
            </div>
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
              className="rounded-lg border border-border bg-card p-1 shadow-lg"
            >
              {isSearching ? (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
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
                      className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left hover:bg-muted"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleCatalogSelect(activeSearchRowId!, catalogItem);
                      }}
                    >
                      <span className="min-w-0 truncate text-sm font-medium text-foreground">
                        {catalogItem.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        ₹{roundAmount(catalogItem.defaultRate).toLocaleString("en-IN")} /{" "}
                        {getCatalogUnitLabel(catalogItem)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}

              {!isSearching && !searchError && searchResults.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  <p>No items found</p>
                  <p className="text-xs text-muted-foreground">
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
