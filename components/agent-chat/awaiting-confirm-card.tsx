"use client";

import { useState, type ReactNode } from "react";
import { Check, Slash, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  AwaitingConfirmPayload,
  AwaitingConfirmResolution,
} from "@/lib/types/agent-chat";

/**
 * Renders the assistant's prepared write as a card with Confirm / Cancel /
 * (optional) Edit. The edit form is intentionally simple for v1 — one text
 * input per editable field; commit on Confirm. Server enforces that only
 * fields in `editable_fields` can be edited (layer-2 invariant).
 *
 * `disabled` flips while the request is in flight to prevent double-confirms.
 *
 * Resolved state: when `payload.resolution` is set (server-populated on
 * GET /sessions/{id} for cards whose underlying task has moved on), the
 * card renders DISABLED buttons + a status label. The action was resolved
 * through another surface (the dashboard carousel, a parallel chat tab,
 * the dismiss path) and the live buttons would commit a now-consumed
 * prepared action — the server would reject it anyway, but the UI must
 * not present the button as live in the first place.
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
  const resolution = payload.resolution ?? null;
  const isResolved = resolution !== null;

  // Buttons are dead in two cases: request in flight (disabled prop)
  // OR the action was already resolved server-side. Edit affordance
  // also disappears once resolved — there's nothing to edit.
  const buttonsDisabled = disabled || isResolved;

  return (
    <div
      className={
        isResolved
          ? "rounded-md border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-700"
          : "rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
      }
    >
      <div
        className={
          isResolved
            ? "mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500"
            : "mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700"
        }
      >
        {isResolved
          ? _RESOLUTION_HEADERS[resolution!]
          : "Ready to commit — please review"}
      </div>
      <pre className="whitespace-pre-wrap break-words font-sans text-sm">
        {payload.preview}
      </pre>

      {/* Edit affordance only when this card is still LIVE — nothing to
           edit on a resolved card. */}
      {!isResolved && editable.length > 0 && (
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

      {isResolved ? (
        // Resolved row — a single label with the resolution kind. No
        // buttons (clicking Confirm would just 409 server-side since the
        // prepared_action is consumed/expired; we never present it as
        // live in the first place).
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-200/70 px-2.5 py-1 text-xs font-medium text-zinc-700">
          {_RESOLUTION_ICONS[resolution!]}
          {_RESOLUTION_LABELS[resolution!]}
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            disabled={buttonsDisabled}
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
            disabled={buttonsDisabled}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}


// Resolution-state copy. Centralised so the header / label / icon stay
// in lockstep; adding a new resolution kind upstream means updating
// these three tables.

const _RESOLUTION_HEADERS: Record<AwaitingConfirmResolution, string> = {
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  dismissed: "Dismissed",
  failed: "Failed",
  unknown: "Resolved elsewhere",
};

const _RESOLUTION_LABELS: Record<AwaitingConfirmResolution, string> = {
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  dismissed: "Dismissed",
  failed: "Commit failed",
  unknown: "No longer pending",
};

const _RESOLUTION_ICONS: Record<AwaitingConfirmResolution, ReactNode> = {
  confirmed: <Check className="h-3 w-3" aria-hidden />,
  cancelled: <X className="h-3 w-3" aria-hidden />,
  dismissed: <Slash className="h-3 w-3" aria-hidden />,
  failed: <X className="h-3 w-3" aria-hidden />,
  unknown: <Slash className="h-3 w-3" aria-hidden />,
};
