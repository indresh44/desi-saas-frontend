"use client";

/**
 * TEST / DEBUG ONLY — disposable read-model chat shell.
 *
 * It does NOTHING smart: send the message + a pasted JWT to POST /api/test-chat,
 * display the answer, and expose the generated query + raw rows for debugging.
 * No streaming, no history, no settings, no query logic. All intelligence is in
 * the backend. If a feature needs logic, it does not belong in this file.
 */

import { useRef, useState } from "react";

import { API_BASE_URL } from "@/lib/constants/api";

type AssistantReply = {
  answer: string | null;
  generated_query: unknown;
  raw_rows: unknown[];
  validation_error: unknown;
  error?: string; // transport/HTTP error (not from the read model)
};

type Message =
  | { role: "user"; text: string }
  | ({ role: "assistant" } & AssistantReply);

export default function TestChatPage() {
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    requestAnimationFrame(() => listEndRef.current?.scrollIntoView({ behavior: "smooth" }));

  async function send() {
    const message = input.trim();
    if (!message || loading) return;

    setMessages((m) => [...m, { role: "user", text: message }]);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch(`${API_BASE_URL}/api/test-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, token: token.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { role: "assistant", answer: null, generated_query: null, raw_rows: [], validation_error: null, error: data?.detail ?? `HTTP ${res.status}` },
        ]);
      } else {
        setMessages((m) => [...m, { role: "assistant", ...(data as AssistantReply) }]);
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", answer: null, generated_query: null, raw_rows: [], validation_error: null, error: String(e) },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col gap-3 p-4">
      <header className="shrink-0">
        <h1 className="text-lg font-semibold">Read-model test chat</h1>
        <p className="text-xs text-muted-foreground">
          Debug tool. Paste a JWT, ask a question. The reply shows the generated query and raw rows.
        </p>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Bearer JWT (paste access token)"
          className="mt-2 w-full rounded border px-3 py-1.5 text-sm font-mono"
        />
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto rounded border p-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <div className="w-full max-w-[95%] space-y-2 rounded-lg border bg-muted/30 px-3 py-2">
                {m.error ? (
                  <p className="text-sm font-medium text-red-600">Request error: {m.error}</p>
                ) : (
                  <>
                    {m.answer && <p className="whitespace-pre-wrap text-sm">{m.answer}</p>}

                    {m.validation_error != null && (
                      <div className="rounded border border-red-300 bg-red-50 p-2">
                        <p className="text-xs font-semibold text-red-700">Validation error (read model rejected the query)</p>
                        <pre className="mt-1 overflow-x-auto text-xs text-red-700">
                          {JSON.stringify(m.validation_error, null, 2)}
                        </pre>
                      </div>
                    )}

                    <details className="text-xs">
                      <summary className="cursor-pointer select-none text-muted-foreground">
                        Generated query
                      </summary>
                      <pre className="mt-1 overflow-x-auto rounded bg-background p-2">
                        {JSON.stringify(m.generated_query, null, 2)}
                      </pre>
                    </details>

                    <details className="text-xs">
                      <summary className="cursor-pointer select-none text-muted-foreground">
                        Raw rows ({Array.isArray(m.raw_rows) ? m.raw_rows.length : 0})
                      </summary>
                      <pre className="mt-1 overflow-x-auto rounded bg-background p-2">
                        {JSON.stringify(m.raw_rows, null, 2)}
                      </pre>
                    </details>
                  </>
                )}
              </div>
            </div>
          )
        )}
        {loading && <p className="text-sm text-muted-foreground">Thinking…</p>}
        <div ref={listEndRef} />
      </div>

      <div className="flex shrink-0 gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="Ask a question about leads or invoices…"
          className="flex-1 rounded border px-3 py-2 text-sm"
        />
        <button
          onClick={() => void send()}
          disabled={loading || !input.trim()}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
