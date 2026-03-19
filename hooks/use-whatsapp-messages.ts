"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchConversationMessages, sendWhatsAppText } from "@/lib/api/whatsapp";
import { DEFAULT_USER_ID } from "@/lib/constants/api";
import { WhatsAppMessageRead } from "@/lib/types/whatsapp";

type UseWhatsAppMessagesResult = {
  messages: WhatsAppMessageRead[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  refreshMessages: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
};

export function useWhatsAppMessages(
  conversationId: string | null,
  isEnabled: boolean
): UseWhatsAppMessagesResult {
  const [messages, setMessages] = useState<WhatsAppMessageRead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMessages = useCallback(async () => {
    if (!isEnabled || !conversationId) {
      setMessages([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchConversationMessages(conversationId, {
        limit: 50,
        offset: 0,
        userId: DEFAULT_USER_ID,
      });

      const sorted = [...data].sort((a, b) => {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return aTime - bTime;
      });

      setMessages(sorted);
    } catch (refreshError) {
      if (
        typeof refreshError === "object" &&
        refreshError !== null &&
        "message" in refreshError &&
        typeof refreshError.message === "string"
      ) {
        setError(refreshError.message);
      } else {
        setError("Unable to load WhatsApp messages.");
      }
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isEnabled]);

  useEffect(() => {
    void refreshMessages();
  }, [refreshMessages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversationId) {
        return;
      }

      const trimmedText = text.trim();
      if (!trimmedText) {
        return;
      }

      setIsSending(true);
      setError(null);

      try {
        const sentMessage = await sendWhatsAppText(
          {
            conversation_id: conversationId,
            text: trimmedText,
          },
          DEFAULT_USER_ID
        );
        setMessages((prev) => [...prev, sentMessage]);
      } catch (sendError) {
        if (
          typeof sendError === "object" &&
          sendError !== null &&
          "message" in sendError &&
          typeof sendError.message === "string"
        ) {
          setError(sendError.message);
        } else {
          setError("Unable to send WhatsApp message.");
        }
      } finally {
        setIsSending(false);
      }
    },
    [conversationId]
  );

  return useMemo(
    () => ({
      messages,
      isLoading,
      isSending,
      error,
      refreshMessages,
      sendMessage,
    }),
    [error, isLoading, isSending, messages, refreshMessages, sendMessage]
  );
}