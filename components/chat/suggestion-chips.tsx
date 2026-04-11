"use client";

import { useChat } from "@/lib/chat/chat-context";

interface SuggestionChipsProps {
  suggestions: string[];
}

export function SuggestionChips({ suggestions }: SuggestionChipsProps) {
  const { sendMessage, isLoading } = useChat();

  if (!suggestions.length) {
    return null;
  }

  return (
    <div className="mt-1 mb-3 flex flex-wrap gap-1.5 pl-1">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => void sendMessage(suggestion)}
          disabled={isLoading}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted disabled:opacity-50"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
