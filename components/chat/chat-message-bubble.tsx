"use client";

import { ActionCard } from "@/components/chat/action-card";
import { ChatMessage } from "@/lib/types/chat";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

function renderPlainContent(content: string) {
  const lines = content.split("\n");

  return lines.map((line, index) => (
    <span key={`${index}-${line}`}>
      {line}
      {index < lines.length - 1 && <br />}
    </span>
  ));
}

function renderContentWithMentions(content: string, isDarkBg = false) {
  const mentionRegex = /@\[([^\]]+)\]\{([^:}]+):([^}]+)\}/g;
  const parts: (string | { name: string; type: string })[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    parts.push({ name: match[1], type: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  if (parts.length === 0) {
    return renderPlainContent(content);
  }

  return parts.map((part, index) => {
    if (typeof part === "string") {
      return renderPlainContent(part).map((node, partIndex) => (
        <span key={`${index}-${partIndex}`}>{node}</span>
      ));
    }

    return (
      <span
        key={`${part.type}-${part.name}-${index}`}
        className={`rounded px-0.5 font-medium ${
          isDarkBg ? "bg-white/20" : "bg-blue-100 text-blue-700"
        }`}
      >
        @{part.name}
      </span>
    );
  });
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

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
          {isUser
            ? renderContentWithMentions(message.content, true)
            : renderPlainContent(message.content)}
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
