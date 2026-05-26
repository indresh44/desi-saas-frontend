"use client";

/**
 * Per-slot renderer for `kind === "multi_task"` messages in the chat
 * surface. Closes the asymmetry that was visible to owners — single-task
 * `awaiting_confirm` rendered as a proper card in chat, but a multi-task
 * batch fell through to plaintext fallback ("Task 1 (...): awaiting your
 * approval | Task 2 (...): ...") and the owner had to leave for the
 * dashboard carousel to act on it.
 *
 * Each slot is rendered keyed on its `kind`:
 *   - awaiting_confirm  → AwaitingConfirmCard, LABELED with the slot's
 *                          description (same labeling rule the carousel
 *                          uses — owner cannot confirm the wrong card)
 *   - done              → compact done line with the answer truncated
 *   - cancelled         → compact cancelled line
 *   - ask_user          → compact "needs input" line (the dismiss path
 *                          is on the dashboard; not duplicated here)
 *   - error / failed    → compact error line in red
 *
 * Resolution awareness: each awaiting slot's `resolution` field comes
 * from the server-side enrichment in get_session_with_messages. When
 * non-null, the card renders disabled — same shape the single-task
 * surface uses (see awaiting-confirm-card.tsx).
 */

import { AgentChatMarkdown } from "@/components/agent-chat/agent-chat-markdown";
import { AwaitingConfirmCard } from "@/components/agent-chat/awaiting-confirm-card";
import type { AwaitingConfirmResolution } from "@/lib/types/agent-chat";


/**
 * Per-slot shape inside payload.tasks[]. Built by the backend service
 * (_task_slot_payload in agent_chat_service.py). Loosely typed because
 * each slot kind has a different sub-shape; consumers narrow at use.
 */
export interface MultiTaskSlot {
  task_id: string;
  sequence_index: number;
  description: string;
  status: string;          // task lifecycle status
  kind: string;            // sub-message kind (awaiting_confirm | done | ...)
  content: string | null;  // for done: the answer; for ask_user: the question
  // For awaiting_confirm slots only — same shape as single-task payload:
  prepared_action_id?: string;
  preview?: string;
  editable_fields?: string[];
  resolution?: AwaitingConfirmResolution | null;
  // For error slots:
  error?: { message?: string; code?: string };
}

export interface MultiTaskPayload {
  batch_id: string;
  tasks: MultiTaskSlot[];
}


export function MultiTaskMessage({
  payload,
  preamble,
  pendingAction,
  onConfirm,
  onCancel,
}: {
  payload: MultiTaskPayload;
  /** Optional preamble text rendered above the slots — the assistant's
   *  compound "here's what I found, plus these prepares" answer. */
  preamble?: string | null;
  pendingAction: boolean;
  onConfirm: (preparedActionId: string, edits: Record<string, string> | undefined) => void;
  onCancel: (preparedActionId: string) => void;
}) {
  const slots = payload.tasks ?? [];
  const preambleText = (preamble ?? "").trim();

  return (
    <div className="space-y-2">
      {preambleText && (
        <div className="rounded-2xl rounded-tl-sm bg-zinc-100 px-3 py-2 text-sm">
          <AgentChatMarkdown content={preambleText} />
        </div>
      )}
      {slots.length === 0 ? (
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
          (no tasks in this batch)
        </div>
      ) : (
        <div className="space-y-2">
          {slots.map((slot) => (
            <MultiTaskSlotView
              key={slot.task_id || `${slot.sequence_index}`}
              slot={slot}
              pendingAction={pendingAction}
              onConfirm={onConfirm}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}


function MultiTaskSlotView({
  slot,
  pendingAction,
  onConfirm,
  onCancel,
}: {
  slot: MultiTaskSlot;
  pendingAction: boolean;
  onConfirm: (preparedActionId: string, edits: Record<string, string> | undefined) => void;
  onCancel: (preparedActionId: string) => void;
}) {
  // Slot header — always shown, labels the slot with its description so
  // the owner can't confirm the wrong card. Same rule as the dashboard
  // carousel's per-step header.
  const header = (
    <div className="text-xs font-medium text-zinc-600">
      Task {slot.sequence_index + 1}:{" "}
      <span className="text-zinc-900">{slot.description}</span>
    </div>
  );

  if (slot.kind === "awaiting_confirm" && slot.prepared_action_id) {
    return (
      <div className="space-y-1">
        {header}
        <AwaitingConfirmCard
          payload={{
            prepared_action_id: slot.prepared_action_id,
            preview: slot.preview ?? "",
            editable_fields: slot.editable_fields ?? [],
            resolution: slot.resolution ?? null,
          }}
          disabled={pendingAction}
          onConfirm={(edits) => onConfirm(slot.prepared_action_id!, edits)}
          onCancel={() => onCancel(slot.prepared_action_id!)}
        />
      </div>
    );
  }

  if (slot.kind === "done") {
    return (
      <div className="space-y-1">
        {header}
        <div className="rounded-md border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-sm">
          <div className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Done
          </div>
          {slot.content ? (
            <AgentChatMarkdown content={slot.content} />
          ) : (
            <div className="text-zinc-500">(no answer text)</div>
          )}
        </div>
      </div>
    );
  }

  if (slot.kind === "cancelled") {
    return (
      <div className="space-y-1">
        {header}
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs italic text-zinc-600">
          Cancelled
        </div>
      </div>
    );
  }

  if (slot.kind === "ask_user") {
    return (
      <div className="space-y-1">
        {header}
        <div className="rounded-md border border-sky-200 bg-sky-50/60 px-3 py-2 text-sm">
          <div className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-sky-700">
            Needs your input
          </div>
          <div className="text-sky-900">
            {slot.content ?? "(question)"}
          </div>
          <div className="mt-1 text-xs text-sky-700">
            Reply below to answer.
          </div>
        </div>
      </div>
    );
  }

  if (slot.kind === "error" || slot.kind === "exhausted") {
    const msg = slot.error?.message ?? slot.content ?? "Task failed";
    return (
      <div className="space-y-1">
        {header}
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          <div className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-red-700">
            Failed
          </div>
          {msg}
        </div>
      </div>
    );
  }

  // Unknown / future kind — render the description with the raw kind so
  // a future slot type doesn't silently crash the bubble.
  return (
    <div className="space-y-1">
      {header}
      <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
        ({slot.kind})
      </div>
    </div>
  );
}
