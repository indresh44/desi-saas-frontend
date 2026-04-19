"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { fetchTemplates } from "@/lib/api/invoice-templates";
import type { InvoiceTemplate } from "@/lib/types/invoice-template";

function formatRupees(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  onSelect: (template: InvoiceTemplate) => void;
};

export function TemplatePickerDialog({
  open,
  title = "Start from template",
  onClose,
  onSelect,
}: Props) {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setQuery("");
    fetchTemplates()
      .then((data) => {
        if (cancelled) return;
        setTemplates(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          typeof err === "object" && err && "message" in err
            ? String((err as { message: unknown }).message)
            : "Unable to load templates.";
        setError(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter((t) => t.name.toLowerCase().includes(q));
  }, [templates, query]);

  return (
    <Dialog open={open} onClose={onClose} ariaLabel={title} className="sm:max-w-lg">
      <DialogHeader title={title} onClose={onClose} />
      <DialogBody className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            placeholder="Search templates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading templates...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {templates.length === 0
              ? "No templates yet. Save an invoice as a template first."
              : "No templates match your search."}
          </p>
        ) : (
          <div className="space-y-1">
            {filtered.map((template) => {
              const itemsCount = template.itemsCount ?? template.items?.length ?? 0;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onSelect(template)}
                  className="flex w-full items-start justify-between gap-3 rounded-lg border border-transparent px-3 py-2 text-left hover:border-border hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {template.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {itemsCount} {itemsCount === 1 ? "item" : "items"} ·{" "}
                      {formatRupees(template.totalAmount)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
