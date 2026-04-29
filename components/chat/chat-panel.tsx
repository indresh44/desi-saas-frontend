"use client";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useChat } from "@/lib/chat/chat-context";
import { X } from "lucide-react";

export function ChatPanel() {
  const { isOpen, closeChat } = useChat();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeChat()}>
      {/* `h-[100dvh]` (dynamic viewport height) shrinks correctly when the
          mobile soft keyboard opens, keeping the composer in view. Plain
          `h-full` / `100vh` would leave the composer hidden behind the
          keyboard on iOS. Desktop behaves identically to before. */}
      <SheetContent
        side="right"
        className="flex h-[100dvh] w-full flex-col gap-0 p-0 sm:max-w-[400px] md:max-w-[420px]"
      >
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Assistant
            </SheetTitle>
            <button
              onClick={closeChat}
              className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-muted-foreground md:hidden"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </SheetHeader>

        <ChatMessageList />
        <ChatInput />
      </SheetContent>
    </Sheet>
  );
}
