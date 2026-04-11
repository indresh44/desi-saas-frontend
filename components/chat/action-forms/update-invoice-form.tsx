"use client";

import { ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";
import { ActionField } from "@/components/chat/action-forms/create-lead-form";

interface UpdateInvoiceFormProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

interface ProposedItem {
  catalog_item_id: string | null;
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  unit: string;
  gst_percent: number;
  line_total: number;
}

export function UpdateInvoiceForm({ data, onChange }: UpdateInvoiceFormProps) {
  function update(field: string, value: unknown) {
    onChange({ ...data, [field]: value });
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const changes = (data.changes as Record<string, unknown>) ?? {};
  const proposedItems = (data.proposed_items as ProposedItem[] | null) ?? null;
  const currentTotal = Number(data.current_total ?? 0);
  const proposedTotal = data.proposed_total != null ? Number(data.proposed_total) : null;

  return (
    <div className="space-y-2.5">
      <p className="text-xs font-medium text-foreground">{String(data.invoice_number ?? "")}</p>

      {changes.new_status ? (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Status:</span>
          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-muted-foreground">
            {String(data.current_status ?? "draft")}
          </span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className={`rounded-full px-2 py-0.5 font-medium ${
            changes.new_status === "approved"
              ? "bg-teal-100 text-teal-700"
              : "bg-blue-100 text-blue-700"
          }`}>
            {String(changes.new_status)}
          </span>
        </div>
      ) : null}

      {changes.new_due_date ? (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Due date:</span>
          <span className="text-muted-foreground">{String(data.current_due_date ?? "-")}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <ActionField
            label=""
            value={String(changes.new_due_date ?? "")}
            onChange={(value) => update("changes", { ...changes, new_due_date: value })}
            type="date"
          />
        </div>
      ) : null}

      {Array.isArray(changes.added_items) && changes.added_items.length > 0 ? (
        <div className="flex items-center gap-1.5 text-[11px]">
          <Plus className="h-3 w-3 text-emerald-500" />
          <span className="text-emerald-700">Adding: {(changes.added_items as string[]).join(", ")}</span>
        </div>
      ) : null}

      {Array.isArray(changes.updated_items) && changes.updated_items.length > 0 ? (
        <div className="flex items-center gap-1.5 text-[11px]">
          <Pencil className="h-3 w-3 text-amber-500" />
          <span className="text-muted-foreground">Updating: {(changes.updated_items as string[]).join(", ")}</span>
        </div>
      ) : null}

      {Array.isArray(changes.removed_items) && changes.removed_items.length > 0 ? (
        <div className="flex items-center gap-1.5 text-[11px]">
          <Trash2 className="h-3 w-3 text-red-500" />
          <span className="text-red-700">Removing: {(changes.removed_items as string[]).join(", ")}</span>
        </div>
      ) : null}

      {proposedItems ? (
        <div className="max-h-[160px] overflow-y-auto rounded-md border border-border bg-background">
          {proposedItems.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className={`px-2.5 py-1.5 text-[11px] ${
                index < proposedItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{item.name}</span>
                <span className="text-muted-foreground">{formatCurrency(Number(item.line_total ?? 0))}</span>
              </div>
              <div className="mt-0.5 text-muted-foreground">
                {Number(item.quantity ?? 0)} × ₹{Number(item.rate ?? 0).toLocaleString("en-IN")} / {item.unit}
                {item.gst_percent ? ` · GST ${item.gst_percent}%` : ""}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {proposedTotal !== null && proposedTotal !== currentTotal ? (
        <div className="flex items-center justify-between rounded-md bg-muted px-2.5 py-1.5 text-xs">
          <span className="text-muted-foreground">Total:</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground line-through">{formatCurrency(currentTotal)}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium text-foreground">{formatCurrency(proposedTotal)}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}