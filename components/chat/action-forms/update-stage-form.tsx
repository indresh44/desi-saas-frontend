"use client";

import { ArrowRight } from "lucide-react";
import { ActionField } from "@/components/chat/action-forms/create-lead-form";

interface UpdateStageFormProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function UpdateStageForm({ data, onChange }: UpdateStageFormProps) {
  function update(field: string, value: unknown) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="space-y-2">
      {data.lead_title ? (
        <p className="text-xs text-zinc-600">
          Lead: <span className="font-medium text-zinc-800">{String(data.lead_title)}</span>
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600">
          {(data.current_stage as string | undefined) ?? "—"}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
        <div className="flex-1">
          <ActionField
            label=""
            value={(data.new_stage as string | undefined) ?? ""}
            onChange={(value) => update("new_stage", value)}
            placeholder="New stage"
          />
        </div>
      </div>
    </div>
  );
}
