"use client";

import { ActionField } from "@/components/chat/action-forms/create-lead-form";

interface RecordPaymentFormProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function RecordPaymentForm({ data, onChange }: RecordPaymentFormProps) {
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

  const totalAmount = Number(data.total_amount ?? 0);
  const alreadyPaid = Number(data.amount_already_paid ?? 0);
  const balanceDue = Number(data.balance_due ?? 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {String(data.invoice_number ?? "")}
          {data.customer_name ? (
            <span className="text-muted-foreground"> · {String(data.customer_name)}</span>
          ) : null}
        </span>
      </div>

      <div className="rounded-md bg-muted px-2.5 py-2 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Total</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
        {alreadyPaid > 0 ? (
          <div className="flex justify-between text-muted-foreground">
            <span>Already paid</span>
            <span>- {formatCurrency(alreadyPaid)}</span>
          </div>
        ) : null}
        <div className="mt-1 flex justify-between border-t border-border pt-1 font-medium text-foreground">
          <span>Balance due</span>
          <span>{formatCurrency(balanceDue)}</span>
        </div>
      </div>

      <ActionField
        label="Amount (₹)"
        value={data.amount != null ? String(data.amount) : ""}
        onChange={(value) => update("amount", value ? Number(value) : 0)}
        type="number"
      />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Method
          </label>
          <select
            value={String(data.payment_method ?? "upi")}
            onChange={(event) => update("payment_method", event.target.value)}
            className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="card">Card</option>
          </select>
        </div>
        <ActionField
          label="Date"
          value={String(data.payment_date ?? "")}
          onChange={(value) => update("payment_date", value)}
          type="date"
        />
      </div>

      <ActionField
        label="Reference"
        value={String(data.reference ?? "")}
        onChange={(value) => update("reference", value)}
        placeholder="UPI ref, txn ID, cheque no..."
      />

      <ActionField
        label="Notes"
        value={String(data.notes ?? "")}
        onChange={(value) => update("notes", value)}
        multiline
        placeholder="Optional notes..."
      />
    </div>
  );
}
