"use client";

/**
 * One expandable row inside the dashboard's "Recently done" group.
 *
 * Collapsed (the default): icon + short_label + a small status marker
 * (✓ done, ✗ failed) + chevron. Verbose answer text NEVER appears here —
 * tables get mangled in cramped one-liners; the full body lives in the
 * expanded panel.
 *
 * Expanded (click row to toggle): renders task.answer via the same
 * `AgentChatMarkdown` the chat surface uses, so tables, lists, code,
 * and bold all render correctly with the same palette.
 *
 * No navigation away from the dashboard — expand/collapse is in place.
 */

import { useState } from "react";
import {
  BookOpen,
  Briefcase,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  IndianRupee,
  Pencil,
  Tag,
  User2,
  X,
} from "lucide-react";

import { AgentChatMarkdown } from "@/components/agent-chat/agent-chat-markdown";
import type {
  AssistantTaskIcon,
  AssistantTaskSummary,
} from "@/lib/types/dashboard";


export function RecentlyDoneRow({ task }: { task: AssistantTaskSummary }) {
  const [expanded, setExpanded] = useState(false);
  const isFailed = task.status === "failed";

  // What the expanded body should show. For done writes the loop's
  // commit-result blurb (e.g. "Done — record_payment committed.") is
  // often shorter than the short_label; we still render whatever the
  // task left in `answer` because it's the only thing the LLM actually
  // produced. For failed rows we fall back to the error message.
  const expandedBody =
    task.answer?.trim() ||
    (isFailed && task.error_message ? `**Failed:** ${task.error_message}` : "") ||
    "_(no further detail)_";

  return (
    <li className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2 px-2 py-2 text-left text-sm hover:bg-muted/30 focus:outline-none focus-visible:bg-muted/40"
      >
        <IconForKind kind={task.icon} className="shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-foreground">
          {task.short_label || task.description}
        </span>
        <StatusMarker isFailed={isFailed} />
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border bg-muted/20 px-3 py-3">
          {/* If the short_label was a clean derivation (e.g. "Recorded
              payment"), the owner-typed description might still be
              interesting context — show it as a small subhead. Skip when
              they're the same string. */}
          {task.description && task.description !== task.short_label && (
            <div className="mb-2 text-xs text-muted-foreground">
              Asked: <span className="italic">{task.description}</span>
            </div>
          )}
          {/* Real markdown render — tables/lists/bold work like in chat. */}
          <AgentChatMarkdown content={expandedBody} />
        </div>
      )}
    </li>
  );
}


function StatusMarker({ isFailed }: { isFailed: boolean }) {
  if (isFailed) {
    return (
      <span
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700"
        title="Failed"
        aria-label="Failed"
      >
        <X className="h-3 w-3" aria-hidden />
      </span>
    );
  }
  return (
    <span
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
      title="Done"
      aria-label="Done"
    >
      <Check className="h-3 w-3" aria-hidden />
    </span>
  );
}


/**
 * Icon swatches per icon category. Keep small + neutral; this isn't the
 * place for brand-style colored badges. The lucide names are chosen to
 * read at a glance: rupee for payments, calendar for follow-ups, file
 * for invoices, person for customers, tag for catalog, book for read,
 * pencil for the generic write fallback.
 */
function IconForKind({
  kind,
  className = "",
}: {
  kind: AssistantTaskIcon;
  className?: string;
}) {
  const props = { className: `h-3.5 w-3.5 ${className}`, "aria-hidden": true };
  switch (kind) {
    case "payment":
      return <IndianRupee {...props} />;
    case "followup":
      return <CalendarClock {...props} />;
    case "invoice":
      return <FileText {...props} />;
    case "lead":
      return <Briefcase {...props} />;
    case "customer":
      return <User2 {...props} />;
    case "catalog":
      return <Tag {...props} />;
    case "read":
      return <BookOpen {...props} />;
    case "write":
    default:
      return <Pencil {...props} />;
  }
}
