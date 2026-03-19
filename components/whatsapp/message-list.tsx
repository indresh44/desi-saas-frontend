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
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
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
                  ? "border-zinc-300 bg-zinc-900 text-zinc-50"
                  : "border-zinc-200 bg-white text-zinc-900"
              )}
            >
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {renderMessageBody(message)}
              </p>
              <div
                className={cn(
                  "mt-2 flex items-center gap-2 text-[11px]",
                  isOutgoing ? "text-zinc-300" : "text-zinc-500"
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