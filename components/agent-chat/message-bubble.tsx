"use client";

import type {
  AgentChatMessage,
  AwaitingConfirmResolution,
} from "@/lib/types/agent-chat";
import { AgentChatMarkdown } from "@/components/agent-chat/agent-chat-markdown";
import { AwaitingConfirmCard } from "@/components/agent-chat/awaiting-confirm-card";
import { DebugPanel } from "@/components/agent-chat/debug-panel";
import {
  MultiTaskMessage,
  type MultiTaskPayload,
} from "@/components/agent-chat/multi-task-message";

/**
 * One row in the conversation. Dispatches by (role, kind):
 *   user / text                  → user bubble (right)
 *   assistant / done             → plain assistant bubble
 *   assistant / ask_user         → assistant bubble (the question)
 *   assistant / awaiting_confirm → AwaitingConfirmCard inside an assistant bubble
 *   assistant / commit_result    → plain assistant bubble with ✓ prefix
 *   assistant / cancelled        → small italic line
 *   assistant / error|exhausted  → red-tinted bubble
 *
 * Debug panel rendered for every assistant message (default collapsed).
 */
export function MessageBubble({
  msg,
  pendingAction,
  onConfirm,
  onCancel,
}: {
  msg: AgentChatMessage;
  /** Set while confirm/cancel is in flight for this specific message. */
  pendingAction: boolean;
  onConfirm: (preparedActionId: string, edits: Record<string, string> | undefined) => void;
  onCancel: (preparedActionId: string) => void;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-zinc-900 px-3 py-2 text-sm text-white">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] space-y-2">
        <AssistantBody msg={msg} pendingAction={pendingAction}
                       onConfirm={onConfirm} onCancel={onCancel} />
        <DebugPanel turns={msg.turn_detail ?? []} tokens={msg.tokens} />
      </div>
    </div>
  );
}

function AssistantBody({
  msg, pendingAction, onConfirm, onCancel,
}: {
  msg: AgentChatMessage;
  pendingAction: boolean;
  onConfirm: (preparedActionId: string, edits: Record<string, string> | undefined) => void;
  onCancel: (preparedActionId: string) => void;
}) {
  if (msg.kind === "multi_task") {
    // Per-slot rendering: each task in the batch gets its own labeled
    // card (awaiting_confirm slots become live AwaitingConfirmCards
    // inline, done/failed/cancelled become status lines). Closes the
    // asymmetry where single-task batches were actionable in chat but
    // multi-task batches forced the owner to the dashboard carousel.
    const mt = (msg.payload ?? {}) as Partial<MultiTaskPayload>;
    return (
      <MultiTaskMessage
        payload={{
          batch_id: mt.batch_id ?? "",
          tasks: mt.tasks ?? [],
        }}
        preamble={msg.content}
        pendingAction={pendingAction}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
  }

  if (msg.kind === "awaiting_confirm") {
    const p = (msg.payload ?? {}) as {
      prepared_action_id?: string;
      preview?: string;
      editable_fields?: string[];
      // Server-populated on session-load. null/absent = still live.
      // Anything else = the action was resolved elsewhere (dashboard,
      // dismiss path, parallel chat); the card renders disabled.
      resolution?: AwaitingConfirmResolution | null;
    };
    if (!p.prepared_action_id) {
      return <Plain text="(missing prepared_action_id)" />;
    }
    // Compound shape: optional markdown answer text ABOVE the confirm card,
    // so a single assistant bubble carries both "here's what I found" AND
    // the prepared action. msg.content holds the answer (may be null/empty,
    // in which case we render only the card — same as before). One confirm
    // card per bubble, max — never multiple cards stacked.
    const answerText = (msg.content ?? "").trim();
    return (
      <div className="space-y-2">
        {answerText && (
          <div className="rounded-2xl rounded-tl-sm bg-zinc-100 px-3 py-2 text-sm">
            <AgentChatMarkdown content={answerText} />
          </div>
        )}
        <AwaitingConfirmCard
          payload={{
            prepared_action_id: p.prepared_action_id,
            preview: p.preview ?? "",
            editable_fields: p.editable_fields ?? [],
            resolution: p.resolution ?? null,
          }}
          disabled={pendingAction}
          onConfirm={(edits) => onConfirm(p.prepared_action_id!, edits)}
          onCancel={() => onCancel(p.prepared_action_id!)}
        />
      </div>
    );
  }

  if (msg.kind === "cancelled") {
    return (
      <div className="text-xs italic text-zinc-500">
        {msg.content ?? "Cancelled."}
      </div>
    );
  }

  if (msg.kind === "error" || msg.kind === "exhausted") {
    return (
      <div className="rounded-2xl rounded-tl-sm border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
        {msg.content ?? msg.kind}
      </div>
    );
  }

  if (msg.kind === "commit_result") {
    return (
      <div className="rounded-2xl rounded-tl-sm border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
        <span className="font-semibold">✓ </span>
        <AgentChatMarkdown content={msg.content ?? ""} />
      </div>
    );
  }

  // done, ask_user, text (assistant text fallback) — render as markdown so
  // bold / lists / tables / links from the LLM are presented properly.
  return (
    <div className="rounded-2xl rounded-tl-sm bg-zinc-100 px-3 py-2 text-sm">
      <AgentChatMarkdown content={msg.content ?? ""} />
    </div>
  );
}

function Plain({ text }: { text: string }) {
  return (
    <div className="whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-zinc-100 px-3 py-2 text-sm">
      {text}
    </div>
  );
}
