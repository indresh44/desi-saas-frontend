"use client";

import { ActionField } from "@/components/chat/action-forms/create-lead-form";
import { MessageCircle } from "lucide-react";

interface SendReminderFormProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function SendReminderForm({ data, onChange }: SendReminderFormProps) {
  const customerName = String(data.customer_name ?? "");
  const customerPhone = String(data.customer_phone ?? "");
  const invoiceNumbers = String(data.invoice_numbers ?? "");
  const outstanding = Number(data.outstanding_amount ?? 0);

  function buildMessage(tone: "polite" | "firm" | "urgent"): string {
    if (tone === "firm") {
      return (
        `Namaste ${customerName} ji,\n\n` +
        `Aapke account mein ₹${outstanding.toLocaleString("en-IN")} ka outstanding amount hai` +
        `${invoiceNumbers ? ` (Invoice: ${invoiceNumbers})` : ""}.\n\n` +
        "Kripya jaldi se jaldi payment karein. Agar koi issue hai toh humse baat karein.\n\n" +
        "Dhanyavaad."
      );
    }

    if (tone === "urgent") {
      return (
        `${customerName} ji,\n\n` +
        `Aapka ₹${outstanding.toLocaleString("en-IN")} ka payment kaafi din se pending hai` +
        `${invoiceNumbers ? ` (${invoiceNumbers})` : ""}.\n\n` +
        "Kripya aaj hi payment karein. Yeh final reminder hai.\n\n" +
        "Dhanyavaad."
      );
    }

    return (
      `Namaste ${customerName} ji,\n\n` +
      `Yeh ek friendly reminder hai ki aapka ₹${outstanding.toLocaleString("en-IN")} ka payment pending hai` +
      `${invoiceNumbers ? ` (${invoiceNumbers})` : ""}.\n\n` +
      "Agar payment ho chuki hai toh please ignore karein.\n\n" +
      "Dhanyavaad!"
    );
  }

  function buildWhatsappUrl(message: string): string {
    return customerPhone
      ? `https://wa.me/91${customerPhone}?text=${encodeURIComponent(message)}`
      : "";
  }

  function update(field: string, value: unknown) {
    const nextData = { ...data, [field]: value };
    if (field === "message" && typeof value === "string") {
      nextData.whatsapp_url = buildWhatsappUrl(value);
    }
    onChange(nextData);
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const whatsappUrl = String(data.whatsapp_url ?? "");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-800">{String(data.customer_name ?? "")}</span>
        <span className="font-medium text-red-600">{formatCurrency(outstanding)} due</span>
      </div>

      {data.invoice_numbers ? (
        <p className="text-[11px] text-zinc-400">Invoices: {String(data.invoice_numbers)}</p>
      ) : null}

      <div>
        <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-amber-700">
          Tone
        </label>
        <div className="flex gap-1.5">
          {(["polite", "firm", "urgent"] as const).map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => {
                const message = buildMessage(tone);
                onChange({
                  ...data,
                  tone,
                  message,
                  whatsapp_url: buildWhatsappUrl(message),
                });
              }}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                data.tone === tone
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <ActionField
        label="Message"
        value={String(data.message ?? "")}
        onChange={(value) => update("message", value)}
        multiline
      />

      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2 text-xs font-medium text-white transition-colors hover:bg-green-700"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Send via WhatsApp
        </a>
      ) : null}
    </div>
  );
}
