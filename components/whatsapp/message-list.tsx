"use client";

import { WhatsAppMessageRead } from "@/lib/types/whatsapp";
import { cn } from "@/lib/utils";

type MessageListProps = {
  messages: WhatsAppMessageRead[];
};

function formatTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function renderMessageBody(message: WhatsAppMessageRead) {
  if (message.message_type === "text") {
    return message.text_body || "(empty text message)";
  }

  return `Unsupported message type: ${message.message_type}`;
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
        No messages yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => {
        const isOutgoing = message.direction === "outgoing";

        return (
          <div
            key={message.id}
            className={cn("flex", isOutgoing ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-xl border px-3 py-2",
                isOutgoing
                  ? "border-primary/20 bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground"
              )}
            >
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {renderMessageBody(message)}
              </p>
              <div
                className={cn(
                  "mt-2 flex items-center gap-2 text-[11px]",
                  isOutgoing ? "text-primary-foreground/70" : "text-muted-foreground"
                )}
              >
                <span>{formatTime(message.created_at)}</span>
                {isOutgoing ? <span>Status: {message.status}</span> : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
