"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/agent-chat/chat-input";
import { MessageBubble } from "@/components/agent-chat/message-bubble";
import {
  cancelAgentChatAction,
  confirmAgentChatAction,
  createAgentChatSession,
  getAgentChatSession,
  sendAgentChatMessage,
} from "@/lib/api/agent-chat";
import type {
  AgentChatEnvelope,
  AgentChatMessage,
  AgentChatSessionDetail,
} from "@/lib/types/agent-chat";
import { useRouter } from "next/navigation";

/**
 * The chat surface for one agent-chat session. State held locally:
 *   - messages       : the conversation transcript
 *   - awaitingId     : non-null iff a prepare is pending; disables the input
 *   - inFlight       : a request is in flight; disables Send / Confirm / Cancel
 *
 * Each user action is optimistic on the user-message side (we append the
 * user's text immediately so the UI feels live) but waits for the server
 * envelope before appending the assistant message.
 *
 * Continuity carries across every message in this session — that's the
 * task-boundary decision. "New session" (top-right) is how a user starts
 * fresh.
 */
export function AgentChatSessionClient({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<AgentChatSessionDetail | null>(null);
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  // Authoritative gate for the chat input: comes from the server's
  // has_unresolved_action field on GET /sessions/{id}. The deprecated
  // awaiting_action_id on the envelope is no longer trusted — it can't
  // see resolutions happening through other surfaces (dashboard
  // carousel, parallel chat tab, dismiss endpoint).
  const [hasUnresolvedAction, setHasUnresolvedAction] = useState(false);
  const [inFlight, setInFlight] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // --- load/refetch -------------------------------------------------------
  // Reusable session-load: fired on mount, on window focus, and on
  // visibility change (tab/screen comes back). This catches state changes
  // that happened in another surface — e.g. the owner confirmed a
  // prepared action from the dashboard carousel and then came back to
  // the chat tab. Without this refetch, the chat would keep showing
  // live Confirm/Cancel buttons on a consumed action.
  const loadSession = useCallback(async () => {
    try {
      const s = await getAgentChatSession(sessionId);
      setSession(s);
      setMessages(s.messages);
      // Prefer the new authoritative field; fall back to deprecated
      // awaiting_action_id for back-compat with older backends in the
      // (very brief) window before the deploys are aligned.
      setHasUnresolvedAction(
        typeof s.has_unresolved_action === "boolean"
          ? s.has_unresolved_action
          : Boolean(s.awaiting_action_id),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [sessionId]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  // Refetch on window focus + tab-visibility return. Two distinct
  // signals so we cover both the alt-tab case and the
  // hidden-tab-foregrounded case (some browsers fire only one).
  useEffect(() => {
    const onFocus = () => { void loadSession(); };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void loadSession();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadSession]);

  // --- scroll to bottom on new message -----------------------------------
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, hasUnresolvedAction]);

  // --- helpers ------------------------------------------------------------
  const applyEnvelope = useCallback((env: AgentChatEnvelope) => {
    // The envelope carries the just-emitted assistant message; we
    // append it locally for snappy UI feedback. The has_unresolved_action
    // gate is sourced from the next loadSession() call — the envelope's
    // deprecated awaiting_action_id is not reliable enough to be the
    // source of truth (an awaiting_confirm envelope today carries the
    // new prepared_action_id but other surfaces may have resolved
    // other tasks in this session; we re-fetch to learn the truth).
    setMessages((prev) => [
      ...prev,
      {
        id: env.message_id,
        role: "assistant",
        kind: env.kind,
        content: env.content,
        payload: env.payload,
        turn_detail: env.turn_detail,
        tokens: env.tokens,
        created_at: env.created_at,
      },
    ]);
    // Local optimistic flip — the next focus/refetch will reconcile.
    // True when the just-emitted envelope itself stages a new awaiting
    // confirm; false on commit_result / cancelled / done.
    if (env.kind === "awaiting_confirm") {
      setHasUnresolvedAction(true);
    } else if (env.kind === "multi_task") {
      // Multi-task batches: gate the input iff any slot is still live
      // (awaiting_confirm with no resolution). Done/failed/cancelled
      // slots don't gate. Same authoritative answer the server's
      // has_unresolved_action would give us on next refetch.
      const tasks =
        (env.payload?.tasks as
          | Array<{ kind?: string; resolution?: string | null }>
          | undefined) ?? [];
      const anyLive = tasks.some(
        (t) =>
          t?.kind === "awaiting_confirm"
          && (t?.resolution === null || t?.resolution === undefined),
      );
      setHasUnresolvedAction(anyLive);
    } else if (
      env.kind === "commit_result"
      || env.kind === "cancelled"
      || env.kind === "done"
      || env.kind === "error"
      || env.kind === "exhausted"
    ) {
      setHasUnresolvedAction(false);
    }
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      setError(null);
      setInFlight(true);
      // optimistic user bubble (no server id yet — use a temp id)
      const optimisticId = `local-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: optimisticId, role: "user", kind: "text",
          content: text, payload: null, turn_detail: null, tokens: null,
          created_at: new Date().toISOString(),
        },
      ]);
      try {
        const env = await sendAgentChatMessage(sessionId, text);
        applyEnvelope(env);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setInFlight(false);
      }
    },
    [sessionId, applyEnvelope],
  );

  const handleConfirm = useCallback(
    async (preparedActionId: string, edits: Record<string, string> | undefined) => {
      setError(null);
      setInFlight(true);
      try {
        const env = await confirmAgentChatAction(sessionId, preparedActionId, edits);
        applyEnvelope(env);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setInFlight(false);
      }
    },
    [sessionId, applyEnvelope],
  );

  const handleCancel = useCallback(
    async (preparedActionId: string) => {
      setError(null);
      setInFlight(true);
      try {
        const env = await cancelAgentChatAction(sessionId, preparedActionId);
        applyEnvelope(env);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setInFlight(false);
      }
    },
    [sessionId, applyEnvelope],
  );

  const handleNewSession = useCallback(async () => {
    try {
      const s = await createAgentChatSession(null);
      router.push(`/agent-chat/${s.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [router]);

  // --- render -------------------------------------------------------------
  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] w-full max-w-3xl flex-col overflow-hidden rounded-md border">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">
            {session?.title || "Agent chat"}
          </h1>
          <Link
            href="/agent-chat"
            className="text-xs text-zinc-500 hover:underline"
          >
            ← All sessions
          </Link>
        </div>
        <Button size="sm" variant="outline" onClick={handleNewSession}>
          New session
        </Button>
      </header>

      {error && (
        <div className="border-b border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {session === null ? (
          <div className="text-sm text-zinc-500">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="text-sm text-zinc-500">
            Say hello, ask a question, or describe what you want to do.
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              msg={m}
              pendingAction={inFlight}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          ))
        )}
        {inFlight && (
          <div className="text-xs italic text-zinc-500">…thinking</div>
        )}
      </div>

      <ChatInput
        disabled={inFlight}
        awaitingConfirm={hasUnresolvedAction}
        onSend={handleSend}
      />
    </div>
  );
}
