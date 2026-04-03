"use client";

import { useEffect, useRef } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { ChatMessageBubble } from "@/components/chat/chat-message-bubble";
import { SuggestionChips } from "@/components/chat/suggestion-chips";
import { useChat } from "@/lib/chat/chat-context";

export function ChatMessageList() {
  const { messages, isLoading, isFetchingHistory } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isLoading, messages]);

  const lastAssistantIndex = messages.findLastIndex((msg) => msg.role === "assistant");

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {isFetchingHistory && (
        <div className="flex items-center justify-center py-8 text-sm text-zinc-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading conversation...
        </div>
      )}

      {!isFetchingHistory && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
            <Sparkles className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-700">How can I help you?</p>
          <p className="mt-1 text-xs text-zinc-400">
            Ask me anything about your leads, customers, or invoices.
          </p>
        </div>
      )}

      {messages.map((message, index) => (
        <div key={message.id}>
          <ChatMessageBubble message={message} />

          {index === lastAssistantIndex &&
            message.suggestions &&
            message.suggestions.length > 0 &&
            !isLoading && <SuggestionChips suggestions={message.suggestions} />}
        </div>
      ))}

      {isLoading && (
        <div className="mt-3 flex items-start gap-2">
          <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-zinc-100 px-4 py-3">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
