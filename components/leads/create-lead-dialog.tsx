"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerPhoneInput } from "@/components/leads/customer-phone-input";
import { useLookupMaps } from "@/hooks/use-lookup-maps";
import { createLead } from "@/lib/api/leads";
import {
  createCustomer,
  getCustomerByPhone,
} from "@/lib/api/customers";
import { DEFAULT_USER_ID } from "@/lib/constants/api";
import { Customer } from "@/lib/types/customer";

const createLeadSchema = z
  .object({
    customerMode: z.enum(["existing", "new"]),
    phone: z.string().trim().min(1, "Phone is required"),
    customerName: z.string().trim().optional(),
    customerEmail: z.union([z.literal(""), z.string().email("Invalid email")]),
    title: z.string().trim().min(1, "Title is required"),
    source: z.string().trim().optional(),
    stageId: z.string().trim().optional(),
    serviceDate: z.string().min(1, "Service date is required"),
    estimatedValue: z.string().trim().min(1, "Estimated value is required"),
    notes: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.customerMode === "new" && !values.customerName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customerName"],
        message: "Name is required for new customer",
      });
    }
  });

type CreateLeadFormValues = z.infer<typeof createLeadSchema>;

const defaultValues: CreateLeadFormValues = {
  customerMode: "new",
  phone: "",
  customerName: "",
  customerEmail: "",
  title: "",
  source: "",
  stageId: "",
  serviceDate: "",
  estimatedValue: "",
  notes: "",
};

type CreateLeadDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
};

export function CreateLeadDialog({
  isOpen,
  onClose,
  onCreated,
}: CreateLeadDialogProps) {
  const { stageMap, isLoading: isLoadingStages } = useLookupMaps();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CreateLeadFormValues>({
    resolver: zodResolver(createLeadSchema),
    defaultValues,
  });

  const isSubmitting = form.formState.isSubmitting;

  const isExistingCustomerMode = useMemo(
    () => !!selectedCustomer && form.watch("customerMode") === "existing",
    [form, selectedCustomer]
  );

  const stageOptions = useMemo(
    () =>
      Object.values(stageMap).sort((a, b) => {
        if (a.position === b.position) {
          return a.name.localeCompare(b.name);
        }
        return a.position - b.position;
      }),
    [stageMap]
  );

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    form.reset(defaultValues);
    setSelectedCustomer(null);
    setSubmitError(null);
    onClose();
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.setValue("customerMode", "existing");
    form.setValue("phone", customer.phone);
    form.setValue("customerName", customer.name || "");
    form.setValue("customerEmail", customer.email || "");
    form.clearErrors(["customerName", "phone"]);
  };

  const handleClearSelectedCustomer = () => {
    setSelectedCustomer(null);
    form.setValue("customerMode", "new");
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      const phone = values.phone.trim();
      let customerId = selectedCustomer?.id || "";

      if (!customerId) {
        const byPhone = await getCustomerByPhone(phone, DEFAULT_USER_ID);

        if (byPhone.found && byPhone.customer) {
          customerId = byPhone.customer.id;
          setSelectedCustomer(byPhone.customer);
          form.setValue("customerMode", "existing");
          form.setValue("customerName", byPhone.customer.name || "");
          form.setValue("customerEmail", byPhone.customer.email || "");
        } else {
          const createdCustomer = await createCustomer(
            {
              name: values.customerName?.trim() || "",
              phone,
              email: values.customerEmail?.trim() || null,
            },
            DEFAULT_USER_ID
          );
          customerId = createdCustomer.id;
        }
      }

      await createLead(
        {
          customerId,
          stageId: values.stageId?.trim() || "",
          title: values.title.trim(),
          source: values.source?.trim() || "",
          serviceDate: values.serviceDate,
          estimatedValue: values.estimatedValue.trim(),
          assignedTo: null,
          notes: values.notes?.trim() || "",
          businessId: "",
        },
        DEFAULT_USER_ID
      );

      await onCreated();
      handleClose();
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Unable to create lead.");
      }
    }
  });

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close create lead dialog"
        className="fixed inset-0 z-30 bg-zinc-900/30"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl rounded-xl border border-zinc-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-zinc-200 px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Create Lead</h2>
              <p className="text-xs text-zinc-500">Phone-first customer matching with duplicate prevention.</p>
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={onSubmit} className="grid gap-3 p-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <CustomerPhoneInput
                phone={form.watch("phone")}
                selectedCustomer={selectedCustomer}
                disabled={isSubmitting}
                onPhoneChange={(nextPhone) => {
                  form.setValue("phone", nextPhone, { shouldValidate: true });
                }}
                onSelectCustomer={handleSelectCustomer}
                onClearSelection={handleClearSelectedCustomer}
              />
              {form.formState.errors.phone?.message ? (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.phone.message}
                </p>
              ) : null}
              {!selectedCustomer ? (
                <p className="mt-1 text-xs text-zinc-500">
                  No selected customer means a new customer will be created after phone verification.
                </p>
              ) : null}
            </div>

            <Field
              label="Customer Name"
              error={form.formState.errors.customerName?.message}
              input={
                <input
                  {...form.register("customerName")}
                  className={inputClassName}
                  disabled={isExistingCustomerMode || isSubmitting}
                />
              }
            />

            <Field
              label="Customer Email"
              error={form.formState.errors.customerEmail?.message}
              input={
                <input
                  {...form.register("customerEmail")}
                  className={inputClassName}
                  disabled={isExistingCustomerMode || isSubmitting}
                />
              }
            />

            <Field
              label="Title"
              error={form.formState.errors.title?.message}
              input={<input {...form.register("title")} className={inputClassName} />}
            />

            <Field
              label="Source"
              error={form.formState.errors.source?.message}
              input={<input {...form.register("source")} className={inputClassName} />}
            />

            <Field
              label="Stage ID"
              error={form.formState.errors.stageId?.message}
              input={
                <select
                  {...form.register("stageId")}
                  className={inputClassName}
                  disabled={isLoadingStages || isSubmitting}
                >
                  <option value="">
                    {isLoadingStages ? "Loading stages..." : "Select stage"}
                  </option>
                  {stageOptions.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              }
            />

            <Field
              label="Service Date"
              error={form.formState.errors.serviceDate?.message}
              input={<input type="date" {...form.register("serviceDate")} className={inputClassName} />}
            />

            <Field
              label="Estimated Value"
              error={form.formState.errors.estimatedValue?.message}
              input={
                <input
                  type="number"
                  step="0.01"
                  {...form.register("estimatedValue")}
                  className={inputClassName}
                />
              }
            />

            <div className="md:col-span-2">
              <Field
                label="Notes"
                error={form.formState.errors.notes?.message}
                input={
                  <textarea
                    rows={3}
                    {...form.register("notes")}
                    className={`${inputClassName} resize-y`}
                  />
                }
              />
            </div>

            {submitError ? (
              <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}

            <div className="flex items-center gap-2 md:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Lead"}
              </Button>
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-500 disabled:cursor-not-allowed disabled:bg-zinc-100";

type FieldProps = {
  label: string;
  input: React.ReactNode;
  error?: string;
};

function Field({ label, input, error }: FieldProps) {
  return (
    <label className="block text-sm text-zinc-700">
      <span className="font-medium">{label}</span>
      {input}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  );
}