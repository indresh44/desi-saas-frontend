"use client";

import { ActionField } from "@/components/chat/action-forms/create-lead-form";

interface CompleteFollowupFormProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function CompleteFollowupForm({ data, onChange }: CompleteFollowupFormProps) {
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

      <p className="text-[11px] text-zinc-400">
        {String(data.followup_type ?? "call")} · scheduled: {String(data.scheduled_at ?? "").slice(0, 10)}
      </p>

      <ActionField
        label="Outcome / Note"
        value={String(data.outcome_note ?? "")}
        onChange={(value) => update("outcome_note", value)}
        multiline
        placeholder="What happened? E.g. 'Discussed pricing, sending quote tomorrow'"
      />
    </div>
  );
}
