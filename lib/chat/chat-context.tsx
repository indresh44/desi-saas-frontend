"use client";

import { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react";
import { confirmChatAction, fetchChatHistory, getOrCreateThread, sendChatMessage } from "@/lib/api/chat";
import { ChatAction, ChatHistoryMessage, ChatMessage, ChatMessageResponse } from "@/lib/types/chat";

interface ChatContextValue {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  messages: ChatMessage[];
  isLoading: boolean;
  isFetchingHistory: boolean;
  sendMessage: (text: string) => Promise<void>;
  confirmAction: (action: ChatAction, confirmedData: Record<string, unknown>) => Promise<void>;
  cancelAction: (messageId: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  const cachedThreadId = useRef<number | null>(null);
  const historyLoaded = useRef<boolean>(false);
  const currentThreadId = useRef<number | null>(null);

  function generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  const ensureThread = useCallback(async (): Promise<number> => {
    if (cachedThreadId.current) {
      return cachedThreadId.current;
    }

    const response = await getOrCreateThread({
      context_type: "global",
      context_id: null,
    });

    cachedThreadId.current = response.thread_id;
    return response.thread_id;
  }, []);

  async function loadHistoryIfNeeded(threadId: number): Promise<void> {
    if (historyLoaded.current) {
      return;
    }

    setIsFetchingHistory(true);

    try {
      const history = await fetchChatHistory(threadId);
      const historicMessages: ChatMessage[] = history.map(
        (msg: ChatHistoryMessage) => ({
          id: `hist_${threadId}_${msg.id}`,
          role: msg.role,
          content: msg.content,
          action: msg.action ? { ...msg.action, status: "confirmed" as const } : null,
          suggestions: msg.suggestions ?? [],
          timestamp: new Date(msg.timestamp),
          pdf: null,
        })
      );

      setMessages(historicMessages);
      historyLoaded.current = true;
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setIsFetchingHistory(false);
    }
  }

  const openChat = useCallback(async () => {
    setIsOpen(true);

    try {
      const threadId = await ensureThread();
      currentThreadId.current = threadId;
      await loadHistoryIfNeeded(threadId);
    } catch (error) {
      console.error("Failed to initialize chat thread:", {
        error,
        message: error instanceof Error ? error.message : undefined,
        status:
          typeof error === "object" && error !== null && "status" in error
            ? (error as { status?: number }).status
            : undefined,
      });
    }
  }, [ensureThread]);

  const closeChat = useCallback(() => setIsOpen(false), []);

  const toggleChat = useCallback(() => {
    if (isOpen) {
      closeChat();
      return;
    }

    void openChat();
  }, [closeChat, isOpen, openChat]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) {
        return;
      }

      const trimmed = text.trim();
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const threadId = currentThreadId.current ?? (await ensureThread());
        currentThreadId.current = threadId;

        const response: ChatMessageResponse = await sendChatMessage({
          message: trimmed,
          context_type: "global",
          context_id: null,
          thread_id: threadId,
        });

        cachedThreadId.current = response.thread_id;
        currentThreadId.current = response.thread_id;

        const assistantMessage: ChatMessage = {
          id: generateMessageId(),
          role: "assistant",
          content: response.reply,
          action: response.action ? { ...response.action, status: "pending" as const } : null,
          suggestions: response.suggestions,
          timestamp: new Date(),
          pdf: response.pdf ?? null,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: generateMessageId(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
        console.error("Chat send failed:", {
          error,
          message: error instanceof Error ? error.message : undefined,
          status:
            typeof error === "object" && error !== null && "status" in error
              ? (error as { status?: number }).status
              : undefined,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [ensureThread, isLoading]
  );

  const confirmAction = useCallback(
    async (action: ChatAction, confirmedData: Record<string, unknown>) => {
      const threadId = currentThreadId.current;
      if (!threadId) {
        return;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.action?.action_type === action.action_type && msg.action.status === "pending"
            ? { ...msg, action: { ...msg.action, status: "confirmed" as const } }
            : msg
        )
      );
      setIsLoading(true);

      try {
        const response = await confirmChatAction({
          thread_id: threadId,
          action_type: action.action_type,
          confirmed_data: confirmedData,
        });

        const confirmMessage: ChatMessage = {
          id: generateMessageId(),
          role: "assistant",
          content: response.reply,
          suggestions: response.suggestions,
          timestamp: new Date(),
          pdf: response.pdf ?? null,
        };

        setMessages((prev) => [...prev, confirmMessage]);
      } catch (error) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.action?.action_type === action.action_type && msg.action.status === "confirmed"
              ? { ...msg, action: { ...msg.action, status: "pending" as const } }
              : msg
          )
        );

        const errorMessage: ChatMessage = {
          id: generateMessageId(),
          role: "assistant",
          content: "Failed to confirm the action. Please try again.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
        console.error("Action confirm failed:", {
          error,
          message: error instanceof Error ? error.message : undefined,
          status:
            typeof error === "object" && error !== null && "status" in error
              ? (error as { status?: number }).status
              : undefined,
        });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const cancelAction = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.action?.status === "pending"
          ? { ...msg, action: { ...msg.action, status: "cancelled" as const } }
          : msg
      )
    );
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        openChat,
        closeChat,
        toggleChat,
        messages,
        isLoading,
        isFetchingHistory,
        sendMessage,
        confirmAction,
        cancelAction,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within ChatProvider");
  }

  return ctx;
}
