"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { searchCatalogItems } from "@/lib/api/catalog-items";
import {
  createTemplate,
  fetchTemplate,
  updateTemplate,
} from "@/lib/api/invoice-templates";
import type { CatalogItem } from "@/lib/types/catalog-item";
import type { CreateTemplateItemInput } from "@/lib/types/invoice-template";

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

function catalogUnitLabel(item: CatalogItem): string {
  if (item.unit === "custom") return item.customUnit?.trim() || "Unit";
  return UNIT_LABELS[item.unit] || item.unit;
}

function emptyRow(): LineItem {
  return {
    id: crypto.randomUUID(),
    catalogItemId: null,
    name: "",
    description: "",
    unit: "piece",
    qty: 1,
    unit_price: 0,
    gstPercent: 0,
  };
}

function formatRupees(value: number): string {
  return Math.round(Number.isFinite(value) ? value : 0).toLocaleString("en-IN");
}

const cellCls =
  "w-full border-none bg-transparent px-0 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground";

type Props = {
  templateId?: string;
};

export function TemplateForm({ templateId }: Props) {
  const router = useRouter();
  const isEdit = Boolean(templateId && templateId !== "new");
  const [loading, setLoading] = useState(isEdit);
  const [name, setName] = useState("");
  const [items, setItems] = useState<LineItem[]>([emptyRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // catalog search
  const nameRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [results, setResults] = useState<CatalogItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const blurRef = useRef<number | null>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number } | null>(
    null
  );

  useEffect(() => {
    if (!isEdit || !templateId) return;
    let cancelled = false;
    setLoading(true);
    fetchTemplate(templateId)
      .then((tpl) => {
        if (cancelled) return;
        setName(tpl.name);
        setItems(
          (tpl.items ?? []).length > 0
            ? (tpl.items ?? []).map((it) => ({
                id: it.id,
                catalogItemId: it.catalogItemId,
                name: it.name,
                description: it.description,
                unit: it.unit,
                qty: it.quantity,
                unit_price: it.unitPrice,
                gstPercent: it.gstPercent,
              }))
            : [emptyRow()]
        );
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
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isEdit, templateId]);

  const activeItem = useMemo(
    () => items.find((it) => it.id === activeRowId) ?? null,
    [activeRowId, items]
  );
  const activeQuery = activeItem?.name.trim() ?? "";

  useEffect(() => {
    if (!searchOpen || !activeRowId || activeQuery.length < 2) {
      setSearching(false);
      setResults([]);
      setSearchError(null);
      return;
    }
    const t = window.setTimeout(async () => {
      setSearching(true);
      try {
        const r = await searchCatalogItems(activeQuery);
        setResults(r);
      } catch (err: unknown) {
        setSearchError(
          typeof err === "object" && err && "message" in err
            ? String((err as { message: unknown }).message)
            : "Unable to search."
        );
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [activeRowId, activeQuery, searchOpen]);

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.qty * it.unit_price, 0),
    [items]
  );
  const taxTotal = useMemo(
    () => items.reduce((sum, it) => sum + (it.qty * it.unit_price * it.gstPercent) / 100, 0),
    [items]
  );
  const grandTotal = subtotal + taxTotal;

  const updateItem = (id: string, patch: Partial<LineItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));
    delete nameRefs.current[id];
  };

  const updateAnchor = (id: string) => {
    const el = nameRefs.current[id];
    if (!el) return;
    const r = el.getBoundingClientRect();
    setAnchor({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 280) });
  };

  const onNameChange = (id: string, next: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, name: next, catalogItemId: it.catalogItemId && next !== it.name ? null : it.catalogItemId }
          : it
      )
    );
    setActiveRowId(id);
    setSearchOpen(true);
    updateAnchor(id);
  };

  const onNameFocus = (id: string) => {
    if (blurRef.current !== null) {
      window.clearTimeout(blurRef.current);
      blurRef.current = null;
    }
    setActiveRowId(id);
    setSearchOpen(true);
    updateAnchor(id);
  };

  const onNameBlur = () => {
    blurRef.current = window.setTimeout(() => {
      setSearchOpen(false);
      blurRef.current = null;
    }, 150);
  };

  const onCatalogSelect = (rowId: string, catalog: CatalogItem) => {
    updateItem(rowId, {
      catalogItemId: catalog.id,
      name: catalog.name,
      description: catalog.description || "",
      unit: catalogUnitLabel(catalog),
      unit_price: catalog.defaultRate,
      gstPercent: catalog.gstPercent,
    });
    setSearchOpen(false);
    setResults([]);
    setSearchError(null);
  };

  const handleSubmit = useCallback(async () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Template name is required.");
      return;
    }
    const validItems = items.filter((it) => it.name.trim() && it.qty > 0 && it.unit_price > 0);
    if (validItems.length === 0) {
      setError("Add at least one line item with a name, quantity, and price.");
      return;
    }
    const payload: CreateTemplateItemInput[] = validItems.map((it, idx) => ({
      catalog_item_id: it.catalogItemId ?? null,
      name: it.name,
      description: it.description || "",
      unit: it.unit || "piece",
      quantity: it.qty,
      unit_price: it.unit_price,
      gst_percent: it.gstPercent,
      sort_order: idx,
    }));

    setSubmitting(true);
    try {
      if (isEdit && templateId) {
        await updateTemplate(templateId, { name: trimmed, items: payload });
      } else {
        await createTemplate({ name: trimmed, items: payload });
      }
      router.push("/invoices?tab=templates");
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Unable to save template.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }, [isEdit, items, name, router, templateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading template...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-foreground" htmlFor="tpl-name">
          Template name
        </label>
        <input
          id="tpl-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Modular Kitchen — Basic"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Mobile stacked cards */}
      <div className="space-y-3 sm:hidden">
        {items.map((item) => (
          <div key={item.id} className="space-y-2 rounded-xl border bg-muted p-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Item Name</label>
              <div ref={(el) => { nameRefs.current[item.id] = el; }}>
                <input
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Search or type..."
                  value={item.name}
                  onChange={(e) => onNameChange(item.id, e.target.value)}
                  onFocus={() => onNameFocus(item.id)}
                  onBlur={onNameBlur}
                />
                {item.catalogItemId ? (
                  <span className="mt-0.5 block text-xs text-muted-foreground">from catalog</span>
                ) : null}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <input
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="-"
                value={item.description}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Unit</label>
                <input
                  className="mt-1 w-full rounded-lg border bg-background px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={item.unit}
                  onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Qty</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="mt-1 w-full rounded-lg border bg-background px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={item.qty}
                  onChange={(e) => updateItem(item.id, { qty: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Rate ₹</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="mt-1 w-full rounded-lg border bg-background px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={item.unit_price || ""}
                  onChange={(e) => updateItem(item.id, { unit_price: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">GST %</label>
                <input
                  type="number"
                  min="0"
                  max="28"
                  step="1"
                  className="mt-1 w-full rounded-lg border bg-background px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={item.gstPercent}
                  onChange={(e) => updateItem(item.id, { gstPercent: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-semibold text-foreground">
                Total: ₹{formatRupees(item.qty * item.unit_price)}
              </span>
              {items.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove line item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border bg-card sm:block">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
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
            {items.map((item) => (
              <tr key={item.id} className="border-b align-top last:border-b-0">
                <td
                  className="px-2 py-1"
                  ref={(el) => { nameRefs.current[item.id] = el; }}
                >
                  <input
                    className={cellCls}
                    placeholder="Search or type..."
                    value={item.name}
                    onChange={(e) => onNameChange(item.id, e.target.value)}
                    onFocus={() => onNameFocus(item.id)}
                    onBlur={onNameBlur}
                  />
                  {item.catalogItemId ? (
                    <span className="block text-[11px] text-muted-foreground">from catalog</span>
                  ) : null}
                </td>
                <td className="px-2 py-1">
                  <input
                    className={cellCls}
                    placeholder="-"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    className={cellCls}
                    value={item.unit}
                    onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className={`${cellCls} w-12`}
                    value={item.qty}
                    onChange={(e) => updateItem(item.id, { qty: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={`${cellCls} w-20`}
                    value={item.unit_price || ""}
                    onChange={(e) => updateItem(item.id, { unit_price: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    min="0"
                    max="28"
                    step="1"
                    className={`${cellCls} w-11`}
                    value={item.gstPercent}
                    onChange={(e) => updateItem(item.id, { gstPercent: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="whitespace-nowrap px-2 py-1 text-right text-sm font-medium text-foreground">
                  ₹{formatRupees(item.qty * item.unit_price)}
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
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, emptyRow()])}
        className="py-2 text-sm text-primary hover:underline"
      >
        + Add line item
      </button>

      <div className="space-y-1 border-t pt-2">
        <div className="flex justify-end gap-8 px-2 text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span className="w-24 text-right">₹{formatRupees(subtotal)}</span>
        </div>
        <div className="flex justify-end gap-8 px-2 text-sm text-muted-foreground">
          <span>Tax</span>
          <span className="w-24 text-right">₹{formatRupees(taxTotal)}</span>
        </div>
        <div className="flex justify-end gap-8 border-t px-2 pt-2 text-sm font-medium">
          <span>Grand total</span>
          <span className="w-24 text-right">₹{formatRupees(grandTotal)}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/invoices?tab=templates")}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="button" onClick={() => void handleSubmit()} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : isEdit ? (
            "Update template"
          ) : (
            "Create template"
          )}
        </Button>
      </div>

      {searchOpen && activeRowId && anchor && activeQuery.length >= 2
        ? createPortal(
            <div
              style={{
                position: "fixed",
                top: anchor.top,
                left: anchor.left,
                width: anchor.width,
                zIndex: 9999,
              }}
              className="rounded-lg border border-border bg-card p-1 shadow-lg"
            >
              {searching ? (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching catalog...
                </div>
              ) : null}
              {!searching && searchError ? (
                <div className="px-3 py-2 text-sm text-red-600">{searchError}</div>
              ) : null}
              {!searching && !searchError && results.length > 0 ? (
                <div className="max-h-56 overflow-y-auto">
                  {results.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left hover:bg-muted"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onCatalogSelect(activeRowId, cat);
                      }}
                    >
                      <span className="min-w-0 truncate text-sm font-medium text-foreground">
                        {cat.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        ₹{formatRupees(cat.defaultRate)} / {catalogUnitLabel(cat)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
              {!searching && !searchError && results.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  <p>No items found</p>
                  <p className="text-xs">Type details manually</p>
                </div>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
