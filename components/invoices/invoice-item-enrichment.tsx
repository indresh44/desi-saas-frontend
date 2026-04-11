"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Camera, CheckSquare, Loader2, Pencil, Plus, X } from "lucide-react";
import {
  deleteAttachment,
  fetchAttachments,
  uploadAttachment,
} from "@/lib/api/attachments";
import { updateInvoiceItem } from "@/lib/api/invoices";
import { renderDeliverable } from "@/lib/utils/format";
import type { Attachment } from "@/lib/types/attachment";
import type { InvoiceItem } from "@/lib/types/invoice";

interface InvoiceItemEnrichmentProps {
  item: InvoiceItem;
  invoiceId: string;
  invoiceStatus: string;
  onItemUpdated: (updatedItem: InvoiceItem) => void;
}

export function InvoiceItemEnrichment({
  item,
  invoiceId,
  invoiceStatus,
  onItemUpdated,
}: InvoiceItemEnrichmentProps) {
  const isDraft = invoiceStatus === "draft";

  // ── Photos state ──
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [uploading, setUploading] = useState(false);

  // ── Deliverables state ──
  const [deliverables, setDeliverables] = useState<string[]>(item.deliverables ?? []);
  const [newDeliverable, setNewDeliverable] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const sortedAttachments = useMemo(
    () =>
      [...attachments].sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }),
    [attachments]
  );

  // ── Load attachments ──
  const loadAttachments = useCallback(async () => {
    setLoadingPhotos(true);
    try {
      const atts = await fetchAttachments("invoice_item", item.id);
      setAttachments(atts);
    } catch {
      // silently fail — photos are non-critical
    } finally {
      setLoadingPhotos(false);
    }
  }, [item.id]);

  useEffect(() => {
    void loadAttachments();
  }, [loadAttachments]);

  // Sync deliverables when item changes externally
  useEffect(() => {
    setDeliverables(item.deliverables ?? []);
  }, [item.deliverables]);

  // ── Photo upload ──
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) return;
    if (file.size > 10 * 1024 * 1024) return;

    setUploading(true);
    try {
      await uploadAttachment("invoice_item", item.id, file);
      await loadAttachments();
    } catch {
      // silent
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // ── Photo delete ──
  async function handlePhotoDelete(attachmentId: string) {
    try {
      await deleteAttachment(attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch {
      // silent
    }
  }

  // ── Deliverables save ──
  async function saveDeliverables(updated: string[]) {
    setSaving(true);
    try {
      const result = await updateInvoiceItem(invoiceId, item.id, {
        deliverables: updated.length > 0 ? updated : null,
      });
      onItemUpdated(result);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  function addDeliverable() {
    if (!newDeliverable.trim()) return;
    const updated = [...deliverables, newDeliverable.trim()];
    setDeliverables(updated);
    setNewDeliverable("");
    void saveDeliverables(updated);
  }

  function removeDeliverable(index: number) {
    const updated = deliverables.filter((_, i) => i !== index);
    setDeliverables(updated);
    void saveDeliverables(updated);
  }

  function saveEdit(index: number) {
    if (!editValue.trim()) return;
    const updated = [...deliverables];
    updated[index] = editValue.trim();
    setDeliverables(updated);
    setEditingIndex(null);
    void saveDeliverables(updated);
  }

  return (
    <div className="space-y-3 px-4 py-3 border-t border-border/50 bg-muted/30">
      {/* ── Photos ── */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
          <Camera className="h-3.5 w-3.5" />
          Photos
        </div>
        <div className="flex gap-2 flex-wrap">
          {loadingPhotos ? (
            <div className="text-xs text-muted-foreground">Loading...</div>
          ) : (
            <>
              {sortedAttachments.map((att, i) => (
                <div
                  key={att.id}
                  className="relative w-16 h-16 rounded-md overflow-hidden border border-border group"
                >
                  {(att.is_primary ||
                    (i === 0 && !attachments.some((a) => a.is_primary))) && (
                    <span className="absolute top-0.5 left-0.5 text-[8px] bg-black/60 text-white px-1 py-px rounded z-10">
                      Cover
                    </span>
                  )}
                  <img
                    src={att.file_url}
                    alt={att.filename}
                    className="w-full h-full object-cover"
                  />
                  {isDraft && (
                    <button
                      type="button"
                      onClick={() => void handlePhotoDelete(att.id)}
                      className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              ))}
              {isDraft && (
                <label className="w-16 h-16 rounded-md border border-dashed border-border flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:border-foreground/30 transition-colors">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span className="text-[9px] mt-0.5">Add</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => void handlePhotoUpload(e)}
                    disabled={uploading}
                  />
                </label>
              )}
            </>
          )}
        </div>
        {attachments.length === 0 && !loadingPhotos && isDraft && (
          <p className="text-[11px] text-muted-foreground mt-1">
            Add sample photos for package view
          </p>
        )}
      </div>

      {/* ── Deliverables ── */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
          <CheckSquare className="h-3.5 w-3.5" />
          Deliverables
          {saving && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
        </div>

        {deliverables.length > 0 && (
          <div className="space-y-1 mb-2">
            {deliverables.map((d, i) => (
              <div key={i} className="flex items-start gap-1.5 text-sm group">
                <span className="text-muted-foreground mt-0.5">•</span>
                {editingIndex === i ? (
                  <input
                    className="flex-1 text-sm border rounded px-1.5 py-0.5 bg-background"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveEdit(i);
                      }
                      if (e.key === "Escape") setEditingIndex(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 min-w-0 break-words">
                    {renderDeliverable(d)}
                  </span>
                )}
                {isDraft && editingIndex !== i && (
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIndex(i);
                        setEditValue(d);
                      }}
                      className="text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDeliverable(i)}
                      className="text-muted-foreground hover:text-destructive p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isDraft && (
          <div className="flex gap-1.5">
            <input
              className="flex-1 text-sm border rounded px-2 py-1 bg-background"
              placeholder='e.g. **Cinematic reel** — 3-5 min highlight'
              value={newDeliverable}
              onChange={(e) => setNewDeliverable(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addDeliverable();
                }
              }}
            />
            <button
              type="button"
              onClick={addDeliverable}
              disabled={!newDeliverable.trim()}
              className="text-xs px-2 py-1 border rounded hover:bg-accent disabled:opacity-50"
            >
              Add
            </button>
          </div>
        )}

        {deliverables.length === 0 && !isDraft && (
          <p className="text-xs text-muted-foreground">No deliverables specified</p>
        )}

        {isDraft && (
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Use **text** for bold. These appear in the package view when you share the invoice link.
          </p>
        )}
      </div>
    </div>
  );
}
