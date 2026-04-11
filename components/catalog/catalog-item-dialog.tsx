"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ACCEPTED_ATTACHMENT_FILE_TYPES,
  MAX_ATTACHMENT_FILE_SIZE_BYTES,
} from "@/lib/api/attachments";
import {
  createCatalogItem,
  updateCatalogItem,
  uploadCatalogAttachment,
} from "@/lib/api/catalog-items";
import {
  CatalogItem,
  CreateCatalogItemInput,
  UpdateCatalogItemInput,
} from "@/lib/types/catalog-item";
import { renderDeliverable } from "@/lib/utils/format";
import { CatalogAttachmentsManager } from "./catalog-attachments-manager";

const UNIT_OPTIONS = [
  { value: "piece", label: "Piece" },
  { value: "sq_ft", label: "Sq. Ft." },
  { value: "meter", label: "Meter" },
  { value: "kg", label: "Kg" },
  { value: "hour", label: "Hour" },
  { value: "session", label: "Session" },
  { value: "month", label: "Month" },
  { value: "trip", label: "Trip" },
  { value: "lot", label: "Lot" },
  { value: "custom", label: "Custom..." },
];

const schema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().optional(),
    unit: z.string().min(1, "Unit is required"),
    customUnit: z.string().trim().optional(),
    defaultRate: z.coerce.number().min(0, "Rate must be positive"),
    gstPercent: z.coerce.number().min(0).max(28),
  })
  .superRefine((data, ctx) => {
    if (data.unit === "custom" && !data.customUnit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom unit name is required",
        path: ["customUnit"],
      });
    }
  });

type FormData = z.output<typeof schema>;
type FormInput = z.input<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: CatalogItem | null;
}

export function CatalogItemDialog({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [newDeliverable, setNewDeliverable] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const isEditMode = !!initialData;

  const form = useForm<FormInput, undefined, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      unit: "piece",
      customUnit: "",
      defaultRate: 0,
      gstPercent: 18,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          description: initialData.description || "",
          unit: initialData.unit,
          customUnit: initialData.customUnit || "",
          defaultRate: initialData.defaultRate,
          gstPercent: initialData.gstPercent,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          unit: "piece",
          customUnit: "",
          defaultRate: 0,
          gstPercent: 18,
        });
      }
      setSubmitError(null);
      setPendingFiles([]);
      setFileError(null);
      setDeliverables(initialData?.deliverables ?? []);
      setNewDeliverable("");
      setEditingIndex(null);
      setEditValue("");
    }
  }, [isOpen, initialData, form]);

  const unitValue = form.watch("unit");
  const isSubmitting = form.formState.isSubmitting;

  const onSelectPendingFiles = (files: FileList | null) => {
    if (!files) return;

    const nextValid: File[] = [];
    for (const file of Array.from(files)) {
      if (!ACCEPTED_ATTACHMENT_FILE_TYPES.includes(file.type)) {
        setFileError(`Unsupported type for ${file.name}. Only JPG, PNG, PDF allowed.`);
        continue;
      }
      if (file.size > MAX_ATTACHMENT_FILE_SIZE_BYTES) {
        setFileError(`${file.name} is larger than 10MB.`);
        continue;
      }
      nextValid.push(file);
    }

    if (nextValid.length > 0) {
      setFileError(null);
      setPendingFiles((prev) => [...prev, ...nextValid]);
    }
  };

  const removePendingFile = (name: string) => {
    setPendingFiles((prev) => prev.filter((file) => file.name !== name));
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      if (isEditMode && initialData) {
        const updates: UpdateCatalogItemInput = {};
        if (values.name !== initialData.name) updates.name = values.name;
        if (values.description !== (initialData.description || ""))
          updates.description = values.description || null;
        if (values.unit !== initialData.unit) updates.unit = values.unit;
        // Logic for custom unit: if unit is not custom, custom_unit should be null?
        // Prompt implies custom_unit is only for unit===custom.
        if (values.unit === "custom") {
          if (values.customUnit !== (initialData.customUnit || "")) {
            updates.custom_unit = values.customUnit;
          }
        } else if (initialData.unit === "custom" && values.unit !== "custom") {
           // Should clear custom_unit if switching away from custom?
           // The backend might handle it, or we explicitly set it to null.
           // Prompt says "update payload... all optional".
           // I'll leave it unless user explicitly asked to clear it.
           // Actually, keeping data clean is good.
           updates.custom_unit = null;
        }

        if (values.defaultRate !== initialData.defaultRate)
          updates.default_rate = values.defaultRate;
        if (values.gstPercent !== initialData.gstPercent)
          updates.gst_percent = values.gstPercent;

        updates.deliverables = deliverables.length > 0 ? deliverables : null;

        if (Object.keys(updates).length > 0) {
          await updateCatalogItem(initialData.id, updates);
        }
      } else {
        const payload: CreateCatalogItemInput = {
          name: values.name,
          description: values.description || null,
          unit: values.unit,
          custom_unit: values.unit === "custom" ? values.customUnit : null,
          default_rate: values.defaultRate,
          gst_percent: values.gstPercent,
          deliverables: deliverables.length > 0 ? deliverables : null,
        };
        const createdItem = await createCatalogItem(payload);
        if (pendingFiles.length > 0) {
          for (const file of pendingFiles) {
            await uploadCatalogAttachment(createdItem.id, file);
          }
        }
      }
      onSuccess();
      onClose();
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Failed to save item");
      }
    }
  });

  if (!isOpen) return null;

  const inputClassName =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50";

  return (
    <>
      <div
        className="fixed inset-0 z-30  backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-y-auto max-h-[90vh]">
          <div className="flex items-start justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {isEditMode ? "Edit Item" : "Add Item"}
              </h2>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={onSubmit} className="p-4 space-y-4">
            {submitError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                {...form.register("name")}
                className={inputClassName}
                placeholder="Item name"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                {...form.register("description")}
                className={inputClassName}
                rows={2}
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select {...form.register("unit")} className={inputClassName}>
                  {UNIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {form.formState.errors.unit && (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.unit.message}
                  </p>
                )}
              </div>

              {unitValue === "custom" && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">
                    Custom Unit Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...form.register("customUnit")}
                    className={inputClassName}
                    placeholder="e.g. Bundle"
                  />
                  {form.formState.errors.customUnit && (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.customUnit.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Default Rate (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                    <input
                        type="number"
                        step="0.01"
                        {...form.register("defaultRate", { valueAsNumber: true })}
                        className={`${inputClassName} pl-7`}
                    />
                </div>
                {form.formState.errors.defaultRate && (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.defaultRate.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  GST % <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        type="number"
                        {...form.register("gstPercent", { valueAsNumber: true })}
                        className={`${inputClassName} pr-8`}
                    />
                    <span className="absolute right-3 top-2 text-muted-foreground">%</span>
                </div>
                {form.formState.errors.gstPercent && (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.gstPercent.message}
                  </p>
                )}
              </div>
            </div>

            {/* ── Deliverables ── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Deliverables</label>
              <p className="text-xs text-muted-foreground">
                What&apos;s included in this item. These copy to every invoice using it.
              </p>

              {deliverables.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">•</span>
                  {editingIndex === index ? (
                    <input
                      className={`flex-1 ${inputClassName}`}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (editValue.trim()) {
                            setDeliverables((prev) =>
                              prev.map((d, i) => (i === index ? editValue.trim() : d))
                            );
                          }
                          setEditingIndex(null);
                        }
                        if (e.key === "Escape") setEditingIndex(null);
                      }}
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 text-sm min-w-0 break-words">
                      {renderDeliverable(item)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingIndex(index);
                      setEditValue(item);
                    }}
                    className="shrink-0 text-muted-foreground hover:text-foreground p-1"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeliverables((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="shrink-0 text-muted-foreground hover:text-destructive p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <input
                  className={`flex-1 ${inputClassName}`}
                  placeholder="e.g. **Cinematic reel** — 3-5 min highlight"
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newDeliverable.trim()) {
                        setDeliverables((prev) => [...prev, newDeliverable.trim()]);
                        setNewDeliverable("");
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newDeliverable.trim()) {
                      setDeliverables((prev) => [...prev, newDeliverable.trim()]);
                      setNewDeliverable("");
                    }
                  }}
                  disabled={!newDeliverable.trim()}
                  className="text-sm px-3 py-1.5 border rounded-md hover:bg-accent disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Use **text** for bold in package view.
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Item"}
              </Button>
            </div>

            {isEditMode && initialData ? (
              <CatalogAttachmentsManager catalogItemId={initialData.id} />
            ) : (
              <div className="space-y-2 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Attachments</p>
                    <p className="text-xs text-muted-foreground">
                      Select multiple JPG, PNG, or PDF files. They upload after item is created.
                    </p>
                  </div>
                  <label className="inline-flex">
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(event) => onSelectPendingFiles(event.target.files)}
                      disabled={isSubmitting}
                    />
                    <span className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted">
                      <Upload className="h-3.5 w-3.5" />
                      Add files
                    </span>
                  </label>
                </div>

                {fileError ? (
                  <p className="text-xs text-red-600">{fileError}</p>
                ) : null}

                {pendingFiles.length > 0 ? (
                  <div className="space-y-1">
                    {pendingFiles.map((file) => (
                      <div
                        key={`${file.name}-${file.size}`}
                        className="flex items-center justify-between rounded-md bg-muted px-2 py-1"
                      >
                        <p className="truncate text-xs text-foreground">{file.name}</p>
                        <button
                          type="button"
                          className="text-xs text-muted-foreground hover:text-red-600"
                          onClick={() => removePendingFile(file.name)}
                          disabled={isSubmitting}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No files selected yet.</p>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
