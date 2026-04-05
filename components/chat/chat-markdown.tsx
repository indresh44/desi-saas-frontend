"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMarkdownProps {
  content: string;
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        h1: ({ children }) => <p className="mb-2 font-bold last:mb-0">{children}</p>,
        h2: ({ children }) => <p className="mb-2 font-bold last:mb-0">{children}</p>,
        h3: ({ children }) => <p className="mb-1.5 font-semibold last:mb-0">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-semibold text-zinc-950">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="rounded bg-zinc-800/10 px-1 py-0.5 text-[11px] font-semibold font-mono text-zinc-800">
            {children}
          </code>
        ),
        ul: ({ children }) => (
          <ul className="mb-2 ml-4 list-disc space-y-0.5 last:mb-0 [&>li]:pl-0.5">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 ml-4 list-decimal space-y-0.5 last:mb-0 [&>li]:pl-0.5">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="text-zinc-700">{children}</li>,
        table: ({ children }) => (
          <div className="mb-2 overflow-x-auto rounded-lg border border-zinc-200/80 last:mb-0">
            <table className="w-full text-left text-[11px]">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-zinc-800/5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-zinc-100 [&>tr:nth-child(even)]:bg-zinc-50/50">
            {children}
          </tbody>
        ),
        tr: ({ children }) => (
          <tr className="transition-colors hover:bg-zinc-50/80 [&>td:first-child]:font-medium [&>td:first-child]:text-amber-800">
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="whitespace-nowrap px-2.5 py-2 font-semibold">{children}</th>
        ),
        td: ({ children }) => {
          const text = String(children ?? "");
          const isNumeric = /^[₹$€]?\s?[\d,]+(\.\d+)?%?$/.test(text.replace(/\*\*/g, "").trim());

          return (
            <td
              className={`whitespace-nowrap px-2.5 py-1.5 ${
                isNumeric ? "text-right tabular-nums text-zinc-700" : "text-zinc-700"
              }`}
            >
              {children}
            </td>
          );
        },
        hr: () => <hr className="my-2 border-zinc-200" />,
        blockquote: ({ children }) => (
          <blockquote className="mb-2 border-l-2 border-zinc-300 pl-2.5 italic text-zinc-600 last:mb-0">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
