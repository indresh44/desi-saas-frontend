"use client";

import { Info, RefreshCw } from "lucide-react";
import type { PricingMode } from "@/lib/types/invoice-template";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Props = {
  templateName: string;
  templateSavedAt: string;
  mode: PricingMode;
  onToggle: () => void;
  disabled?: boolean;
};

export function PricingModeBanner({
  templateName,
  templateSavedAt,
  mode,
  onToggle,
  disabled = false,
}: Props) {
  const isTemplate = mode === "template";
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
        isTemplate
          ? "border-blue-200 bg-blue-50 text-blue-900"
          : "border-teal-200 bg-teal-50 text-teal-900"
      }`}
    >
      <div className="flex min-w-0 items-start gap-2">
        <Info className="h-4 w-4 shrink-0" />
        <div className="min-w-0">
          {isTemplate ? (
            <p>
              Using prices from template <span className="font-medium">{templateName}</span> saved on{" "}
              {formatDate(templateSavedAt)}.
            </p>
          ) : (
            <p>Using latest catalog prices.</p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          isTemplate
            ? "border-blue-300 bg-white/70 hover:bg-white"
            : "border-teal-300 bg-white/70 hover:bg-white"
        }`}
      >
        <RefreshCw className="h-3 w-3" />
        {isTemplate ? "Refresh to current prices" : "Revert to template prices"}
      </button>
    </div>
  );
}
