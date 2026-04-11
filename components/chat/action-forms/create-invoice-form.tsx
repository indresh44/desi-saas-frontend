"use client";

import { Plus, Trash2 } from "lucide-react";
import { ActionField } from "@/components/chat/action-forms/create-lead-form";

interface CreateInvoiceFormProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

interface InvoiceLineItem {
  catalog_item_id: string | null;
  name: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  gst_percent: number;
  line_total: number;
  sort_order: number;
}

export function CreateInvoiceForm({ data, onChange }: CreateInvoiceFormProps) {
  const items = ((data.items as InvoiceLineItem[] | undefined) ?? []).map((item, index) => ({
    catalog_item_id: item.catalog_item_id ?? null,
    name: item.name ?? "",
    description: item.description ?? "",
    unit: item.unit ?? "piece",
    quantity: Number(item.quantity ?? 0),
    rate: Number(item.rate ?? 0),
    gst_percent: Number(item.gst_percent ?? 0),
    line_total: Number(item.line_total ?? 0),
    sort_order: Number(item.sort_order ?? index + 1),
  }));

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function recalculate(updatedItems: InvoiceLineItem[]): Record<string, unknown> {
    let subtotal = 0;
    let taxTotal = 0;

    const recalculatedItems = updatedItems.map((item, index) => {
      const lineSubtotal = item.quantity * item.rate;
      const lineTax = lineSubtotal * (item.gst_percent / 100);
      const lineTotal = lineSubtotal + lineTax;

      subtotal += lineSubtotal;
      taxTotal += lineTax;

      return {
        ...item,
        sort_order: index + 1,
        line_total: Math.round(lineTotal * 100) / 100,
      };
    });

    return {
      ...data,
      items: recalculatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax_total: Math.round(taxTotal * 100) / 100,
      total_amount: Math.round((subtotal + taxTotal) * 100) / 100,
    };
  }

  function updateItem(index: number, field: keyof InvoiceLineItem, value: unknown) {
    const updatedItems = items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    );
    onChange(recalculate(updatedItems));
  }

  function removeItem(index: number) {
    const updatedItems = items.filter((_, itemIndex) => itemIndex !== index);
    onChange(recalculate(updatedItems));
  }

  function addItem() {
    const newItem: InvoiceLineItem = {
      catalog_item_id: null,
      name: "",
      description: "",
      unit: "piece",
      quantity: 1,
      rate: 0,
      gst_percent: 18,
      line_total: 0,
      sort_order: items.length + 1,
    };

    onChange(recalculate([...items, newItem]));
  }

  function updateField(field: string, value: unknown) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-muted-foreground">
          Customer:{" "}
          <span className="font-medium text-foreground">{String(data.customer_name ?? "")}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ActionField
          label="Due Date"
          value={(data.due_date as string | undefined) ?? ""}
          onChange={(value) => updateField("due_date", value)}
          type="date"
        />
        <div>
          <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Issued
          </label>
          <p className="px-2.5 py-1.5 text-xs text-muted-foreground">
            {data.issued_date
              ? new Date(String(data.issued_date)).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Today"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Items
        </label>

        {items.map((item, index) => (
          <InvoiceLineItemRow
            key={`${item.catalog_item_id ?? "item"}-${index}`}
            item={item}
            index={index}
            onUpdate={updateItem}
            onRemove={removeItem}
            canRemove={items.length > 1}
            formatCurrency={formatCurrency}
          />
        ))}

        <button
          type="button"
          onClick={addItem}
          className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-primary py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          <Plus className="h-3 w-3" />
          Add Item
        </button>
      </div>

      <div className="space-y-1 border-t border-border pt-2 text-right">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatCurrency(Number(data.subtotal ?? 0))}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>GST</span>
          <span>{formatCurrency(Number(data.tax_total ?? 0))}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold text-foreground">
          <span>Total</span>
          <span>{formatCurrency(Number(data.total_amount ?? 0))}</span>
        </div>
      </div>

      <ActionField
        label="Notes"
        value={(data.notes as string | undefined) ?? ""}
        onChange={(value) => updateField("notes", value)}
        multiline
        placeholder="Optional invoice notes..."
      />
    </div>
  );
}

interface InvoiceLineItemRowProps {
  item: InvoiceLineItem;
  index: number;
  onUpdate: (index: number, field: keyof InvoiceLineItem, value: unknown) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  formatCurrency: (amount: number) => string;
}

function InvoiceLineItemRow({
  item,
  index,
  onUpdate,
  onRemove,
  canRemove,
  formatCurrency,
}: InvoiceLineItemRowProps) {
  const inputClass =
    "w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none";

  return (
    <div className="rounded-md border border-border bg-background p-2">
      <div className="mb-1.5 flex items-start justify-between gap-1">
        <input
          value={item.name}
          onChange={(event) => onUpdate(index, "name", event.target.value)}
          placeholder="Item name"
          className={`${inputClass} flex-1 font-medium`}
        />
        {canRemove ? (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-red-500"
            aria-label="Remove item"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <div>
          <label className="mb-0.5 block text-[9px] text-muted-foreground">Qty</label>
          <input
            type="number"
            min="0"
            step="any"
            value={item.quantity}
            onChange={(event) =>
              onUpdate(index, "quantity", parseFloat(event.target.value) || 0)
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-0.5 block text-[9px] text-muted-foreground">Rate (Rs)</label>
          <input
            type="number"
            min="0"
            step="any"
            value={item.rate}
            onChange={(event) => onUpdate(index, "rate", parseFloat(event.target.value) || 0)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-0.5 block text-[9px] text-muted-foreground">Unit</label>
          <input
            value={item.unit}
            onChange={(event) => onUpdate(index, "unit", event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-0.5 block text-[9px] text-muted-foreground">GST%</label>
          <input
            type="number"
            min="0"
            step="any"
            value={item.gst_percent}
            onChange={(event) =>
              onUpdate(index, "gst_percent", parseFloat(event.target.value) || 0)
            }
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-1.5 text-right text-[11px] font-medium text-foreground">
        {formatCurrency(item.line_total)}
      </div>
    </div>
  );
}
