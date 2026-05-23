"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  createAgentChatSession,
  listAgentChatSessions,
} from "@/lib/api/agent-chat";
import type { AgentChatSessionSummary } from "@/lib/types/agent-chat";

/**
 * Landing for /agent-chat. Lists existing sessions for the current user and
 * exposes a "New session" button. Clicking a row → routes to /agent-chat/[id].
 *
 * Whole-session-as-one-task is the v1 boundary: starting a new session is the
 * only way to discard continuity_history. The big primary button is the UX
 * affordance for that.
 */
export function AgentChatHomeClient() {
  const router = useRouter();
  const [sessions, setSessions] = useState<AgentChatSessionSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let alive = true;
    listAgentChatSessions()
      .then((rows) => {
        if (alive) setSessions(rows);
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      alive = false;
    };
  }, []);

  function handleNew() {
    startTransition(async () => {
      try {
        const s = await createAgentChatSession(null);
        router.push(`/agent-chat/${s.id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Agent chat</h1>
        <Button onClick={handleNew} disabled={isPending}>
          {isPending ? "Starting…" : "New session"}
        </Button>
      </header>

      <p className="text-sm text-zinc-500">
        Each session is one continuous task — the agent remembers earlier
        messages in the same session. Start a new session for unrelated work.
      </p>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="rounded-md border">
        {sessions === null ? (
          <div className="p-4 text-sm text-zinc-500">Loading sessions…</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-sm text-zinc-500">
            No sessions yet. Click <strong>New session</strong> to start one.
          </div>
        ) : (
          <ul className="divide-y">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/agent-chat/${s.id}`}
                  className="block px-4 py-3 hover:bg-zinc-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-medium">
                      {s.title || "Untitled chat"}
                    </span>
                    {s.awaiting_action_id && (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                        awaiting confirm
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {new Date(s.updated_at).toLocaleString()}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
