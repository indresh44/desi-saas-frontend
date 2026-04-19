"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { createTemplateFromInvoice } from "@/lib/api/invoice-templates";

type Props = {
  open: boolean;
  invoiceId: string;
  invoiceNumber?: string;
  defaultName?: string;
  onClose: () => void;
  onSaved: (templateId: string, templateName: string) => void;
};

export function SaveAsTemplateDialog({
  open,
  invoiceId,
  invoiceNumber,
  defaultName,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(defaultName ?? "");
      setSubmitting(false);
      setError(null);
    }
  }, [open, defaultName]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a template name.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const template = await createTemplateFromInvoice(invoiceId, trimmed);
      onSaved(template.id, template.name);
      onClose();
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Unable to save template.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} ariaLabel="Save as template">
      <DialogHeader
        title={invoiceNumber ? `Save ${invoiceNumber} as template` : "Save as template"}
        onClose={onClose}
      />
      <DialogBody className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Give this template a short, memorable name. You can reuse it to create new
          invoices later.
        </p>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground" htmlFor="template-name">
            Template name
          </label>
          <input
            id="template-name"
            autoFocus
            placeholder="e.g. Modular Kitchen — Basic"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !submitting) void handleSave();
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="button" onClick={() => void handleSave()} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save template"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
