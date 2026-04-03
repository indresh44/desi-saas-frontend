"use client";

import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SendHorizontal } from "lucide-react";
import { MentionDropdown, MentionDropdownHandle } from "@/components/chat/mention-dropdown";
import { useChat } from "@/lib/chat/chat-context";
import {
  InsertedMention,
  MentionCategory,
  MentionEntity,
} from "@/lib/types/chat";

export function ChatInput() {
  const { sendMessage, isLoading } = useChat();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionDropdownRef = useRef<MentionDropdownHandle>(null);
  const [mentions, setMentions] = useState<InsertedMention[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionTriggerIndex, setMentionTriggerIndex] = useState<number>(-1);
  const [cursorPosition, setCursorPosition] = useState(0);

  const mentionSearchText = useMemo(() => {
    if (!showMentionDropdown || mentionTriggerIndex < 0) {
      return "";
    }

    return text.slice(mentionTriggerIndex + 1, cursorPosition);
  }, [cursorPosition, mentionTriggerIndex, showMentionDropdown, text]);

  function serializeMessage(rawText: string, mentionList: InsertedMention[]): string {
    if (!mentionList.length) {
      return rawText;
    }

    const sortedMentions = [...mentionList].sort((a, b) => b.startIndex - a.startIndex);
    let result = rawText;

    for (const mention of sortedMentions) {
      const displayText = result.slice(mention.startIndex, mention.endIndex);
      if (displayText === `@${mention.displayName}`) {
        const serialized = `@[${mention.displayName}]{${mention.type}:${mention.id}}`;
        result =
          result.slice(0, mention.startIndex) + serialized + result.slice(mention.endIndex);
      }
    }

    return result;
  }

  async function handleSend() {
    if (!text.trim() || isLoading) {
      return;
    }

    const message = serializeMessage(text, mentions);
    setText("");
    setMentions([]);
    setShowMentionDropdown(false);
    setMentionTriggerIndex(-1);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await sendMessage(message);
    textareaRef.current?.focus();
  }

  function recalculateMentions(value: string, previousMentions: InsertedMention[]): InsertedMention[] {
    let searchStart = 0;

    return previousMentions.reduce<InsertedMention[]>((acc, mention) => {
      const displayText = `@${mention.displayName}`;
      const startIndex = value.indexOf(displayText, searchStart);

      if (startIndex === -1) {
        return acc;
      }

      const endIndex = startIndex + displayText.length;
      acc.push({ ...mention, startIndex, endIndex });
      searchStart = endIndex;
      return acc;
    }, []);
  }

  function resizeTextarea() {
    const element = textareaRef.current;
    if (!element) {
      return;
    }

    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 120)}px`;
  }

  function handleMentionSelect(entity: MentionEntity, category: MentionCategory) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const selectionStart = textarea.selectionStart;
    const beforeAt = text.slice(0, mentionTriggerIndex);
    const afterCursor = text.slice(selectionStart);
    const mentionText = `@${entity.name}`;
    const newText = `${beforeAt}${mentionText} ${afterCursor}`;

    const newMention: InsertedMention = {
      id: entity.id,
      type: category,
      displayName: entity.name,
      startIndex: mentionTriggerIndex,
      endIndex: mentionTriggerIndex + mentionText.length,
    };

    setText(newText);
    setCursorPosition(mentionTriggerIndex + mentionText.length + 1);
    setMentions((prev) => {
      const updated = recalculateMentions(newText, prev);
      return [...updated, newMention].sort((a, b) => a.startIndex - b.startIndex);
    });
    setShowMentionDropdown(false);
    setMentionTriggerIndex(-1);

    const cursorPos = mentionTriggerIndex + mentionText.length + 1;
    requestAnimationFrame(() => {
      resizeTextarea();
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const newValue = event.target.value;
    const cursorPos = event.target.selectionStart;
    setText(newValue);
    setCursorPosition(cursorPos);

    if (newValue.length > text.length && newValue[cursorPos - 1] === "@") {
      const charBefore = cursorPos > 1 ? newValue[cursorPos - 2] : " ";
      if (charBefore === " " || charBefore === "\n" || cursorPos === 1) {
        setShowMentionDropdown(true);
        setMentionTriggerIndex(cursorPos - 1);
      }
    }

    if (showMentionDropdown && mentionTriggerIndex >= 0) {
      const query = newValue.slice(mentionTriggerIndex + 1, cursorPos);
      if (
        cursorPos <= mentionTriggerIndex ||
        newValue[mentionTriggerIndex] !== "@" ||
        /\s/.test(query)
      ) {
        setShowMentionDropdown(false);
        setMentionTriggerIndex(-1);
      }
    }

    setMentions((prev) => recalculateMentions(newValue, prev));
    resizeTextarea();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (showMentionDropdown && ["ArrowDown", "ArrowUp", "Enter", "Escape", "Backspace"].includes(event.key)) {
      mentionDropdownRef.current?.handleKeyDown(event);
      if (event.defaultPrevented) {
        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  useEffect(() => {
    resizeTextarea();
  }, []);

  const highlightedHtml = useMemo(() => {
    if (!mentions.length) {
      return escapeHtml(text).replace(/\n/g, "<br>");
    }

    const sortedMentions = [...mentions].sort((a, b) => a.startIndex - b.startIndex);
    let html = "";
    let lastIndex = 0;

    for (const mention of sortedMentions) {
      const mentionText = text.slice(mention.startIndex, mention.endIndex);
      if (mentionText !== `@${mention.displayName}`) {
        continue;
      }

      html += escapeHtml(text.slice(lastIndex, mention.startIndex));
      html += `<mark class="rounded bg-blue-100 px-0.5 font-medium text-blue-700">${escapeHtml(
        mentionText
      )}</mark>`;
      lastIndex = mention.endIndex;
    }

    html += escapeHtml(text.slice(lastIndex));
    return html.replace(/\n/g, "<br>");
  }, [mentions, text]);

  return (
    <div className="border-t bg-white px-3 py-3">
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          {showMentionDropdown ? (
            <MentionDropdown
              ref={mentionDropdownRef}
              searchText={mentionSearchText}
              onSelect={handleMentionSelect}
              onClose={() => {
                setShowMentionDropdown(false);
                setMentionTriggerIndex(-1);
              }}
            />
          ) : null}

          {mentions.length > 0 ? (
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words rounded-xl border border-transparent bg-zinc-50 px-3.5 py-2.5 text-sm leading-normal text-zinc-900"
              dangerouslySetInnerHTML={{ __html: `${highlightedHtml}<br />` }}
              aria-hidden="true"
            />
          ) : null}

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... Type @ to mention"
            disabled={isLoading}
            rows={1}
            className={`max-h-[120px] min-h-[40px] w-full resize-none rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm leading-normal placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none disabled:opacity-50 ${
              mentions.length > 0 ? "bg-transparent" : "bg-zinc-50 focus:bg-white"
            }`}
            style={mentions.length > 0 ? { color: "transparent", caretColor: "#18181b" } : undefined}
          />
        </div>
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!text.trim() || isLoading}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900"
          aria-label="Send message"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1 px-1 text-[10px] text-zinc-400">
        Type <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 font-mono">@</kbd> to mention customers or items
      </p>
    </div>
  );
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
