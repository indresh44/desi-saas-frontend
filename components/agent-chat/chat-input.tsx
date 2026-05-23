"use client";

import { useState, KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";

/**
 * Textarea + send. Disabled while a request is in flight OR while the session
 * is awaiting a confirm (force the user to resolve the prepared action first —
 * matches the server-side 409 in agent_chat_service.handle_message).
 *
 * Cmd/Ctrl+Enter sends. Plain Enter inserts newline.
 */
export function ChatInput({
  disabled,
  awaitingConfirm,
  placeholder,
  onSend,
}: {
  disabled: boolean;
  awaitingConfirm: boolean;
  placeholder?: string;
  onSend: (text: string) => void;
}) {
  const [value, setValue] = useState("");

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  const isDisabled = disabled || awaitingConfirm;
  const ph = awaitingConfirm
    ? "Confirm or cancel the pending action first…"
    : placeholder ?? "Ask the agent anything…  (Cmd/Ctrl+Enter to send)";

  return (
    <div className="flex items-end gap-2 border-t bg-white p-3">
      <textarea
        className="min-h-[44px] flex-1 resize-none rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-50"
        rows={2}
        value={value}
        disabled={isDisabled}
        placeholder={ph}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button
        type="button"
        onClick={handleSend}
        disabled={isDisabled || !value.trim()}
      >
        Send
      </Button>
    </div>
  );
}
