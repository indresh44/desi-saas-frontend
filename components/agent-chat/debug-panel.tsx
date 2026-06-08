"use client";

import type {
  AgentChatTokens,
  AgentChatTurnDetail,
} from "@/lib/types/agent-chat";

/**
 * Per-message debug panel. Default collapsed (native <details>). This is the
 * primary tool for diagnosing Gemini misbehavior — the rendered thought +
 * action + observation summary per turn is exactly what the agent-loop spec
 * promised to expose.
 */
export function DebugPanel({
  turns,
  tokens,
}: {
  turns: AgentChatTurnDetail[];
  tokens: AgentChatTokens | null;
}) {
  if ((!turns || turns.length === 0) && !tokens) return null;
  return (
    <details className="mt-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs">
      <summary className="cursor-pointer select-none text-zinc-500">
        debug ({turns?.length ?? 0} turn{turns?.length === 1 ? "" : "s"}
        {tokens ? `, ${tokens.total_input_tokens ?? 0} in / ${tokens.total_output_tokens ?? 0} out` : ""})
      </summary>
      {turns && turns.length > 0 && (
        <ol className="mt-2 space-y-2">
          {turns.map((t) => (
            <li key={t.turn} className="rounded border bg-white p-2">
              <div className="font-semibold text-zinc-700">turn {t.turn}</div>
              <div>
                <span className="text-zinc-500">thought: </span>
                <span>{t.thought}</span>
              </div>
              <pre className="mt-1 overflow-x-auto rounded bg-zinc-100 p-1 text-[11px]">
                {JSON.stringify(t.action, null, 2)}
              </pre>
              <div className="mt-1">
                <span className="text-zinc-500">observation: </span>
                <span className="whitespace-pre-wrap">{t.observation_summary}</span>
              </div>
            </li>
          ))}
        </ol>
      )}
      {tokens && (
        <pre className="mt-2 overflow-x-auto rounded bg-zinc-100 p-2 text-[11px]">
          {JSON.stringify(tokens, null, 2)}
        </pre>
      )}
    </details>
  );
}
