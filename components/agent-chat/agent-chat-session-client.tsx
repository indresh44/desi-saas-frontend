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
  const [awaitingId, setAwaitingId] = useState<string | null>(null);
  const [inFlight, setInFlight] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // --- initial load -------------------------------------------------------
  useEffect(() => {
    let alive = true;
    getAgentChatSession(sessionId)
      .then((s) => {
        if (!alive) return;
        setSession(s);
        setMessages(s.messages);
        setAwaitingId(s.awaiting_action_id);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      alive = false;
    };
  }, [sessionId]);

  // --- scroll to bottom on new message -----------------------------------
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, awaitingId]);

  // --- helpers ------------------------------------------------------------
  const applyEnvelope = useCallback((env: AgentChatEnvelope) => {
    setAwaitingId(env.awaiting_action_id);
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
        awaitingConfirm={!!awaitingId}
        onSend={handleSend}
      />
    </div>
  );
}
