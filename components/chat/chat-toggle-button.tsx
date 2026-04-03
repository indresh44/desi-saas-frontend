"use client";

import { MessageSquare, X } from "lucide-react";
import { useChat } from "@/lib/chat/chat-context";

export function ChatToggleButton() {
  const { isOpen, toggleChat } = useChat();

  return (
    <button
      type="button"
      onClick={toggleChat}
      className="fixed right-5 bottom-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition-all hover:scale-105 hover:bg-zinc-800 active:scale-95 md:right-6 md:bottom-6 md:h-14 md:w-14"
      aria-label={isOpen ? "Close chat" : "Open chat assistant"}
    >
      {isOpen ? (
        <X className="h-5 w-5 md:h-6 md:w-6" />
      ) : (
        <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
      )}
    </button>
  );
}
