"use client";

import { ActionCard } from "@/components/chat/action-card";
import { ChatMessage } from "@/lib/types/chat";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";
  const lines = message.content.split("\n");

  return (
    <div className={`mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex max-w-[85%] flex-col gap-1.5">
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "rounded-tr-sm bg-zinc-900 text-white"
              : "rounded-tl-sm bg-zinc-100 text-zinc-800"
          }`}
        >
          {lines.map((line, index) => (
            <span key={`${message.id}-${index}`}>
              {line}
              {index < lines.length - 1 && <br />}
            </span>
          ))}
        </div>

        {message.action && <ActionCard action={message.action} messageId={message.id} />}

        <span className={`text-[10px] ${isUser ? "text-right text-zinc-400" : "text-zinc-400"}`}>
          {message.timestamp.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </span>
      </div>
    </div>
  );
}
