"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCatalogItem, updateCatalogItem } from "@/lib/api/catalog-items";
import {
  CatalogItem,
  CreateCatalogItemInput,
  UpdateCatalogItemInput,
} from "@/lib/types/catalog-item";

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
    defaultRate: z
      .number({ invalid_type_error: "Rate must be a number" })
      .min(0, "Rate must be positive"),
    gstPercent: z.number().min(0).max(28),
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

type FormData = z.infer<typeof schema>;

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
  const isEditMode = !!initialData;

  const form = useForm<FormData>({
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
    }
  }, [isOpen, initialData, form]);

  const unitValue = form.watch("unit");
  const isSubmitting = form.formState.isSubmitting;

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
        };
        await createCatalogItem(payload);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || "Failed to save item");
    }
  });

  if (!isOpen) return null;

  const inputClassName =
    "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:opacity-50";

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-zinc-900/30"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white shadow-2xl overflow-y-auto max-h-[90vh]">
          <div className="flex items-start justify-between border-b border-zinc-200 px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
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
              <label className="text-sm font-medium text-zinc-700">
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
              <label className="text-sm font-medium text-zinc-700">
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
                <label className="text-sm font-medium text-zinc-700">
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
                  <label className="text-sm font-medium text-zinc-700">
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
                <label className="text-sm font-medium text-zinc-700">
                  Default Rate (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-2 text-zinc-500">₹</span>
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
                <label className="text-sm font-medium text-zinc-700">
                  GST % <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        type="number"
                        {...form.register("gstPercent", { valueAsNumber: true })}
                        className={`${inputClassName} pr-8`}
                    />
                    <span className="absolute right-3 top-2 text-zinc-500">%</span>
                </div>
                {form.formState.errors.gstPercent && (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.gstPercent.message}
                  </p>
                )}
              </div>
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
          </form>
        </div>
      </div>
    </>
  );
}
