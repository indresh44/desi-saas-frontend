"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerNameInput } from "@/components/leads/customer-name-input";
import { useLookupMaps } from "@/hooks/use-lookup-maps";
import { createLead } from "@/lib/api/leads";
import {
  createCustomer,
  getCustomerByPhone,
} from "@/lib/api/customers";
import { Customer } from "@/lib/types/customer";

const leadSourceOptions: { value: string; label: string }[] = [
  { value: "referral", label: "Referral" },
  { value: "walk_in", label: "Walk-in" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "justdial", label: "JustDial" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

const createLeadSchema = z
  .object({
    customerName: z.string().trim().min(1, "Customer name is required"),
    phone: z.string().trim().min(1, "Phone is required"),
    customerEmail: z.union([z.literal(""), z.string().email("Invalid email")]),
    title: z.string().trim().min(1, "Please describe what they need"),
    source: z.string().trim().optional(),
    serviceDate: z.string().optional(),
    estimatedValue: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || /^\d+(\.\d{1,2})?$/.test(value),
        "Enter a valid amount"
      ),
    notes: z.string().trim().optional(),
  });

type CreateLeadFormValues = z.infer<typeof createLeadSchema>;

const defaultValues: CreateLeadFormValues = {
  customerName: "",
  phone: "",
  customerEmail: "",
  title: "",
  source: "",
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
  const [isMoreDetailsOpen, setIsMoreDetailsOpen] = useState(false);

  const form = useForm<CreateLeadFormValues>({
    resolver: zodResolver(createLeadSchema),
    defaultValues,
  });

  const isSubmitting = form.formState.isSubmitting;

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

  const defaultStageId = stageOptions[0]?.id ?? "";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setIsMoreDetailsOpen(false);
    setSubmitError(null);

    const timeoutId = window.setTimeout(() => {
      form.setFocus("customerName");
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [form, isOpen]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    form.reset(defaultValues);
    setSelectedCustomer(null);
    setSubmitError(null);
    setIsMoreDetailsOpen(false);
    onClose();
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.setValue("customerName", customer.name || "", { shouldValidate: true });
    form.setValue("phone", customer.phone, { shouldValidate: true });
    form.setValue("customerEmail", customer.email || "");
    form.clearErrors(["customerName", "phone", "customerEmail"]);
  };

  const handleClearSelectedCustomer = () => {
    setSelectedCustomer(null);
  };

  const handleCustomerNameChange = (nextCustomerName: string) => {
    if (selectedCustomer && nextCustomerName !== selectedCustomer.name) {
      setSelectedCustomer(null);
    }

    form.setValue("customerName", nextCustomerName, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handlePhoneChange = (nextPhone: string) => {
    if (selectedCustomer && nextPhone !== selectedCustomer.phone) {
      setSelectedCustomer(null);
    }

    form.setValue("phone", nextPhone, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleCustomerEmailChange = (nextEmail: string) => {
    if (selectedCustomer && nextEmail !== (selectedCustomer.email || "")) {
      setSelectedCustomer(null);
    }

    form.setValue("customerEmail", nextEmail, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      if (!defaultStageId) {
        setSubmitError("No pipeline stage is available yet. Please add a stage first.");
        return;
      }

      const phone = values.phone.trim();
      let customerId = selectedCustomer?.id || "";

      if (!customerId) {
        const byPhone = await getCustomerByPhone(phone);

        if (byPhone.found && byPhone.customer) {
          customerId = byPhone.customer.id;
          setSelectedCustomer(byPhone.customer);
          form.setValue("customerName", byPhone.customer.name || "");
          form.setValue("customerEmail", byPhone.customer.email || "");
          form.setValue("phone", byPhone.customer.phone);
        } else {
          const createdCustomer = await createCustomer(
            {
              name: values.customerName.trim(),
              phone,
              email: values.customerEmail?.trim() || null,
            }
          );
          customerId = createdCustomer.id;
        }
      }

      await createLead(
        {
          customerId,
          stageId: defaultStageId,
          title: values.title.trim(),
          source: values.source?.trim() || "",
          serviceDate: values.serviceDate?.trim() || null,
          estimatedValue: values.estimatedValue.trim() || null,
          assignedTo: null,
          notes: values.notes?.trim() || "",
          businessId: "",
        }
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
        aria-label="Close new enquiry dialog"
        className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-40 flex items-end justify-center md:items-center md:p-4">
        <div className="flex h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-2xl">
          <div className="flex items-start justify-between border-b border-border px-4 py-4 md:px-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">New Enquiry</h2>
              <p className="text-sm text-muted-foreground">
                Add the essentials now. Fill the rest only if needed.
              </p>
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
              <div className="space-y-4">
                <div>
                  <CustomerNameInput
                    value={form.watch("customerName")}
                    selectedCustomer={selectedCustomer}
                    disabled={isSubmitting}
                    autoFocus
                    onValueChange={handleCustomerNameChange}
                    onSelectCustomer={handleSelectCustomer}
                    onClearSelection={handleClearSelectedCustomer}
                  />
                  {form.formState.errors.customerName?.message ? (
                    <p className="mt-1 text-xs text-red-600">
                      {form.formState.errors.customerName.message}
                    </p>
                  ) : null}
                </div>

                <Field
                  label="Customer Phone"
                  error={form.formState.errors.phone?.message}
                  input={
                    <input
                      type="tel"
                      value={form.watch("phone")}
                      onChange={(event) => handlePhoneChange(event.target.value)}
                      className={inputClassName}
                      placeholder="e.g., 9876543210"
                      autoComplete="tel"
                    />
                  }
                />

                <Field
                  label="What do they need?"
                  error={form.formState.errors.title?.message}
                  input={
                    <input
                      {...form.register("title")}
                      className={inputClassName}
                      placeholder="e.g., Modular kitchen for new flat"
                    />
                  }
                />

                <Field
                  label="Estimated Value ₹"
                  error={form.formState.errors.estimatedValue?.message}
                  input={
                    <input
                      type="number"
                      inputMode="numeric"
                      step="0.01"
                      {...form.register("estimatedValue")}
                      className={inputClassName}
                      placeholder="e.g., 350000"
                    />
                  }
                />

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-muted px-3 py-3 text-left text-sm font-medium text-foreground transition hover:border-border hover:bg-muted"
                  onClick={() => setIsMoreDetailsOpen((current) => !current)}
                >
                  <span>More details</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isMoreDetailsOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                <div
                  className={`grid overflow-hidden transition-all duration-200 ease-out ${
                    isMoreDetailsOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="grid gap-4 rounded-xl border border-border bg-muted/60 p-3 md:grid-cols-2">
                      <Field
                        label="Source"
                        error={form.formState.errors.source?.message}
                        input={
                          <select {...form.register("source")} className={inputClassName}>
                            <option value="">Select source</option>
                            {leadSourceOptions.map((source) => (
                              <option key={source.value} value={source.value}>
                                {source.label}
                              </option>
                            ))}
                          </select>
                        }
                      />

                      <Field
                        label="Customer Email"
                        error={form.formState.errors.customerEmail?.message}
                        input={
                          <input
                            type="email"
                            value={form.watch("customerEmail")}
                            onChange={(event) => handleCustomerEmailChange(event.target.value)}
                            className={inputClassName}
                            placeholder="name@example.com"
                            autoComplete="email"
                          />
                        }
                      />

                      <Field
                        label="Service / Delivery Date"
                        error={form.formState.errors.serviceDate?.message}
                        input={
                          <input
                            type="date"
                            {...form.register("serviceDate")}
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
                              placeholder="Any initial notes..."
                            />
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {submitError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {submitError}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border bg-card px-4 py-3 md:px-5">
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoadingStages || !defaultStageId}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

const inputClassName =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted";

type FieldProps = {
  label: string;
  input: React.ReactNode;
  error?: string;
};

function Field({ label, input, error }: FieldProps) {
  return (
    <label className="block text-sm text-foreground">
      <span className="font-medium">{label}</span>
      {input}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  );
}