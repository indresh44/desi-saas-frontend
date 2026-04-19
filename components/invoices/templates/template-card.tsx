"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { InvoiceTemplate } from "@/lib/types/invoice-template";

function formatRupees(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

type Props = {
  template: InvoiceTemplate;
  onUse: (template: InvoiceTemplate) => void;
  onDuplicate: (template: InvoiceTemplate) => void;
  onDelete: (template: InvoiceTemplate) => void;
};

export function TemplateCard({ template, onUse, onDuplicate, onDelete }: Props) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const itemsCount = template.itemsCount ?? template.items?.length ?? 0;

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-primary">{template.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {itemsCount} {itemsCount === 1 ? "item" : "items"} · {formatRupees(template.totalAmount)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Created {formatDate(template.createdAt)}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Template actions"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => router.push(`/invoices/templates/${template.id}`)}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDuplicate(template)}>
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => setConfirmDelete(true)}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={() => onUse(template)}>
          Use
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(`/invoices/templates/${template.id}`)}
        >
          Edit
        </Button>
      </div>

      {confirmDelete ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm">
          <p className="text-red-700">Delete this template? This cannot be undone.</p>
          <div className="mt-2 flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => {
                setConfirmDelete(false);
                onDelete(template);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
