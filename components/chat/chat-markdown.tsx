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
          <strong className="font-semibold text-zinc-900">{children}</strong>
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
          <code className="rounded bg-zinc-200/60 px-1 py-0.5 text-[11px] font-mono">
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
          <div className="mb-2 overflow-x-auto rounded-md border border-zinc-200 last:mb-0">
            <table className="w-full text-left text-[11px]">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-zinc-100 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-zinc-100">{children}</tbody>
        ),
        tr: ({ children }) => <tr>{children}</tr>,
        th: ({ children }) => (
          <th className="whitespace-nowrap px-2 py-1.5 font-medium">{children}</th>
        ),
        td: ({ children }) => (
          <td className="whitespace-nowrap px-2 py-1.5 text-zinc-700">{children}</td>
        ),
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
