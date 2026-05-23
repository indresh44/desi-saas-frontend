"use client";

import type { AgentChatMessage } from "@/lib/types/agent-chat";
import { AgentChatMarkdown } from "@/components/agent-chat/agent-chat-markdown";
import { AwaitingConfirmCard } from "@/components/agent-chat/awaiting-confirm-card";
import { DebugPanel } from "@/components/agent-chat/debug-panel";

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
  if (msg.kind === "awaiting_confirm") {
    const p = (msg.payload ?? {}) as {
      prepared_action_id?: string;
      preview?: string;
      editable_fields?: string[];
    };
    if (!p.prepared_action_id) {
      return <Plain text="(missing prepared_action_id)" />;
    }
    return (
      <AwaitingConfirmCard
        payload={{
          prepared_action_id: p.prepared_action_id,
          preview: p.preview ?? msg.content ?? "",
          editable_fields: p.editable_fields ?? [],
        }}
        disabled={pendingAction}
        onConfirm={(edits) => onConfirm(p.prepared_action_id!, edits)}
        onCancel={() => onCancel(p.prepared_action_id!)}
      />
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
