"use client";

import { ActionField } from "@/components/chat/action-forms/create-lead-form";

interface ScheduleFollowupFormProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function ScheduleFollowupForm({ data, onChange }: ScheduleFollowupFormProps) {
  function update(field: string, value: unknown) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="space-y-2">
      {data.lead_title || data.customer_name ? (
        <p className="text-xs text-muted-foreground">
          {data.lead_title ? (
            <>
              Lead: <span className="font-medium text-foreground">{String(data.lead_title)}</span>
            </>
          ) : null}
          {data.lead_title && data.customer_name ? " · " : null}
          {data.customer_name ? <span className="text-muted-foreground">{String(data.customer_name)}</span> : null}
        </p>
      ) : null}

      <ActionField
        label="Type"
        value={(data.followup_type as string | undefined) ?? "call"}
        onChange={(value) => update("followup_type", value)}
        placeholder="call, meeting, visit, whatsapp"
      />

      <div className="grid grid-cols-2 gap-2">
        <ActionField
          label="Date"
          value={(data.scheduled_date as string | undefined) ?? ""}
          onChange={(value) => update("scheduled_date", value)}
          type="date"
        />
        <ActionField
          label="Time"
          value={(data.scheduled_time as string | undefined) ?? ""}
          onChange={(value) => update("scheduled_time", value)}
          type="time"
        />
      </div>

      <ActionField
        label="Notes"
        value={(data.notes as string | undefined) ?? ""}
        onChange={(value) => update("notes", value)}
        multiline
      />
    </div>
  );
}
