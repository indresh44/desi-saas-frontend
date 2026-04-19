"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateInvoiceModal } from "@/components/leads/create-invoice-modal";
import { LeadPickerDialog } from "@/components/invoices/templates/lead-picker-dialog";
import { TemplateCard } from "@/components/invoices/templates/template-card";
import {
  deleteTemplate as apiDeleteTemplate,
  duplicateTemplate as apiDuplicateTemplate,
  fetchTemplates,
} from "@/lib/api/invoice-templates";
import type { InvoiceTemplate } from "@/lib/types/invoice-template";

export function TemplatesTab() {
  const router = useRouter();
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<InvoiceTemplate | null>(null);
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null);

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

  const handleDelete = async (template: InvoiceTemplate) => {
    try {
      await apiDeleteTemplate(template.id);
      setTemplates((prev) => prev.filter((t) => t.id !== template.id));
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={handleUse}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
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
