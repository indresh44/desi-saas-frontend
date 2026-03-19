"use client";

import { useEffect } from "react";
import { Loader2, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLeadWhatsAppConversation } from "@/hooks/use-lead-whatsapp-conversation";
import { useWhatsAppMessages } from "@/hooks/use-whatsapp-messages";
import { Lead } from "@/lib/types/lead";
import { MessageComposer } from "@/components/whatsapp/message-composer";
import { MessageList } from "@/components/whatsapp/message-list";

type LeadWhatsAppChatDrawerProps = {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
};

export function LeadWhatsAppChatDrawer({
  isOpen,
  lead,
  onClose,
}: LeadWhatsAppChatDrawerProps) {
  const {
    conversation,
    isLoading: isConversationLoading,
    error: conversationError,
    refreshConversation,
  } = useLeadWhatsAppConversation(lead?.id ?? null, isOpen);

  const {
    messages,
    isLoading: isMessagesLoading,
    isSending,
    error: messagesError,
    refreshMessages,
    sendMessage,
  } = useWhatsAppMessages(conversation?.id ?? null, isOpen && !!conversation);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !lead) {
    return null;
  }

  const headerTitle =
    conversation?.contact_name || conversation?.phone_number || "WhatsApp Chat";
  const headerSubtitle = conversation
    ? `${conversation.phone_number}${conversation.is_blocked ? " • Blocked" : ""}`
    : "Lead chat";

  const hasError = conversationError || messagesError;
  const isLoading = isConversationLoading || (conversation && isMessagesLoading);

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-zinc-900/35"
        aria-label="Close chat"
        onClick={onClose}
      />

      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-zinc-200 bg-zinc-50 shadow-2xl">
        <header className="flex items-start justify-between border-b border-zinc-200 bg-white px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{headerTitle}</h2>
            <p className="text-xs text-zinc-500">{headerSubtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={async () => {
                await refreshConversation();
                if (conversation) {
                  await refreshMessages();
                }
              }}
              disabled={isConversationLoading || isMessagesLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading WhatsApp chat...
            </div>
          ) : null}

          {hasError ? (
            <div className="space-y-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <p>{conversationError || messagesError}</p>
              {conversationError?.toLowerCase().includes("phone") ? (
                <p className="text-red-500">
                  Please add a phone number to this lead&apos;s customer profile.
                </p>
              ) : null}
            </div>
          ) : null}

          {!isLoading && !hasError && conversation ? (
            <MessageList messages={messages} />
          ) : null}
        </div>

        <footer className="border-t border-zinc-200 bg-white p-4">
          {conversation?.is_blocked ? (
            <p className="mb-2 text-xs text-amber-700">
              Messaging is blocked for this conversation.
            </p>
          ) : null}

          <MessageComposer
            isDisabled={!conversation || !!conversation.is_blocked || !!hasError}
            isSending={isSending}
            onSend={sendMessage}
          />
        </footer>
      </aside>
    </>
  );
}