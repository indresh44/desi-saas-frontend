"use client";

import {
  forwardRef,
  KeyboardEvent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { FileText, Package, Users } from "lucide-react";
import { fetchCustomers, searchCustomers } from "@/lib/api/customers";
import { fetchCatalogItems } from "@/lib/api/catalog-items";
import { fetchInvoices } from "@/lib/api/invoices";
import { MentionCategory, MentionEntity } from "@/lib/types/chat";

interface MentionDropdownProps {
  searchText: string;
  onSelect: (entity: MentionEntity, category: MentionCategory) => void;
  onClose: () => void;
}

export type MentionDropdownHandle = {
  handleKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
};

const CATEGORIES: { key: MentionCategory; label: string; icon: typeof Users }[] = [
  { key: "customer", label: "Customers", icon: Users },
  { key: "item", label: "Catalog Items", icon: Package },
  { key: "invoice", label: "Invoices", icon: FileText },
];

export const MentionDropdown = forwardRef<MentionDropdownHandle, MentionDropdownProps>(
  function MentionDropdown({ searchText, onSelect, onClose }, ref) {
    const [mode, setMode] = useState<"categories" | "entities">("categories");
    const [selectedCategory, setSelectedCategory] = useState<MentionCategory | null>(null);
    const [entities, setEntities] = useState<MentionEntity[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(0);

    const loadEntities = useCallback(async (category: MentionCategory, search: string) => {
      setIsLoading(true);

      try {
        let results: MentionEntity[] = [];

        if (category === "customer") {
          const customers = search.trim()
            ? await searchCustomers(search.trim())
            : await fetchCustomers();
          results = customers.map((customer) => ({
            id: customer.id,
            name: customer.name,
            subtitle: customer.phone || customer.email || undefined,
          }));
        } else if (category === "item") {
          const items = await fetchCatalogItems(search.trim() || undefined, true);
          results = items.map((item) => ({
            id: item.id,
            name: item.name,
            subtitle: item.defaultRate
              ? `Rs${item.defaultRate}/${item.customUnit || item.unit || "unit"}`
              : undefined,
          }));
        } else {
          const { items: invoices } = await fetchInvoices({ limit: 100, offset: 0 });
          const filteredInvoices = search.trim()
            ? invoices.filter((invoice) => {
                const query = search.trim().toLowerCase();
                return (
                  invoice.invoiceNumber.toLowerCase().includes(query) ||
                  (invoice.customerName ?? "").toLowerCase().includes(query)
                );
              })
            : invoices;
          const amountFormatter = new Intl.NumberFormat("en-IN");
          results = filteredInvoices.map((invoice) => ({
            id: invoice.id,
            name: invoice.invoiceNumber,
            subtitle: invoice.customerName
              ? `${invoice.customerName} · ₹${amountFormatter.format(invoice.totalAmount)} · ${invoice.status}`
              : `₹${amountFormatter.format(invoice.totalAmount)} · ${invoice.status}`,
          }));
        }

        setEntities(results);
      } catch (error) {
        console.error("Failed to load mention entities:", error);
        setEntities([]);
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      if (mode !== "entities" || !selectedCategory) {
        return;
      }

      const timeoutId = window.setTimeout(() => {
        void loadEntities(selectedCategory, searchText);
      }, 150);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }, [loadEntities, mode, searchText, selectedCategory]);

    useEffect(() => {
      setHighlightIndex(0);
    }, [entities, mode]);

    const handleCategorySelect = useCallback((category: MentionCategory) => {
      setSelectedCategory(category);
      setMode("entities");
      setEntities([]);
      void loadEntities(category, searchText);
    }, [loadEntities, searchText]);

    const handleEntitySelect = useCallback((entity: MentionEntity) => {
      if (selectedCategory) {
        onSelect(entity, selectedCategory);
      }
    }, [onSelect, selectedCategory]);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLTextAreaElement>) => {
        const items = mode === "categories" ? CATEGORIES : entities;
        if (!items.length) {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
          }
          return;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          setHighlightIndex((prev) => (prev + 1) % items.length);
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          setHighlightIndex((prev) => (prev - 1 + items.length) % items.length);
          return;
        }

        if (event.key === "Enter") {
          event.preventDefault();
          if (mode === "categories") {
            handleCategorySelect(CATEGORIES[highlightIndex].key);
          } else if (entities[highlightIndex]) {
            handleEntitySelect(entities[highlightIndex]);
          }
          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
          return;
        }

        if (event.key === "Backspace" && mode === "entities" && !searchText) {
          event.preventDefault();
          setMode("categories");
          setSelectedCategory(null);
          setEntities([]);
        }
      },
      [entities, handleCategorySelect, handleEntitySelect, highlightIndex, mode, onClose, searchText]
    );

    useImperativeHandle(
      ref,
      () => ({
        handleKeyDown,
      }),
      [handleKeyDown]
    );

    return (
      <div className="absolute bottom-full left-0 right-0 mb-1 max-h-[240px] overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg">
        {mode === "categories" && (
          <div className="p-1">
            <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
              Mention
            </p>
            {CATEGORIES.map((category, index) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => handleCategorySelect(category.key)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                    index === highlightIndex
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <Icon className="h-4 w-4 text-zinc-400" />
                  {category.label}
                </button>
              );
            })}
          </div>
        )}

        {mode === "entities" && (
          <div className="p-1">
            <button
              type="button"
              onClick={() => {
                setMode("categories");
                setSelectedCategory(null);
                setEntities([]);
              }}
              className="mb-1 flex w-full items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400 hover:text-zinc-600"
            >
              ← {CATEGORIES.find((category) => category.key === selectedCategory)?.label}
            </button>

            {isLoading && (
              <p className="px-2 py-3 text-center text-xs text-zinc-400">Searching...</p>
            )}

            {!isLoading && entities.length === 0 && (
              <p className="px-2 py-3 text-center text-xs text-zinc-400">
                {searchText ? `No results for "${searchText}"` : "No items found"}
              </p>
            )}

            {entities.map((entity, index) => (
              <button
                key={entity.id}
                type="button"
                onClick={() => handleEntitySelect(entity)}
                className={`flex w-full flex-col rounded-md px-2 py-1.5 text-left ${
                  index === highlightIndex ? "bg-zinc-100" : "hover:bg-zinc-50"
                }`}
              >
                <span className="text-sm text-zinc-800">{entity.name}</span>
                {entity.subtitle ? (
                  <span className="text-[11px] text-zinc-400">{entity.subtitle}</span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
