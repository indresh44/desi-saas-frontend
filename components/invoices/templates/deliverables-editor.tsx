"use client";

import { useState } from "react";
import { CheckSquare, Pencil, X } from "lucide-react";
import { renderDeliverable } from "@/lib/utils/format";

type Props = {
  deliverables: string[];
  onChange: (next: string[]) => void;
};

export function DeliverablesEditor({ deliverables, onChange }: Props) {
  const [draft, setDraft] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...deliverables, trimmed]);
    setDraft("");
  };

  const remove = (index: number) => {
    onChange(deliverables.filter((_, i) => i !== index));
  };

  const saveEdit = (index: number) => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    const next = [...deliverables];
    next[index] = trimmed;
    onChange(next);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <CheckSquare className="h-3.5 w-3.5" />
        Deliverables
      </div>

      {deliverables.length > 0 ? (
        <div className="space-y-1">
          {deliverables.map((d, i) => (
            <div key={i} className="group flex items-start gap-1.5 text-sm">
              <span className="mt-0.5 text-muted-foreground">•</span>
              {editingIndex === i ? (
                <input
                  autoFocus
                  className="flex-1 rounded border bg-background px-1.5 py-0.5 text-sm"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveEdit(i);
                    } else if (e.key === "Escape") {
                      setEditingIndex(null);
                    }
                  }}
                  onBlur={() => saveEdit(i)}
                />
              ) : (
                <span className="min-w-0 flex-1 break-words">{renderDeliverable(d)}</span>
              )}
              {editingIndex !== i ? (
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingIndex(i);
                      setEditValue(d);
                    }}
                    className="p-0.5 text-muted-foreground hover:text-foreground"
                    aria-label="Edit deliverable"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="p-0.5 text-muted-foreground hover:text-destructive"
                    aria-label="Remove deliverable"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex gap-1.5">
        <input
          className="flex-1 rounded border bg-background px-2 py-1 text-sm"
          placeholder="e.g. **3 revisions** or site visit included"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          className="rounded border px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Use **text** for bold. These show in the package view when the invoice is shared.
      </p>
    </div>
  );
}
