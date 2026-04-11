import type { ReactNode } from "react";

/**
 * Render markdown-style **bold** markers as <strong> elements.
 * Used in deliverables lists across catalog and invoice views.
 */
export function renderDeliverable(text: string): ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-medium">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
