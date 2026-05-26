"use client";

/**
 * Approval carousel — thin wrapper that steps the owner through the
 * awaiting-approval tasks for this business, one at a time, reusing the
 * existing `AwaitingConfirmCard` for each task.
 *
 * Reuse note (deliberate): we use AwaitingConfirmCard, NOT the orchestrator's
 * `components/chat/action-card.tsx`. ActionCard belongs to the older
 * `/api/v1/chat` flow and renders per-capability forms keyed on
 * `ChatAction.prefilled_data`. AwaitingConfirmCard is the agent-chat
 * surface's existing renderer — it already accepts the exact
 * `{prepared_action_id, preview, editable_fields}` shape our prepared
 * actions carry, and it dispatches via `onConfirm` / `onCancel` callbacks
 * (no internal API calls). The carousel passes its own callbacks straight
 * in; no refactor of AwaitingConfirmCard was needed.
 *
 * Confirm + cancel go through the existing per-session endpoints
 * (`POST /api/v1/agent-chat/sessions/{session_id}/{confirm|cancel}`). Each
 * task carries its `session_id`, so a single batch can include tasks from
 * different chat sessions; the carousel hits the right URL per task.
 *
 * Tracked follow-up (Risk 2 from the build plan): the per-session
 * confirm/cancel handlers append a `commit_result` / `cancelled` message to
 * the parent chat session's transcript. An owner clearing approvals from
 * the dashboard therefore writes assistant messages into chat sessions
 * they may never have opened. Cosmetic; accepted for v1.
 */

import { useCallback, useState } from "react";

import Link from "next/link";

import { AwaitingConfirmCard } from "@/components/agent-chat/awaiting-confirm-card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  cancelAgentChatAction,
  confirmAgentChatAction,
} from "@/lib/api/agent-chat";
import type { AssistantTaskSummary } from "@/lib/types/dashboard";

type Outcome = "confirmed" | "cancelled" | "skipped" | "error";

interface CarouselLogEntry {
  task_id: string;
  outcome: Outcome;
  message?: string;
}

export interface ApprovalCarouselProps {
  open: boolean;
  /**
   * Snapshot of awaiting-approval tasks taken at open-time. The carousel
   * does NOT live-refresh — new approvals landing while the dialog is
   * open are picked up after close (the parent re-fetches the section).
   */
  tasks: AssistantTaskSummary[];
  /**
   * Called when the dialog closes for any reason (last task confirmed,
   * cancel button clicked, escape key). The parent should re-fetch the
   * assistant-tasks section to pick up any in-flight changes.
   */
  onClose: () => void;
  /**
   * Optional starting index — supports the dashboard's "approve this
   * specific one" row-level entry point. Defaults to 0.
   */
  startIndex?: number;
}

export function ApprovalCarousel({
  open,
  tasks,
  onClose,
  startIndex = 0,
}: ApprovalCarouselProps) {
  const [index, setIndex] = useState<number>(startIndex);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [log, setLog] = useState<CarouselLogEntry[]>([]);
  const [errorForCurrent, setErrorForCurrent] = useState<string | null>(null);

  const total = tasks.length;
  const current = index < total ? tasks[index] : null;
  const finished = index >= total;

  const advance = useCallback(() => {
    setErrorForCurrent(null);
    setIndex((i) => i + 1);
  }, []);

  const recordOutcome = useCallback(
    (task_id: string, outcome: Outcome, message?: string) => {
      setLog((prev) => [...prev, { task_id, outcome, message }]);
    },
    [],
  );

  const handleConfirm = useCallback(
    async (edits: Record<string, string> | undefined) => {
      if (!current || !current.prepared_action_id) return;
      setSubmitting(true);
      setErrorForCurrent(null);
      try {
        await confirmAgentChatAction(
          current.session_id,
          current.prepared_action_id,
          edits,
        );
        recordOutcome(current.id, "confirmed");
        advance();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Confirm failed";
        // Don't advance on error — the owner can retry or skip explicitly.
        setErrorForCurrent(message);
      } finally {
        setSubmitting(false);
      }
    },
    [current, advance, recordOutcome],
  );

  const handleCancel = useCallback(async () => {
    if (!current || !current.prepared_action_id) return;
    setSubmitting(true);
    setErrorForCurrent(null);
    try {
      await cancelAgentChatAction(current.session_id, current.prepared_action_id);
      recordOutcome(current.id, "cancelled");
      advance();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cancel failed";
      setErrorForCurrent(message);
    } finally {
      setSubmitting(false);
    }
  }, [current, advance, recordOutcome]);

  const handleSkip = useCallback(() => {
    if (!current) return;
    recordOutcome(current.id, "skipped");
    advance();
  }, [current, advance, recordOutcome]);

  // Stats for the "done" panel.
  const confirmedCount = log.filter((e) => e.outcome === "confirmed").length;
  const cancelledCount = log.filter((e) => e.outcome === "cancelled").length;
  const skippedCount = log.filter((e) => e.outcome === "skipped").length;

  return (
    <Dialog open={open} onClose={onClose} ariaLabel="Approve assistant tasks">
      <DialogHeader
        title={
          finished
            ? "All caught up"
            : `Approve assistant tasks · ${index + 1} of ${total}`
        }
        onClose={onClose}
      />

      <DialogBody className="space-y-3">
        {finished ? (
          <FinishedPanel
            confirmed={confirmedCount}
            cancelled={cancelledCount}
            skipped={skippedCount}
          />
        ) : current ? (
          <>
            {/* Per-task header — labels each card with its description so
                 the owner cannot confirm the wrong one (the same labeled-
                 cards rule from the multi-task message renderer). */}
            <div className="rounded-md bg-muted/40 px-3 py-2 text-sm">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Task {current.sequence_index + 1}
              </div>
              <div className="text-sm text-foreground">{current.description}</div>
            </div>

            {current.prepared_action_id &&
            current.preview !== null ? (
              // Normal path — render the existing AwaitingConfirmCard with
              // our callbacks. No refactor / no CSS-hide of its footer; the
              // component is already props-driven.
              <AwaitingConfirmCard
                payload={{
                  prepared_action_id: current.prepared_action_id,
                  preview: current.preview,
                  editable_fields: current.editable_fields,
                }}
                disabled={submitting}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            ) : (
              // Graceful degradation — task is in awaiting_approval but has
              // no prepared_action_id (e.g. an ask_user pause, or a future
              // capability with unrenderable inputs). Don't crash; offer to
              // open the chat session and let the owner advance past it.
              <NonRenderableTaskFallback
                sessionId={current.session_id}
                onSkip={handleSkip}
              />
            )}

            {errorForCurrent && (
              <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
                {errorForCurrent}
                {/* Owner can choose: retry by hitting Confirm again on the
                    card above, OR skip past this one explicitly. */}
                <div className="mt-2">
                  <Button size="sm" variant="outline" onClick={handleSkip}>
                    Skip this one
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : null}
      </DialogBody>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          {finished ? "Close" : "Done for now"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

function FinishedPanel({
  confirmed,
  cancelled,
  skipped,
}: {
  confirmed: number;
  cancelled: number;
  skipped: number;
}) {
  const total = confirmed + cancelled + skipped;
  if (total === 0) {
    return (
      <div className="rounded-md bg-muted/40 px-3 py-4 text-sm text-muted-foreground">
        No approvals to work through.
      </div>
    );
  }
  return (
    <div className="rounded-md bg-muted/40 px-3 py-4 text-sm">
      <div className="font-medium text-foreground">
        Worked through {total} approval{total === 1 ? "" : "s"}.
      </div>
      <div className="mt-1 text-muted-foreground">
        {confirmed} confirmed · {cancelled} cancelled
        {skipped > 0 ? ` · ${skipped} skipped` : ""}
      </div>
    </div>
  );
}

function NonRenderableTaskFallback({
  sessionId,
  onSkip,
}: {
  sessionId: string;
  onSkip: () => void;
}) {
  // Chat surface path lives at /agent-chat/[id] per the existing app router.
  const chatHref = `/agent-chat/${sessionId}`;
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
      <div className="font-medium text-foreground">
        This task can&apos;t be handled here.
      </div>
      <div className="mt-1 text-muted-foreground">
        It&apos;s waiting on something the carousel doesn&apos;t render — open
        the chat to respond, then come back.
      </div>
      <div className="mt-3 flex gap-2">
        <Link
          href={chatHref}
          className={buttonVariants({ size: "sm" })}
        >
          Open chat
        </Link>
        <Button size="sm" variant="outline" onClick={onSkip}>
          Skip
        </Button>
      </div>
    </div>
  );
}
