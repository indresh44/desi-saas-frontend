"use client";

import { MessageSquare, X } from "lucide-react";
import { useChat } from "@/lib/chat/chat-context";

/**
 * Floating chat toggle button — desktop only (`>=md`).
 * On mobile, the bottom nav has a dedicated Chat tab that performs the
 * same toggle, so this floating button would duplicate it.
 */
export function ChatToggleButton() {
  const { isOpen, toggleChat } = useChat();

  return (
    <button
      type="button"
      onClick={toggleChat}
      className="fixed right-6 bottom-6 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90 active:scale-95 md:flex"
      aria-label={isOpen ? "Close chat" : "Open chat assistant"}
    >
      {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
    </button>
  );
}
