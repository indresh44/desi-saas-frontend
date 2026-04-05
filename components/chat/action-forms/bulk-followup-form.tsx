"use client";

import { Calendar, CheckCircle2, XCircle } from "lucide-react";
import { ActionField } from "@/components/chat/action-forms/create-lead-form";

interface BulkFollowupFormProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

interface FollowupSummary {
  followup_id: string;
  lead_title: string;
  customer_name: string;
  scheduled_at: string;
  followup_type: string;
}

export function BulkFollowupForm({ data, onChange }: BulkFollowupFormProps) {
  function update(field: string, value: unknown) {
    onChange({ ...data, [field]: value });
  }

  const action = String(data.action ?? "complete");
  const count = Number(data.count ?? 0);
  const followups = Array.isArray(data.followups) ? (data.followups as FollowupSummary[]) : [];
  const actionLabel = String(data.action_label ?? action);
  const filterLabel = String(data.filter_label ?? "");

  const ActionIcon = action === "complete" ? CheckCircle2 : action === "cancel" ? XCircle : Calendar;
  const actionColor =
    action === "complete" ? "text-emerald-600" : action === "cancel" ? "text-red-500" : "text-blue-600";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ActionIcon className={`h-4 w-4 ${actionColor}`} />
        <p className="text-xs font-medium text-zinc-800">
          {actionLabel} · {count} {filterLabel} follow-ups
        </p>
      </div>

      <div className="max-h-[120px] overflow-y-auto rounded-md border border-amber-200 bg-white">
        {followups.map((followup, index) => (
          <div
            key={followup.followup_id}
            className={`flex items-center justify-between px-2.5 py-1.5 text-[11px] ${
              index < followups.length - 1 ? "border-b border-amber-100" : ""
            }`}
          >
            <span className="text-zinc-700">
              {followup.lead_title || "Untitled"}{" "}
              <span className="text-zinc-400">({followup.customer_name || "-"})</span>
            </span>
            <span className="text-zinc-400">{String(followup.scheduled_at ?? "").slice(0, 10)}</span>
          </div>
        ))}
      </div>

      {action === "reschedule" ? (
        <div className="grid grid-cols-2 gap-2">
          <ActionField
            label="New Date"
            value={String(data.reschedule_to_date ?? "")}
            onChange={(value) => update("reschedule_to_date", value)}
            type="date"
          />
          <ActionField
            label="New Time"
            value={String(data.reschedule_to_time ?? "")}
            onChange={(value) => update("reschedule_to_time", value)}
            type="time"
          />
        </div>
      ) : null}

      <ActionField
        label="Note"
        value={String(data.note ?? "")}
        onChange={(value) => update("note", value)}
        placeholder={action === "cancel" ? "e.g. 'No response after 3 attempts'" : "Optional note..."}
      />
    </div>
  );
}
