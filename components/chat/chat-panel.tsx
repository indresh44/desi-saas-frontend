"use client";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useChat } from "@/lib/chat/chat-context";

export function ChatPanel() {
  const { isOpen, closeChat, pageContext } = useChat();

  function getPanelTitle(): string {
    switch (pageContext.type) {
      case "dashboard":
        return "Dashboard Assistant";
      case "lead":
        return "Lead Assistant";
      case "customer":
        return "Customer Assistant";
      default:
        return "Assistant";
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeChat()}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-[400px] md:max-w-[420px]"
      >
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {getPanelTitle()}
          </SheetTitle>
        </SheetHeader>

        <ChatMessageList />
        <ChatInput />
      </SheetContent>
    </Sheet>
  );
}
