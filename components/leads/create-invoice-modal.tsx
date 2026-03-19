"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createInvoice } from "@/lib/api/invoices";
import { DEFAULT_USER_ID } from "@/lib/constants/api";

type LineItem = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  gstPercent: string;
};

function calcRowTotal(item: LineItem): number {
  const qty = parseFloat(item.quantity) || 0;
  const price = parseFloat(item.unitPrice) || 0;
  const gst = parseFloat(item.gstPercent) || 0;
  const base = qty * price;
  return base + (base * gst) / 100;
}

const inputCls =
  "w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20";

type Props = {
  leadId: string;
  onCreated: () => void;
  onClose: () => void;
};

export function CreateInvoiceModal({ leadId, onCreated, onClose }: Props) {
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: "1", unitPrice: "", gstPercent: "0" },
  ]);
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        description: "",
        quantity: "1",
        unitPrice: "",
        gstPercent: "0",
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const totalGst = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    const gst = parseFloat(item.gstPercent) || 0;
    return sum + (qty * price * gst) / 100;
  }, 0);

  const grandTotal = subtotal + totalGst;

  const handleSubmit = async () => {
    setError(null);
    if (!dueDate) {
      setError("Due date is required.");
      return;
    }
    if (items.some((i) => !i.description.trim() || !i.unitPrice)) {
      setError("All items need a description and unit price.");
      return;
    }
    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await createInvoice(
        {
          invoice: {
            lead_id: leadId,
            total_amount: grandTotal,
            status: "draft",
            issued_date: today,
            due_date: dueDate,
          },
          items: items.map((item) => ({
            description: item.description.trim(),
            quantity: parseFloat(item.quantity) || 1,
            unit_price: parseFloat(item.unitPrice) || 0,
            gst_percent: parseFloat(item.gstPercent) || 0,
          })),
        },
        DEFAULT_USER_ID
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
        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <h2 className="text-base font-semibold text-zinc-900">New Invoice</h2>
            <Button type="button" size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {/* Column headers */}
            <div className="grid grid-cols-12 gap-2 px-1 text-xs font-medium text-zinc-500">
              <span className="col-span-4">Description</span>
              <span className="col-span-2">Qty</span>
              <span className="col-span-2">Unit Price</span>
              <span className="col-span-2">GST %</span>
              <span className="col-span-1 text-right">Total</span>
              <span className="col-span-1" />
            </div>

            {/* Line items */}
            <div className="space-y-2">
              {items.map((item) => {
                const rowTotal = calcRowTotal(item);
                return (
                  <div key={item.id} className="grid grid-cols-12 items-center gap-2">
                    <input
                      className={`col-span-4 ${inputCls}`}
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      min="1"
                      className={`col-span-2 ${inputCls}`}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, "quantity", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={`col-span-2 ${inputCls}`}
                      placeholder="0.00"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(item.id, "unitPrice", e.target.value)
                      }
                    />
                    <select
                      className={`col-span-2 ${inputCls}`}
                      value={item.gstPercent}
                      onChange={(e) =>
                        updateItem(item.id, "gstPercent", e.target.value)
                      }
                    >
                      {[0, 5, 12, 18, 28].map((g) => (
                        <option key={g} value={String(g)}>
                          {g}%
                        </option>
                      ))}
                    </select>
                    <span className="col-span-1 text-right text-sm text-zinc-700">
                      ₹{rowTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </span>
                    <button
                      type="button"
                      className="col-span-1 flex justify-center text-zinc-400 hover:text-red-500 disabled:opacity-30"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>

            {/* Totals */}
            <div className="space-y-1 rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>
                  ₹{subtotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Total GST</span>
                <span>
                  ₹{totalGst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-1 font-semibold text-zinc-900">
                <span>Grand Total</span>
                <span>
                  ₹{grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Due date */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-700">
                Due Date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
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
    </>
  );
}
