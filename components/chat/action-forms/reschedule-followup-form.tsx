"use client";

import { ArrowRight } from "lucide-react";
import { ActionField } from "@/components/chat/action-forms/create-lead-form";

interface RescheduleFollowupFormProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function RescheduleFollowupForm({ data, onChange }: RescheduleFollowupFormProps) {
  function update(field: string, value: unknown) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-zinc-600">
        {data.lead_title ? (
          <span>
            Lead: <span className="font-medium text-zinc-800">{String(data.lead_title)}</span>
          </span>
        ) : null}
        {data.lead_title && data.customer_name ? " · " : null}
        {data.customer_name ? <span className="text-zinc-500">{String(data.customer_name)}</span> : null}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-zinc-600">
          {String(data.original_date ?? "").slice(0, 10) || "-"}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
        <div className="grid flex-1 grid-cols-2 gap-1.5">
          <ActionField
            label=""
            value={String(data.new_date ?? "")}
            onChange={(value) => update("new_date", value)}
            type="date"
          />
          <ActionField
            label=""
            value={String(data.new_time ?? "")}
            onChange={(value) => update("new_time", value)}
            type="time"
          />
        </div>
      </div>

      <ActionField
        label="Reason"
        value={String(data.reason ?? "")}
        onChange={(value) => update("reason", value)}
        placeholder="Optional - e.g. 'customer busy', 'no answer'"
      />
    </div>
  );
}
