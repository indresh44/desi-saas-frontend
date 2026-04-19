"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { fetchLeads } from "@/lib/api/leads";
import type { Lead } from "@/lib/types/lead";

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  onSelect: (leadId: string) => void;
};

export function LeadPickerDialog({ open, title = "Pick a lead", onClose, onSelect }: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setQuery("");
    fetchLeads()
      .then((data) => {
        if (cancelled) return;
        setLeads(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          typeof err === "object" && err && "message" in err
            ? String((err as { message: unknown }).message)
            : "Unable to load leads.";
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
    if (!q) return leads;
    return leads.filter((lead) => {
      const title = (lead.title ?? "").toLowerCase();
      const customerName = (lead.customerName ?? "").toLowerCase();
      const customerPhone = (lead.customerPhone ?? "").toLowerCase();
      return (
        title.includes(q) ||
        customerName.includes(q) ||
        customerPhone.includes(q)
      );
    });
  }, [leads, query]);

  return (
    <Dialog open={open} onClose={onClose} ariaLabel={title} className="sm:max-w-lg">
      <DialogHeader title={title} onClose={onClose} />
      <DialogBody className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            placeholder="Search by name, title, or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading leads...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {leads.length === 0 ? "No leads yet." : "No leads match your search."}
          </p>
        ) : (
          <div className="space-y-1">
            {filtered.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => onSelect(lead.id)}
                className="flex w-full items-start justify-between gap-3 rounded-lg border border-transparent px-3 py-2 text-left hover:border-border hover:bg-muted"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{lead.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {lead.customerName ?? "No customer"}
                    {lead.customerPhone ? ` · ${lead.customerPhone}` : ""}
                  </p>
                </div>
              </button>
            ))}
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
