"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Package, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchCatalogItems,
  deactivateCatalogItem,
} from "@/lib/api/catalog-items";
import { CatalogItem } from "@/lib/types/catalog-item";
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

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Catalog
          </h1>
          <p className="text-sm text-zinc-500">
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

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
          />
          Show inactive items
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {isLoading ? (
          <div className="space-y-2 p-4">
            <div className="h-10 animate-pulse rounded bg-zinc-100" />
            <div className="h-10 animate-pulse rounded bg-zinc-100" />
            <div className="h-10 animate-pulse rounded bg-zinc-100" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-zinc-600">
            {search
              ? `No items matching '${search}'`
              : "No items in your catalog yet. Add your first item to get started."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Unit</th>
                  <th className="px-4 py-3 font-medium">Rate</th>
                  <th className="px-4 py-3 font-medium">GST %</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className={
                      !item.isActive ? "bg-zinc-50 opacity-60" : undefined
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900">
                        {item.name}
                      </div>
                      {item.description && (
                        <div className="text-xs text-zinc-500">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {item.unit === "custom"
                        ? item.customUnit
                        : UNIT_LABELS[item.unit] || item.unit}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {formatRupees(item.defaultRate)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {item.gstPercent}%
                    </td>
                    <td className="px-4 py-3">
                      {item.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-zinc-400 hover:text-zinc-600"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {item.isActive && (
                          <button
                            onClick={() => handleDeactivate(item)}
                            className="text-zinc-400 hover:text-red-600"
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
        )}
      </div>

      <CatalogItemDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={loadItems}
        initialData={editingItem}
      />
    </section>
  );
}
