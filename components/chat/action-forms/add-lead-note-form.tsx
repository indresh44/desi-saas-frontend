"use client";

import { ActionField } from "@/components/chat/action-forms/create-lead-form";

interface AddLeadNoteFormProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function AddLeadNoteForm({ data, onChange }: AddLeadNoteFormProps) {
  function update(field: string, value: unknown) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="space-y-2">
      {data.lead_title ? (
        <p className="text-xs text-muted-foreground">
          Lead: <span className="font-medium text-foreground">{String(data.lead_title)}</span>
        </p>
      ) : null}

      <ActionField
        label="Note"
        value={(data.note as string | undefined) ?? ""}
        onChange={(value) => update("note", value)}
        multiline
        placeholder="Enter note..."
      />
    </div>
  );
}
