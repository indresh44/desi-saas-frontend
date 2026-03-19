"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createMeeting, updateMeeting } from "@/lib/api/meetings";
import type { CreateMeetingInput, Meeting } from "@/lib/types/meeting";

const quickScheduleSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  scheduledAt: z.string().min(1, "Date and time are required"),
  duration: z.coerce.number().min(5, "Minimum 5 minutes").max(480, "Maximum 8 hours"),
  notes: z.string().optional().or(z.literal("")),
});

type QuickScheduleValues = z.infer<typeof quickScheduleSchema>;
type QuickScheduleFormInput = z.input<typeof quickScheduleSchema>;

const defaultValues: QuickScheduleValues = {
  title: "",
  scheduledAt: "",
  duration: 30,
  notes: "",
};

const inputCls =
  "mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20";

export interface LeadMeetingsSectionProps {
  meetings: Meeting[];
  isLoading: boolean;
  leadId: string;
  customerId: string;
  customerName: string;
  onMeetingCreated: () => void | Promise<void>;
  onStatusChange: () => void | Promise<void>;
}

export function LeadMeetingsSection({
  meetings,
  isLoading,
  leadId,
  customerId,
  customerName,
  onMeetingCreated,
  onStatusChange,
}: LeadMeetingsSectionProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);

  const upcoming = useMemo(
    () =>
      meetings
        .filter((meeting) => meeting.status === "scheduled")
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [meetings]
  );

  const past = useMemo(
    () =>
      meetings
        .filter((meeting) => meeting.status !== "scheduled")
        .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt)),
    [meetings]
  );

  const handleMarkDone = async (meetingId: string) => {
    setActionError(null);
    setActiveMeetingId(meetingId);
    try {
      await updateMeeting(meetingId, { status: "completed" });
      await onStatusChange();
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        setActionError(error.message);
      } else {
        setActionError("Failed to update meeting.");
      }
    } finally {
      setActiveMeetingId(null);
    }
  };

  const handleCancel = async (meetingId: string) => {
    setActionError(null);
    setActiveMeetingId(meetingId);
    try {
      await updateMeeting(meetingId, { status: "cancelled" });
      await onStatusChange();
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        setActionError(error.message);
      } else {
        setActionError("Failed to cancel meeting.");
      }
    } finally {
      setActiveMeetingId(null);
    }
  };

  return (
    <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">Meetings</h2>
        <button
          type="button"
          onClick={() => setShowCreateDialog(true)}
          className="text-xs text-primary hover:underline disabled:opacity-50"
          disabled={!customerId}
        >
          + Schedule
        </button>
      </div>

      {actionError ? (
        <p className="text-xs text-red-600">{actionError}</p>
      ) : null}

      {isLoading ? <p className="text-xs text-zinc-400">Loading...</p> : null}

      {!isLoading && meetings.length === 0 ? (
        <p className="text-xs text-zinc-400">
          No meetings yet. Schedule one to get started.
        </p>
      ) : null}

      {upcoming.length > 0 ? (
        <div className="space-y-2">
          {upcoming.map((meeting) => (
            <MeetingItem
              key={meeting.id}
              meeting={meeting}
              isBusy={activeMeetingId === meeting.id}
              onMarkDone={handleMarkDone}
              onCancel={handleCancel}
            />
          ))}
        </div>
      ) : null}

      {past.length > 0 ? <PastMeetings meetings={past} /> : null}

      {showCreateDialog ? (
        <QuickScheduleDialog
          leadId={leadId}
          customerId={customerId}
          customerName={customerName}
          onClose={() => setShowCreateDialog(false)}
          onCreated={async () => {
            setShowCreateDialog(false);
            await onMeetingCreated();
          }}
        />
      ) : null}
    </section>
  );
}

function MeetingItem({
  meeting,
  isBusy,
  onMarkDone,
  onCancel,
}: {
  meeting: Meeting;
  isBusy?: boolean;
  onMarkDone?: (id: string) => void | Promise<void>;
  onCancel?: (id: string) => void | Promise<void>;
}) {
  const isScheduled = meeting.status === "scheduled";

  return (
    <div
      className={`rounded-lg border p-3 ${
        isScheduled ? "border-zinc-200 bg-white" : "border-zinc-100 bg-zinc-50 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{formatMeetingDate(meeting.scheduledAt)}</span>
            <span>·</span>
            <span>{meeting.durationMinutes} min</span>
          </div>
          <div className="mt-0.5 truncate text-sm font-medium text-zinc-900">
            {meeting.title}
          </div>
          {meeting.notes ? (
            <div className="mt-0.5 truncate text-xs text-zinc-500/80">
              {meeting.notes}
            </div>
          ) : null}
        </div>

        {!isScheduled ? <StatusBadge status={meeting.status} /> : null}
      </div>

      {isScheduled && onMarkDone && onCancel ? (
        <div className="mt-2 flex items-center gap-3 border-t border-zinc-200/60 pt-2">
          <button
            type="button"
            onClick={() => void onMarkDone(meeting.id)}
            className="text-xs text-green-600 hover:underline disabled:opacity-50"
            disabled={isBusy}
          >
            ✓ Done
          </button>
          <button
            type="button"
            onClick={() => void onCancel(meeting.id)}
            className="text-xs text-zinc-500 hover:underline disabled:opacity-50"
            disabled={isBusy}
          >
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PastMeetings({ meetings }: { meetings: Meeting[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? meetings : meetings.slice(0, 2);
  const hasMore = meetings.length > 2;

  return (
    <div>
      <div className="mb-2 text-xs text-zinc-400">Past</div>
      <div className="space-y-2">
        {visible.map((meeting) => (
          <MeetingItem key={meeting.id} meeting={meeting} />
        ))}
      </div>
      {hasMore ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-xs text-primary hover:underline"
        >
          {expanded ? "Show less" : `Show ${meetings.length - 2} more`}
        </button>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: Meeting["status"] }) {
  const config = {
    scheduled: { bg: "bg-blue-50", text: "text-blue-700", label: "Scheduled" },
    completed: { bg: "bg-green-50", text: "text-green-700", label: "Completed" },
    cancelled: { bg: "bg-zinc-100", text: "text-zinc-500", label: "Cancelled" },
    no_show: { bg: "bg-red-50", text: "text-red-600", label: "No show" },
  };

  const current = config[status];

  return (
    <span
      className={`whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-medium ${current.bg} ${current.text}`}
    >
      {current.label}
    </span>
  );
}

function formatMeetingDate(isoString: string): string {
  const date = new Date(isoString);
  const dateKey = isoString.split("T")[0];
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const time = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (dateKey === today) {
    return `Today, ${time}`;
  }

  if (dateKey === tomorrow) {
    return `Tomorrow, ${time}`;
  }

  const dateLabel = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  return `${dateLabel}, ${time}`;
}

function QuickScheduleDialog({
  leadId,
  customerId,
  customerName,
  onClose,
  onCreated,
}: {
  leadId: string;
  customerId: string;
  customerName: string;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<QuickScheduleFormInput, undefined, QuickScheduleValues>({
    resolver: zodResolver(quickScheduleSchema),
    defaultValues,
  });

  const isSubmitting = form.formState.isSubmitting;
  const duration = useWatch({
    control: form.control,
    name: "duration",
  });

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    form.reset(defaultValues);
    setSubmitError(null);
    onClose();
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);

    const payload: CreateMeetingInput = {
      customer_id: customerId,
      lead_id: leadId,
      title: values.title.trim(),
      scheduled_at: new Date(values.scheduledAt).toISOString(),
      duration_minutes: values.duration,
      notes: values.notes?.trim() || null,
    };

    try {
      await createMeeting(payload);
      await onCreated();
      form.reset(defaultValues);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Failed to schedule meeting");
      }
    }
  });

  return (
    <>
      <button
        type="button"
        aria-label="Close schedule meeting dialog"
        className="fixed inset-0 z-30 bg-zinc-900/30"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-zinc-200 px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Schedule meeting</h2>
              <p className="text-xs text-zinc-500">With {customerName || "customer"}</p>
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={onSubmit} className="space-y-3 p-4">
            <label className="block text-xs text-zinc-500">
              <span>Title</span>
              <input
                {...form.register("title")}
                className={inputCls}
                placeholder="e.g., Site visit, 1:1 Session"
                disabled={isSubmitting}
              />
              {form.formState.errors.title?.message ? (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.title.message}
                </p>
              ) : null}
            </label>

            <label className="block text-xs text-zinc-500">
              <span>Date & time</span>
              <input
                type="datetime-local"
                {...form.register("scheduledAt")}
                className={inputCls}
                disabled={isSubmitting}
              />
              {form.formState.errors.scheduledAt?.message ? (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.scheduledAt.message}
                </p>
              ) : null}
            </label>

            <div>
              <label className="block text-xs text-zinc-500">
                <span>Duration (minutes)</span>
                <input
                  type="number"
                  min={5}
                  max={480}
                  {...form.register("duration")}
                  className={inputCls}
                  disabled={isSubmitting}
                />
              </label>
              <div className="mt-1.5 flex gap-1.5">
                {[15, 30, 45, 60, 90].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      form.setValue("duration", option, { shouldValidate: true })
                    }
                    className={`rounded border px-2 py-0.5 text-xs ${
                      duration === option
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
                    }`}
                    disabled={isSubmitting}
                  >
                    {option}m
                  </button>
                ))}
              </div>
              {form.formState.errors.duration?.message ? (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.duration.message}
                </p>
              ) : null}
            </div>

            <label className="block text-xs text-zinc-500">
              <span>Notes</span>
              <textarea
                {...form.register("notes")}
                rows={2}
                className={`${inputCls} resize-none`}
                placeholder="Any notes..."
                disabled={isSubmitting}
              />
            </label>

            {submitError ? <p className="text-xs text-red-600">{submitError}</p> : null}

            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 pt-3">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Scheduling..." : "Schedule"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
