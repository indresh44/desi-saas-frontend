"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateInvoiceModal } from "@/components/leads/create-invoice-modal";
import { LeadPickerDialog } from "@/components/invoices/templates/lead-picker-dialog";
import {
  deleteTemplate as apiDeleteTemplate,
  duplicateTemplate as apiDuplicateTemplate,
  fetchTemplate,
  fetchTemplates,
} from "@/lib/api/invoice-templates";
import { renderDeliverable } from "@/lib/utils/format";
import type {
  InvoiceTemplate,
  InvoiceTemplateItem,
} from "@/lib/types/invoice-template";

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
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TemplatesTab() {
  const router = useRouter();
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // expand state
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [rowLoading, setRowLoading] = useState<Record<string, boolean>>({});
  const [itemsByTemplate, setItemsByTemplate] = useState<
    Record<string, InvoiceTemplateItem[]>
  >({});
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // use-template flow
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<InvoiceTemplate | null>(null);
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null);

  // delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Unable to load templates.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const toggleExpanded = async (templateId: string) => {
    const next = !expandedIds[templateId];
    setExpandedIds((prev) => ({ ...prev, [templateId]: next }));
    setExpandedItemId(null);
    if (next && !itemsByTemplate[templateId]) {
      setRowLoading((prev) => ({ ...prev, [templateId]: true }));
      try {
        const full = await fetchTemplate(templateId);
        setItemsByTemplate((prev) => ({
          ...prev,
          [templateId]: full.items ?? [],
        }));
      } catch (err: unknown) {
        const msg =
          typeof err === "object" && err && "message" in err
            ? String((err as { message: unknown }).message)
            : "Unable to load template details.";
        setError(msg);
      } finally {
        setRowLoading((prev) => ({ ...prev, [templateId]: false }));
      }
    }
  };

  const handleUse = (template: InvoiceTemplate) => {
    setActiveTemplate(template);
    setPickerOpen(true);
  };

  const handleLeadPicked = (leadId: string) => {
    setPendingLeadId(leadId);
    setPickerOpen(false);
  };

  const handleDuplicate = async (template: InvoiceTemplate) => {
    try {
      await apiDuplicateTemplate(template.id);
      await loadTemplates();
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Unable to duplicate template.";
      setError(msg);
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      await apiDeleteTemplate(templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      setConfirmDeleteId(null);
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Unable to delete template.";
      setError(msg);
    }
  };

  const handleInvoiceCreated = () => {
    setPendingLeadId(null);
    setActiveTemplate(null);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Templates</h2>
          <p className="text-sm text-muted-foreground">
            Reusable invoice line items. Tap Use to create a new invoice from a template.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => router.push("/invoices/templates/new")}
        >
          <Plus className="h-3.5 w-3.5" />
          New template
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border bg-muted p-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No templates yet. Save an invoice as a template to see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => {
            const isExpanded = expandedIds[template.id] ?? false;
            const isLoading = rowLoading[template.id] ?? false;
            const lineItems = itemsByTemplate[template.id] ?? [];
            const itemsCount = template.itemsCount ?? lineItems.length ?? 0;
            const isConfirmingDelete = confirmDeleteId === template.id;

            return (
              <article
                key={template.id}
                className="overflow-hidden rounded-xl border bg-card"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => void toggleExpanded(template.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      void toggleExpanded(template.id);
                    }
                  }}
                  className="flex flex-wrap items-center gap-3 px-4 py-3"
                >
                  <span className="text-muted-foreground">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1 sm:min-w-48 sm:flex-none">
                    <p className="truncate font-semibold text-primary">{template.name}</p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {itemsCount} {itemsCount === 1 ? "item" : "items"}
                  </div>

                  <div className="text-sm font-medium text-primary">
                    {formatRupees(template.totalAmount)}
                  </div>

                  <div className="hidden text-sm text-muted-foreground sm:block">
                    Created {formatDate(template.createdAt)}
                  </div>

                  <div
                    className="ml-auto flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button type="button" size="sm" onClick={() => handleUse(template)}>
                      Use
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          aria-label="Template actions"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() =>
                            router.push(`/invoices/templates/${template.id}`)
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => void handleDuplicate(template)}>
                          <Copy className="h-3.5 w-3.5" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          destructive
                          onSelect={() => setConfirmDeleteId(template.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {isConfirmingDelete ? (
                  <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-red-700">
                        Delete &quot;{template.name}&quot;? This cannot be undone.
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => void handleDelete(template.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {isExpanded ? (
                  <div className="border-t px-4 py-4">
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading items...
                      </div>
                    ) : lineItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        This template has no line items.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <div className="min-w-[600px] text-sm text-foreground">
                          {/* Header row — same grid template as body rows so columns align */}
                          <div className="grid grid-cols-[24px_1fr_60px_50px_80px_55px_80px] gap-1 border-b px-1 py-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                            <div></div>
                            <div>Item</div>
                            <div>Unit</div>
                            <div>Qty</div>
                            <div>Rate</div>
                            <div>GST</div>
                            <div className="text-right">Amount</div>
                          </div>

                          {lineItems.map((item) => {
                            const isItemExpanded = expandedItemId === item.id;
                            const hasDeliverables =
                              item.deliverables && item.deliverables.length > 0;

                            return (
                              <div
                                key={item.id}
                                className="border-b border-border last:border-b-0"
                              >
                                <div
                                  role="button"
                                  tabIndex={0}
                                  className="grid cursor-pointer grid-cols-[24px_1fr_60px_50px_80px_55px_80px] items-center gap-1 px-1 py-2 transition-colors hover:bg-muted/50"
                                  onClick={() =>
                                    setExpandedItemId(isItemExpanded ? null : item.id)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      setExpandedItemId(
                                        isItemExpanded ? null : item.id
                                      );
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-center">
                                    <svg
                                      className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isItemExpanded ? "rotate-90" : ""}`}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M9 18l6-6-6-6" />
                                    </svg>
                                  </div>
                                  <div className="flex items-center gap-1.5 truncate font-medium text-primary">
                                    {item.name || item.description}
                                    {hasDeliverables ? (
                                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                                    ) : null}
                                  </div>
                                  <div className="text-muted-foreground">{item.unit}</div>
                                  <div>{item.quantity}</div>
                                  <div>{formatRupees(Number(item.unitPrice))}</div>
                                  <div className="text-muted-foreground">
                                    {item.gstPercent}%
                                  </div>
                                  <div className="text-right font-medium text-primary">
                                    {formatRupees(Number(item.amount))}
                                  </div>
                                </div>
                                {isItemExpanded ? (
                                  <div className="space-y-2 border-t border-border/50 bg-muted/30 px-4 py-3">
                                    {item.description ? (
                                      <p className="text-sm text-muted-foreground">
                                        {item.description}
                                      </p>
                                    ) : null}
                                    {hasDeliverables ? (
                                      <div>
                                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                                          Deliverables
                                        </p>
                                        <ul className="space-y-0.5 text-sm">
                                          {(item.deliverables ?? []).map((d, i) => (
                                            <li
                                              key={i}
                                              className="flex items-start gap-1.5"
                                            >
                                              <span className="mt-0.5 text-muted-foreground">
                                                •
                                              </span>
                                              <span className="min-w-0 flex-1 break-words">
                                                {renderDeliverable(d)}
                                              </span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">
                                        No deliverables for this item.
                                      </p>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}

                          {/* Totals footer */}
                          <div className="space-y-1 pt-3">
                            <div className="flex justify-end gap-4 pr-1 text-sm text-muted-foreground">
                              <span className="font-medium">Subtotal</span>
                              <span className="w-20 text-right font-medium">{formatRupees(template.subtotal)}</span>
                            </div>
                            <div className="flex justify-end gap-4 pr-1 text-sm text-muted-foreground">
                              <span className="font-medium">GST</span>
                              <span className="w-20 text-right font-medium">{formatRupees(template.taxTotal)}</span>
                            </div>
                            <div className="flex justify-end gap-4 pr-1 text-sm font-semibold text-foreground">
                              <span>Total</span>
                              <span className="w-20 text-right">{formatRupees(template.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <LeadPickerDialog
        open={pickerOpen}
        title={activeTemplate ? `Use "${activeTemplate.name}" for which lead?` : "Pick a lead"}
        onClose={() => {
          setPickerOpen(false);
          setActiveTemplate(null);
        }}
        onSelect={handleLeadPicked}
      />

      {pendingLeadId && activeTemplate ? (
        <CreateInvoiceModal
          leadId={pendingLeadId}
          initialTemplateId={activeTemplate.id}
          onSuccess={handleInvoiceCreated}
          onClose={() => {
            setPendingLeadId(null);
            setActiveTemplate(null);
          }}
        />
      ) : null}
    </section>
  );
}
