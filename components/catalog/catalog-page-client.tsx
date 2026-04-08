"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteCatalogAttachment,
  fetchCatalogAttachmentsBatch,
  fetchCatalogItems,
  deactivateCatalogItem,
} from "@/lib/api/catalog-items";
import type { Attachment } from "@/lib/types/attachment";
import { CatalogItem } from "@/lib/types/catalog-item";
import { AttachmentPreviewModal } from "@/components/attachments/attachment-preview-modal";
import { AttachmentThumbnailStrip } from "@/components/attachments/attachment-thumbnail-strip";
import { CatalogItemDialog } from "./catalog-item-dialog";

function formatRupees(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const UNIT_LABELS: Record<string, string> = {
  piece: "Piece",
  sq_ft: "Sq. Ft.",
  meter: "Meter",
  kg: "Kg",
  hour: "Hour",
  session: "Session",
  month: "Month",
  trip: "Trip",
  lot: "Lot",
};

export default function CatalogPageClient() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [attachmentsByItem, setAttachmentsByItem] = useState<Record<string, Attachment[]>>({});
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (showInactive) {
        // Fetch both active and inactive
        const [active, inactive] = await Promise.all([
          fetchCatalogItems(undefined, true),
          fetchCatalogItems(undefined, false),
        ]);
        // Merge and sort by name
        const all = [...active, ...inactive].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setItems(all);
      } else {
        const active = await fetchCatalogItems(undefined, true);
        setItems(active);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load catalog items.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    const itemIds = items.map((item) => item.id);

    if (itemIds.length === 0) {
      setAttachmentsByItem({});
      return;
    }

    let mounted = true;
    const loadBatchAttachments = async () => {
      try {
        const grouped = await fetchCatalogAttachmentsBatch(itemIds);
        if (mounted) {
          setAttachmentsByItem(grouped);
        }
      } catch {
        if (mounted) {
          setAttachmentsByItem({});
        }
      }
    };

    void loadBatchAttachments();

    return () => {
      mounted = false;
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [items, search]);

  const handleCreate = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDeactivate = async (item: CatalogItem) => {
    if (
      !window.confirm(
        `Deactivate ${item.name}? It won't appear in new quotes or invoices but existing ones are unaffected.`
      )
    ) {
      return;
    }

    try {
      await deactivateCatalogItem(item.id);
      await loadItems();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to deactivate item.";
      setErrorMessage(message);
    }
  };

  const openPreview = (itemId: string, index: number) => {
    setPreviewItemId(itemId);
    setPreviewIndex(index);
  };

  const handleDeleteFromPreview = async (attachmentId: string) => {
    if (!previewItemId) return;
    await deleteCatalogAttachment(attachmentId);

    setAttachmentsByItem((prev) => {
      const next = { ...prev };
      const currentList = next[previewItemId] ?? [];
      next[previewItemId] = currentList.filter((item) => item.id !== attachmentId);
      return next;
    });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Catalog
          </h1>
          <p className="text-sm text-muted-foreground">
            Items and services you sell or use regularly
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:min-w-52 sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary"
          />
          Show inactive items
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            <div className="h-10 animate-pulse rounded bg-muted" />
            <div className="h-10 animate-pulse rounded bg-muted" />
            <div className="h-10 animate-pulse rounded bg-muted" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            {search
              ? `No items matching '${search}'`
              : "No items in your catalog yet. Add your first item to get started."}
          </div>
        ) : (
          <>
            {/* ── Mobile card list (< md) ── */}
            <ul className="divide-y divide-border md:hidden">
              {filteredItems.map((item) => (
                <li
                  key={item.id}
                  className={`px-4 py-4 ${!item.isActive ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-primary">{item.name}</p>
                      {item.description ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {item.isActive ? (
                        <button
                          onClick={() => handleDeactivate(item)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-red-600"
                          title="Deactivate"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {item.unit === "custom"
                        ? item.customUnit
                        : UNIT_LABELS[item.unit] || item.unit}
                    </span>
                    <span>·</span>
                    <span className="font-medium text-primary">{formatRupees(item.defaultRate)}</span>
                    <span>·</span>
                    <span>GST {item.gstPercent}%</span>
                    <span>·</span>
                    {item.isActive ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                        Inactive
                      </span>
                    )}
                  </div>
                  {(attachmentsByItem[item.id] ?? []).length > 0 ? (
                    <div className="mt-2">
                      <AttachmentThumbnailStrip
                        attachments={attachmentsByItem[item.id] ?? []}
                        maxVisible={4}
                        onSelect={(index) => openPreview(item.id, index)}
                        emptyLabel="No attachments"
                      />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>

            {/* ── Desktop table (≥ md) ── */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Unit</th>
                    <th className="px-4 py-3 font-medium">Rate</th>
                    <th className="px-4 py-3 font-medium">GST %</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Preview</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className={
                        !item.isActive ? "bg-muted opacity-60" : undefined
                      }
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-primary">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {item.unit === "custom"
                          ? item.customUnit
                          : UNIT_LABELS[item.unit] || item.unit}
                      </td>
                      <td className="px-4 py-3 text-primary">
                        {formatRupees(item.defaultRate)}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {item.gstPercent}%
                      </td>
                      <td className="px-4 py-3">
                        {item.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <AttachmentThumbnailStrip
                          attachments={attachmentsByItem[item.id] ?? []}
                          maxVisible={4}
                          onSelect={(index) => openPreview(item.id, index)}
                          emptyLabel="No attachments"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-muted-foreground hover:text-foreground"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {item.isActive && (
                            <button
                              onClick={() => handleDeactivate(item)}
                              className="text-muted-foreground hover:text-red-600"
                              title="Deactivate"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <CatalogItemDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={loadItems}
        initialData={editingItem}
      />

      <AttachmentPreviewModal
        attachments={previewItemId ? attachmentsByItem[previewItemId] ?? [] : []}
        startIndex={previewIndex}
        isOpen={!!previewItemId}
        onClose={() => setPreviewItemId(null)}
        onDelete={handleDeleteFromPreview}
      />
    </section>
  );
}
