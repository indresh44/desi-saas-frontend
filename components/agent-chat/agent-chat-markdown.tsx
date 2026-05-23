"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Markdown renderer dedicated to /agent-chat.
 *
 * Palette (per founder request):
 *   - **bold**     → blue, bold
 *   - tables       → purple header (white text), zebra body rows
 *   - inline code  → mono with subtle bg
 *   - links        → blue underline
 *   - headings     → tight assistant-message scale (we're inside a bubble)
 *   - blockquotes  → left rule
 *
 * Kept separate from components/chat/chat-markdown.tsx so the old chat surface
 * is not visually disturbed by this surface's styling choices.
 */
export function AgentChatMarkdown({ content }: { content: string }) {
  return (
    <div className="agent-md text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // --- text blocks -----------------------------------------------
          p: ({ children }) => (
            <p className="mb-2 last:mb-0">{children}</p>
          ),
          h1: ({ children }) => (
            <h1 className="mb-2 mt-1 text-base font-bold text-zinc-900 last:mb-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-1 text-sm font-bold text-zinc-900 last:mb-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-1.5 mt-1 text-sm font-semibold text-zinc-900 last:mb-0">
              {children}
            </h3>
          ),

          // --- emphasis: BOLD → blue, italic unchanged ------------------
          strong: ({ children }) => (
            <strong className="font-bold text-blue-700">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,

          // --- code -----------------------------------------------------
          code: ({ children }) => (
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[12px] text-zinc-800">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="mb-2 overflow-x-auto rounded-md bg-zinc-900 p-2 text-[12px] text-zinc-100 last:mb-0">
              {children}
            </pre>
          ),

          // --- lists ----------------------------------------------------
          ul: ({ children }) => (
            <ul className="mb-2 ml-5 list-disc space-y-0.5 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 ml-5 list-decimal space-y-0.5 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,

          // --- links ----------------------------------------------------
          a: ({ href, children }) => {
            const className =
              "text-blue-700 underline underline-offset-2 hover:text-blue-900";
            const isInternal = typeof href === "string" && href.startsWith("/");
            if (isInternal && href) {
              return (
                <Link href={href} className={className}>
                  {children}
                </Link>
              );
            }
            return (
              <a
                href={href}
                className={className}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },

          // --- tables (the headline customisation) ----------------------
          table: ({ children }) => (
            <div className="mb-2 overflow-x-auto rounded-md border border-zinc-200 last:mb-0">
              <table className="w-full border-collapse text-left text-[13px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-purple-700 text-white">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-zinc-200 [&>tr:nth-child(even)]:bg-zinc-50">
              {children}
            </tbody>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 align-top text-zinc-800">{children}</td>
          ),

          // --- blockquote ----------------------------------------------
          blockquote: ({ children }) => (
            <blockquote className="mb-2 border-l-4 border-blue-400 bg-blue-50 px-3 py-1 text-zinc-700 last:mb-0">
              {children}
            </blockquote>
          ),

          // --- horizontal rule -----------------------------------------
          hr: () => <hr className="my-2 border-zinc-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
