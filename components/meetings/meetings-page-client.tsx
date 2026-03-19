"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, MessageCircle, Plus } from "lucide-react";
import { CreateMeetingDialog } from "@/components/meetings/create-meeting-dialog";
import { Button } from "@/components/ui/button";
import {
  deleteMeeting,
  fetchMeetings,
  updateMeeting,
} from "@/lib/api/meetings";
import type { Meeting, MeetingStatus } from "@/lib/types/meeting";

const DATE_FILTERS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
] as const;

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
] as const;

type DateFilter = (typeof DATE_FILTERS)[number]["value"];
type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

type DateGroup = {
  label: string;
  date: string;
  meetings: Meeting[];
};

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getMonday(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getSunday(date: Date): Date {
  const monday = getMonday(date);
  const result = new Date(monday);
  result.setDate(monday.getDate() + 6);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getDateFilterParams(filter: DateFilter) {
  if (filter === "today") {
    const today = formatDate(new Date());
    return { from_date: today, to_date: today, limit: 20, offset: 0 };
  }

  if (filter === "week") {
    return {
      from_date: formatDate(getMonday(new Date())),
      to_date: formatDate(getSunday(new Date())),
      limit: 20,
      offset: 0,
    };
  }

  if (filter === "month") {
    const now = new Date();
    return {
      from_date: formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      to_date: formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      limit: 20,
      offset: 0,
    };
  }

  return { limit: 50, offset: 0 };
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function groupMeetingsByDate(meetings: Meeting[]): DateGroup[] {
  const groups = new Map<string, Meeting[]>();
  const sorted = [...meetings].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  sorted.forEach((meeting) => {
    const dateKey = meeting.scheduledAt.split("T")[0];
    const existing = groups.get(dateKey) ?? [];
    existing.push(meeting);
    groups.set(dateKey, existing);
  });

  const today = formatDate(new Date());
  const tomorrow = formatDate(new Date(Date.now() + 86400000));
  const yesterday = formatDate(new Date(Date.now() - 86400000));

  return Array.from(groups.entries()).map(([dateKey, dateMeetings]) => {
    let label = dateKey;

    if (dateKey === today) {
      label = "Today";
    } else if (dateKey === tomorrow) {
      label = "Tomorrow";
    } else if (dateKey === yesterday) {
      label = "Yesterday";
    } else {
      const date = new Date(`${dateKey}T00:00:00`);
      label = date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    return { label, date: dateKey, meetings: dateMeetings };
  });
}

function StatusBadge({ status }: { status: MeetingStatus }) {
  const styles: Record<MeetingStatus, string> = {
    scheduled: "bg-blue-50 text-blue-700",
    completed: "bg-green-50 text-green-700",
    cancelled: "bg-zinc-100 text-zinc-500",
    no_show: "bg-red-50 text-red-600",
  };

  const labels: Record<MeetingStatus, string> = {
    scheduled: "Scheduled",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No show",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-900"
      }`}
    >
      {label}
    </button>
  );
}

export default function MeetingsPageClient() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("upcoming");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);

  const refreshMeetings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { meetings: nextMeetings, total: nextTotal } = await fetchMeetings(
        getDateFilterParams(dateFilter)
      );
      setMeetings(nextMeetings);
      setTotal(nextTotal);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load meetings."
      );
      setMeetings([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    void refreshMeetings();
  }, [refreshMeetings]);

  const filteredMeetings = useMemo(() => {
    if (statusFilter === "all") {
      return meetings;
    }

    return meetings.filter((meeting) => meeting.status === statusFilter);
  }, [meetings, statusFilter]);

  const groupedMeetings = useMemo(
    () => groupMeetingsByDate(filteredMeetings),
    [filteredMeetings]
  );

  const handleDateFilter = (filter: DateFilter) => {
    setDateFilter(filter);
  };

  const loadMore = async () => {
    setIsLoadingMore(true);
    setErrorMessage(null);

    try {
      const params = getDateFilterParams(dateFilter);
      const { meetings: moreMeetings } = await fetchMeetings({
        ...params,
        limit: 20,
        offset: meetings.length,
      });
      setMeetings((prev) => [...prev, ...moreMeetings]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load more meetings."
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  const updateMeetingStatus = async (meetingId: string, status: MeetingStatus) => {
    setActiveMeetingId(meetingId);
    setErrorMessage(null);

    try {
      await updateMeeting(meetingId, { status });
      await refreshMeetings();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update meeting."
      );
    } finally {
      setActiveMeetingId(null);
    }
  };

  const handleDelete = async (meetingId: string) => {
    if (!window.confirm("Delete this scheduled meeting?")) {
      return;
    }

    setActiveMeetingId(meetingId);
    setErrorMessage(null);

    try {
      await deleteMeeting(meetingId);
      await refreshMeetings();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete meeting."
      );
    } finally {
      setActiveMeetingId(null);
    }
  };

  const subtitle = useMemo(() => {
    if (total === 0) {
      return "Keep track of scheduled visits, calls, and follow-ups.";
    }

    return `${filteredMeetings.length} shown of ${total} meeting${total === 1 ? "" : "s"}.`;
  }, [filteredMeetings.length, total]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Meetings
          </h1>
          <p className="text-sm text-zinc-500">{subtitle}</p>
        </div>

        <Button type="button" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          {DATE_FILTERS.map((filter) => (
            <FilterPill
              key={filter.value}
              label={filter.label}
              active={dateFilter === filter.value}
              onClick={() => handleDateFilter(filter.value)}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((filter) => (
            <FilterPill
              key={filter.value}
              label={filter.label}
              active={statusFilter === filter.value}
              onClick={() => setStatusFilter(filter.value)}
            />
          ))}
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
          <div className="h-16 animate-pulse rounded-lg bg-zinc-100" />
          <div className="h-16 animate-pulse rounded-lg bg-zinc-100" />
          <div className="h-16 animate-pulse rounded-lg bg-zinc-100" />
        </div>
      ) : meetings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-6 py-12 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
            <Calendar className="h-5 w-5 text-zinc-500" />
          </div>
          <h2 className="text-base font-medium text-zinc-900">No upcoming meetings</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Schedule your first meeting to get started.
          </p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-6 py-12 text-center">
          <h2 className="text-base font-medium text-zinc-900">No meetings found</h2>
          <p className="mt-1 text-sm text-zinc-500">
            No meetings found for the selected filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedMeetings.map((group) => (
            <section
              key={group.date}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
            >
              <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-800">
                {group.label}
              </div>
              <div className="px-4">
                {group.meetings.map((meeting) => {
                  const isMutating = activeMeetingId === meeting.id;
                  const reminderMessage = encodeURIComponent(
                    `Hi ${meeting.customerName?.split(" ")[0] || ""}, reminder about our meeting "${meeting.title}" scheduled for ${formatDateTime(meeting.scheduledAt)}. See you then!`
                  );
                  const whatsappHref = meeting.customerPhone
                    ? `https://wa.me/91${normalizePhone(meeting.customerPhone)}?text=${reminderMessage}`
                    : null;

                  return (
                    <div
                      key={meeting.id}
                      className="flex flex-col gap-3 border-b border-border/30 py-3 last:border-b-0 md:flex-row md:items-start md:justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-[72px] shrink-0 text-sm text-muted-foreground">
                            {formatTime(meeting.scheduledAt)}
                          </span>
                          <span className="text-sm font-medium text-zinc-900">
                            {meeting.title}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            - {meeting.customerName || "Unknown"}
                          </span>
                          {meeting.leadTitle ? (
                            <span className="text-xs text-muted-foreground/70">
                              · {meeting.leadTitle}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-3 md:ml-[72px]">
                          <span className="text-xs text-muted-foreground">
                            {meeting.durationMinutes} min
                          </span>
                          {meeting.notes ? (
                            <span className="max-w-[200px] truncate text-xs text-muted-foreground/70">
                              {meeting.notes}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {meeting.status === "scheduled" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void updateMeetingStatus(meeting.id, "completed")}
                              className="text-xs text-green-600 hover:underline disabled:opacity-50"
                              disabled={isMutating}
                            >
                              ✓ Done
                            </button>
                            <button
                              type="button"
                              onClick={() => void updateMeetingStatus(meeting.id, "cancelled")}
                              className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
                              disabled={isMutating}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => void updateMeetingStatus(meeting.id, "no_show")}
                              className="text-xs text-red-500 hover:underline disabled:opacity-50"
                              disabled={isMutating}
                            >
                              No show
                            </button>
                            {whatsappHref ? (
                              <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                WhatsApp
                              </a>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => void handleDelete(meeting.id)}
                              className="text-xs text-muted-foreground/50 hover:text-red-500 disabled:opacity-50"
                              disabled={isMutating}
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <StatusBadge status={meeting.status} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {total > meetings.length ? (
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={isLoadingMore}
              className="w-full py-3 text-center text-sm text-primary hover:underline disabled:opacity-50"
            >
              {isLoadingMore
                ? "Loading..."
                : `Load more (${total - meetings.length} remaining)`}
            </button>
          ) : null}
        </div>
      )}

      <CreateMeetingDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreated={async () => {
          await refreshMeetings();
        }}
      />
    </section>
  );
}
