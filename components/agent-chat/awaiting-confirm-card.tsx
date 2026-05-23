"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { AwaitingConfirmPayload } from "@/lib/types/agent-chat";

/**
 * Renders the assistant's prepared write as a card with Confirm / Cancel /
 * (optional) Edit. The edit form is intentionally simple for v1 — one text
 * input per editable field; commit on Confirm. Server enforces that only
 * fields in `editable_fields` can be edited (layer-2 invariant).
 *
 * `disabled` flips while the request is in flight to prevent double-confirms.
 */
export function AwaitingConfirmCard({
  payload,
  disabled,
  onConfirm,
  onCancel,
}: {
  payload: AwaitingConfirmPayload;
  disabled: boolean;
  onConfirm: (edits: Record<string, string> | undefined) => void;
  onCancel: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [edits, setEdits] = useState<Record<string, string>>({});

  const editable = payload.editable_fields ?? [];

  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
        Ready to commit — please review
      </div>
      <pre className="whitespace-pre-wrap break-words font-sans text-sm">
        {payload.preview}
      </pre>

      {editable.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            className="text-xs text-amber-800 underline"
            onClick={() => setEditOpen((v) => !v)}
          >
            {editOpen ? "Hide edits" : `Edit ${editable.length} field${editable.length === 1 ? "" : "s"}`}
          </button>
          {editOpen && (
            <div className="mt-2 grid gap-2">
              {editable.map((field) => (
                <label key={field} className="flex flex-col text-xs">
                  <span className="font-medium text-amber-900">{field}</span>
                  <input
                    className="rounded border border-amber-300 px-2 py-1 text-sm"
                    value={edits[field] ?? ""}
                    placeholder="(leave blank to keep prepared value)"
                    onChange={(e) =>
                      setEdits((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                  />
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          disabled={disabled}
          onClick={() => {
            const nonEmpty = Object.fromEntries(
              Object.entries(edits).filter(([, v]) => v.trim() !== ""),
            );
            onConfirm(Object.keys(nonEmpty).length ? nonEmpty : undefined);
          }}
        >
          Confirm
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
