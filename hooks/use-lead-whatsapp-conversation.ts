"use client";

import { useCallback, useEffect, useState } from "react";
import { findOrCreateConversationByLead } from "@/lib/api/whatsapp";
import { DEFAULT_USER_ID } from "@/lib/constants/api";
import { WhatsAppConversationRead } from "@/lib/types/whatsapp";

type UseLeadWhatsAppConversationResult = {
  conversation: WhatsAppConversationRead | null;
  isLoading: boolean;
  error: string | null;
  refreshConversation: () => Promise<void>;
};

export function useLeadWhatsAppConversation(
  leadId: string | null,
  isEnabled: boolean
): UseLeadWhatsAppConversationResult {
  const [conversation, setConversation] = useState<WhatsAppConversationRead | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshConversation = useCallback(async () => {
    if (!isEnabled || !leadId) {
      setConversation(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await findOrCreateConversationByLead(leadId, DEFAULT_USER_ID);
      setConversation(data);
    } catch (refreshError) {
      if (
        typeof refreshError === "object" &&
        refreshError !== null &&
        "message" in refreshError &&
        typeof refreshError.message === "string"
      ) {
        setError(refreshError.message);
      } else {
        setError("Unable to open chat. Please try again.");
      }
      setConversation(null);
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled, leadId]);

  useEffect(() => {
    void refreshConversation();
  }, [refreshConversation]);

  return {
    conversation,
    isLoading,
    error,
    refreshConversation,
  };
}