"use client";

/**
 * Dashboard section that surfaces what the AI assistant is doing.
 *
 * Three buckets, top-down by priority:
 *   * Awaiting your approval — the actionable group; opens the carousel.
 *   * Running                — quieter list, no actions.
 *   * Recently done          — collapsed by default, last N.
 *
 * Pulls from GET /api/v1/dashboard/assistant-tasks once on mount and again
 * after the carousel closes (so newly-arrived approvals show up). No live
 * polling — the explicit "Refresh" button on the section header is enough
 * for v1.
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { ApprovalCarousel } from "@/components/dashboard/approval-carousel";
import { RecentlyDoneRow } from "@/components/dashboard/recently-done-row";
import { Button, buttonVariants } from "@/components/ui/button";
import { dismissAgentChatTask } from "@/lib/api/agent-chat";
import { fetchAssistantTasks } from "@/lib/api/dashboard";
import type {
  AssistantTaskSummary,
  AssistantTasksResponse,
} from "@/lib/types/dashboard";

const SECTION_TITLE = "What Your Assistant Is Doing";
const RECENTLY_DONE_LIMIT = 10;


export function AssistantTasksSection() {
  const [data, setData] = useState<AssistantTasksResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);
  const [showRecentlyDone, setShowRecentlyDone] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await fetchAssistantTasks(RECENTLY_DONE_LIMIT));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCarouselClose = useCallback(() => {
    setCarouselOpen(false);
    // Re-fetch on close — picks up tasks the runner finished while the
    // dialog was open, plus reflects the just-confirmed ones disappearing
    // from the awaiting bucket.
    void load();
  }, [load]);

  const openCarousel = useCallback((startIndex: number) => {
    setCarouselStartIndex(startIndex);
    setCarouselOpen(true);
  }, []);

  const awaiting = data?.awaiting_approval ?? [];
  const needsInput = data?.needs_input ?? [];
  const running = data?.running ?? [];
  const recentlyDone = data?.recently_done ?? [];
  const isEmpty =
    !isLoading &&
    awaiting.length === 0 &&
    needsInput.length === 0 &&
    running.length === 0 &&
    recentlyDone.length === 0;

  return (
    <section
      className="p-4"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--ledger-radius-control)",
      }}
    >
      {/* Section header — sparkles in accent flags this as the AI surface. */}
      <div className="mb-3 flex items-center justify-between">
        <h2
          className="flex items-center gap-2 text-[15px] font-bold"
          style={{ color: "var(--color-text)" }}
        >
          <Sparkles
            className="h-4 w-4"
            style={{ color: "var(--color-accent)" }}
            aria-hidden
          />
          {SECTION_TITLE}
        </h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => void load()}
          disabled={isLoading}
          aria-label="Refresh assistant tasks"
        >
          <RefreshCw className={isLoading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
        </Button>
      </div>

      {error && (
        <div
          className="mb-3 text-[13px]"
          style={{
            background: "var(--follow-overdue-bg)",
            border: "1px solid color-mix(in oklch, var(--follow-overdue) 30%, transparent)",
            color: "var(--follow-overdue)",
            padding: "8px 12px",
            borderRadius: "var(--ledger-radius-control)",
          }}
        >
          {error}
        </div>
      )}

      {isLoading && !data ? (
        <div className="text-[13.5px]" style={{ color: "var(--color-text-muted)" }}>
          Loading…
        </div>
      ) : isEmpty ? (
        <div
          className="px-3 py-4 text-[13.5px]"
          style={{
            background: "var(--color-surface-raised)",
            color: "var(--color-text-muted)",
            borderRadius: "var(--ledger-radius-control)",
          }}
        >
          Your assistant has nothing in flight right now.
        </div>
      ) : (
        <div className="space-y-4">
          {awaiting.length > 0 && (
            <AwaitingGroup
              tasks={awaiting}
              onOpenCarousel={openCarousel}
            />
          )}
          {needsInput.length > 0 && (
            <NeedsInputGroup
              tasks={needsInput}
              onAfterDismiss={() => void load()}
            />
          )}
          {running.length > 0 && <RunningGroup tasks={running} />}
          {recentlyDone.length > 0 && (
            <RecentlyDoneGroup
              tasks={recentlyDone}
              expanded={showRecentlyDone}
              onToggle={() => setShowRecentlyDone((v) => !v)}
            />
          )}
        </div>
      )}

      <ApprovalCarousel
        open={carouselOpen}
        tasks={awaiting}
        startIndex={carouselStartIndex}
        onClose={handleCarouselClose}
      />
    </section>
  );
}


// ---------------------------------------------------------------------------
// Awaiting group — prominent, the call-to-action
// ---------------------------------------------------------------------------

function AwaitingGroup({
  tasks,
  onOpenCarousel,
}: {
  tasks: AssistantTaskSummary[];
  onOpenCarousel: (startIndex: number) => void;
}) {
  return (
    <div
      className="p-3"
      style={{
        background: "color-mix(in oklch, var(--follow-unset) 10%, var(--color-surface))",
        border: "1px solid color-mix(in oklch, var(--follow-unset) 34%, var(--color-border))",
        borderRadius: "var(--ledger-radius-control)",
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div
          className="text-[13.5px] font-semibold"
          style={{ color: "var(--follow-unset)" }}
        >
          Awaiting your approval ·{" "}
          <span className="ledger-mono">{tasks.length}</span>
        </div>
        <Button
          size="sm"
          onClick={() => onOpenCarousel(0)}
          aria-label={`Approve ${tasks.length} tasks`}
        >
          Approve
        </Button>
      </div>
      <ul className="space-y-1">
        {tasks.map((t, i) => (
          <li
            key={t.id}
            className="flex items-center justify-between gap-2 rounded px-2 py-1 text-[13px] transition-colors hover:bg-[color:color-mix(in_oklch,var(--follow-unset)_14%,transparent)]"
          >
            <span
              className="truncate"
              style={{ color: "var(--color-text)" }}
            >
              {t.description}
            </span>
            <button
              type="button"
              className="shrink-0 text-[12px] font-semibold underline-offset-2 hover:underline"
              style={{ color: "var(--follow-unset)" }}
              onClick={() => onOpenCarousel(i)}
            >
              Review
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}


// ---------------------------------------------------------------------------
// Needs-input group — questions the assistant asked, not writes
// ---------------------------------------------------------------------------

function NeedsInputGroup({
  tasks,
  onAfterDismiss,
}: {
  tasks: AssistantTaskSummary[];
  onAfterDismiss: () => void;
}) {
  return (
    <div
      className="p-3"
      style={{
        background: "color-mix(in oklch, var(--stage-new-fg) 10%, var(--color-surface))",
        border: "1px solid color-mix(in oklch, var(--stage-new-fg) 30%, var(--color-border))",
        borderRadius: "var(--ledger-radius-control)",
      }}
    >
      <div
        className="mb-2 flex items-center gap-2 text-[13.5px] font-semibold"
        style={{ color: "var(--stage-new-fg)" }}
      >
        <HelpCircle className="h-4 w-4" aria-hidden />
        <span>
          Assistant needs your input ·{" "}
          <span className="ledger-mono">{tasks.length}</span>
        </span>
      </div>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <NeedsInputRow key={t.id} task={t} onAfterDismiss={onAfterDismiss} />
        ))}
      </ul>
    </div>
  );
}

function NeedsInputRow({
  task,
  onAfterDismiss,
}: {
  task: AssistantTaskSummary;
  onAfterDismiss: () => void;
}) {
  const [dismissing, setDismissing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The runner stashes the question on `task.result["question"]`; that
  // payload isn't surfaced into the typed summary today, so the cleanest
  // signal we have at the row level is the task description (what the
  // owner originally asked) and the answer field would be empty here.
  // The description is the right thing to show — it's what the owner
  // typed, which contextualises the question they need to clarify.

  const handleDismiss = useCallback(async () => {
    setDismissing(true);
    setError(null);
    try {
      await dismissAgentChatTask(task.session_id, task.id);
      onAfterDismiss();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dismiss failed");
      setDismissing(false);
    }
  }, [task.session_id, task.id, onAfterDismiss]);

  return (
    <li
      className="p-2 text-[13px]"
      style={{
        background: "var(--color-surface)",
        borderRadius: "var(--ledger-radius-sm)",
      }}
    >
      <div style={{ color: "var(--color-text)" }}>{task.description}</div>
      <div className="mt-2 flex items-center gap-2">
        <Link
          href={`/agent-chat/${task.session_id}`}
          className={buttonVariants({ size: "sm" })}
        >
          Answer in chat
        </Link>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDismiss}
          disabled={dismissing}
        >
          {dismissing ? "Dismissing…" : "Dismiss"}
        </Button>
        {error && (
          <span
            className="text-[12px] font-semibold"
            style={{ color: "var(--follow-overdue)" }}
          >
            {error}
          </span>
        )}
      </div>
    </li>
  );
}


// ---------------------------------------------------------------------------
// Running group — quiet, no actions
// ---------------------------------------------------------------------------

function RunningGroup({ tasks }: { tasks: AssistantTaskSummary[] }) {
  return (
    <div>
      <div
        className="ledger-mono mb-1 text-[11px] font-semibold uppercase tracking-[0.06em]"
        style={{ color: "var(--color-text-faint)" }}
      >
        Running · {tasks.length}
      </div>
      <ul className="space-y-1">
        {tasks.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-2 rounded px-2 py-1 text-[13px]"
            style={{ color: "var(--color-text)" }}
          >
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ background: "var(--color-accent)" }}
            />
            <span className="truncate">{t.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}


// ---------------------------------------------------------------------------
// Recently-done group — collapsed by default
// ---------------------------------------------------------------------------

function RecentlyDoneGroup({
  tasks,
  expanded,
  onToggle,
}: {
  tasks: AssistantTaskSummary[];
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      {/* Group header — clicking the chevron expands/collapses the whole
           group. The ROW-LEVEL expand (inside RecentlyDoneRow) is separate
           and independent; the group toggle is just a "hide the list of
           rows entirely" affordance. */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="mb-1 flex w-full items-center justify-between rounded text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
      >
        <span>Recently done · {tasks.length}</span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>
      {expanded && (
        <ul className="overflow-hidden rounded-md border border-border">
          {tasks.map((t) => (
            <RecentlyDoneRow key={t.id} task={t} />
          ))}
        </ul>
      )}
    </div>
  );
}
