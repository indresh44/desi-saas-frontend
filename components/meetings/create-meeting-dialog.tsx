"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchCustomers } from "@/lib/api/customers";
import { createMeeting } from "@/lib/api/meetings";
import { fetchLeads } from "@/lib/api/leads";
import type { Customer } from "@/lib/types/customer";
import type { Lead } from "@/lib/types/lead";

const meetingSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  leadId: z.string().optional().or(z.literal("")),
  title: z.string().min(1, "Title is required"),
  scheduledAt: z.string().min(1, "Date and time are required"),
  durationMinutes: z.coerce
    .number()
    .min(5, "Minimum 5 minutes")
    .max(480, "Maximum 8 hours"),
  notes: z.string().optional().or(z.literal("")),
});

type MeetingFormValues = z.output<typeof meetingSchema>;
type MeetingFormInput = z.input<typeof meetingSchema>;

const defaultValues: MeetingFormValues = {
  customerId: "",
  leadId: "",
  title: "",
  scheduledAt: "",
  durationMinutes: 30,
  notes: "",
};

const inputClassName =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20";

function sortCustomers(customers: Customer[]) {
  return [...customers].sort((a, b) => a.name.localeCompare(b.name));
}

function sortLeads(leads: Lead[]) {
  return [...leads].sort((a, b) => a.title.localeCompare(b.title));
}

type CreateMeetingDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
};

export function CreateMeetingDialog({
  isOpen,
  onClose,
  onCreated,
}: CreateMeetingDialogProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<MeetingFormInput, undefined, MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues,
  });

  const isSubmitting = form.formState.isSubmitting;
  const selectedCustomerId = form.watch("customerId");
  const watchedDuration = form.watch("durationMinutes");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isActive = true;

    const loadCustomers = async () => {
      setIsLoadingCustomers(true);
      setLookupError(null);
      try {
        const data = await fetchCustomers();
        if (isActive) {
          setCustomers(sortCustomers(data));
        }
      } catch (error) {
        if (!isActive) {
          return;
        }
        setLookupError(
          error instanceof Error ? error.message : "Unable to load customers."
        );
      } finally {
        if (isActive) {
          setIsLoadingCustomers(false);
        }
      }
    };

    void loadCustomers();

    return () => {
      isActive = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!selectedCustomerId) {
      setLeads([]);
      form.setValue("leadId", "");
      return;
    }

    let isActive = true;

    const loadLeads = async () => {
      setIsLoadingLeads(true);
      setLookupError(null);
      try {
        const data = await fetchLeads();
        if (!isActive) {
          return;
        }
        const customerLeads = sortLeads(
          data.filter((lead) => lead.customerId === selectedCustomerId)
        );
        setLeads(customerLeads);
        const currentLeadId = form.getValues("leadId");
        if (currentLeadId && !customerLeads.some((lead) => lead.id === currentLeadId)) {
          form.setValue("leadId", "");
        }
      } catch (error) {
        if (!isActive) {
          return;
        }
        setLookupError(error instanceof Error ? error.message : "Unable to load leads.");
        setLeads([]);
      } finally {
        if (isActive) {
          setIsLoadingLeads(false);
        }
      }
    };

    void loadLeads();

    return () => {
      isActive = false;
    };
  }, [form, isOpen, selectedCustomerId]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    form.reset(defaultValues);
    setCustomers([]);
    setLeads([]);
    setLookupError(null);
    setSubmitError(null);
    onClose();
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await createMeeting({
        customer_id: values.customerId,
        lead_id: values.leadId || null,
        title: values.title,
        scheduled_at: new Date(values.scheduledAt).toISOString(),
        duration_minutes: values.durationMinutes,
        notes: values.notes || null,
      });

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
        setSubmitError("Failed to create meeting");
      }
    }
  });

  const durationOptions = useMemo(() => [15, 30, 45, 60, 90], []);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close create meeting dialog"
        className="fixed inset-0 z-30 bg-zinc-900/30"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-xl border border-zinc-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-zinc-200 px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Schedule Meeting</h2>
              <p className="text-xs text-zinc-500">
                Create a customer meeting and keep follow-ups visible.
              </p>
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 p-4">
            {lookupError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {lookupError}
              </div>
            ) : null}

            {submitError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              <Field
                label="Customer"
                error={form.formState.errors.customerId?.message}
                input={
                  <select
                    {...form.register("customerId")}
                    className={inputClassName}
                    disabled={isLoadingCustomers || isSubmitting}
                  >
                    <option value="">
                      {isLoadingCustomers ? "Loading customers..." : "Select customer"}
                    </option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                }
              />

              <Field
                label="Lead"
                error={form.formState.errors.leadId?.message}
                input={
                  <select
                    {...form.register("leadId")}
                    className={inputClassName}
                    disabled={!selectedCustomerId || isLoadingLeads || isSubmitting}
                  >
                    <option value="">
                      {!selectedCustomerId
                        ? "Select customer first"
                        : isLoadingLeads
                          ? "Loading leads..."
                          : "No lead"}
                    </option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.title}
                      </option>
                    ))}
                  </select>
                }
              />

              <Field
                label="Title"
                error={form.formState.errors.title?.message}
                input={
                  <input
                    {...form.register("title")}
                    className={inputClassName}
                    placeholder="e.g., Site visit, 1:1 Session, Follow-up call"
                    disabled={isSubmitting}
                  />
                }
              />

              <Field
                label="Date & Time"
                error={form.formState.errors.scheduledAt?.message}
                input={
                  <input
                    type="datetime-local"
                    {...form.register("scheduledAt")}
                    className={inputClassName}
                    disabled={isSubmitting}
                  />
                }
              />

              <div className="space-y-1 md:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Duration
                </span>
                <input
                  type="number"
                  {...form.register("durationMinutes")}
                  className={inputClassName}
                  min={5}
                  max={480}
                  disabled={isSubmitting}
                />
                <div className="mt-1 flex flex-wrap gap-2">
                  {durationOptions.map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => form.setValue("durationMinutes", duration, { shouldValidate: true })}
                      className={`rounded border px-2 py-1 text-xs ${
                        watchedDuration === duration
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border text-muted-foreground hover:border-primary/40"
                      }`}
                      disabled={isSubmitting}
                    >
                      {duration} min
                    </button>
                  ))}
                </div>
                {form.formState.errors.durationMinutes?.message ? (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.durationMinutes.message}
                  </p>
                ) : null}
              </div>

              <Field
                label="Notes"
                error={form.formState.errors.notes?.message}
                className="md:col-span-2"
                input={
                  <textarea
                    {...form.register("notes")}
                    className={`${inputClassName} min-h-24 resize-y`}
                    placeholder="Any notes..."
                    disabled={isSubmitting}
                  />
                }
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

type FieldProps = {
  label: string;
  input: React.ReactNode;
  error?: string;
  className?: string;
};

function Field({ label, input, error, className }: FieldProps) {
  return (
    <div className={className}>
      <label className="space-y-1">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {label}
        </span>
        {input}
      </label>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
