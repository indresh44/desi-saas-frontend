"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  fetchBusinessSettings,
  updateBusinessSettings,
  uploadBusinessLogo,
} from "@/lib/api/business-settings";
import { useAuth } from "@/lib/auth/auth-context";
import { BusinessSettings, UpdateBusinessSettingsInput } from "@/lib/types/business-settings";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

const profileSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  pinCode: z.string().max(10, "PIN must be at most 10 characters").optional().or(z.literal("")),
  gstNumber: z.string()
    .refine((v) => !v || (v.length === 15 && /^[A-Z0-9]+$/.test(v)), {
      message: "GSTIN must be 15 alphanumeric characters",
    })
    .optional()
    .or(z.literal("")),
  gstMode: z.enum(["inclusive", "exclusive"]).optional().or(z.literal("")),
});

const invoiceSchema = z.object({
  invoicePrefix: z.string().max(10, "Invoice prefix must be at most 10 characters").optional().or(z.literal("")),
  defaultDueDays: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce.number().min(0, "Due days cannot be negative").max(365, "Due days cannot exceed 365").optional(),
  ),
  bankName: z.string().optional().or(z.literal("")),
  bankAccountNumber: z.string().optional().or(z.literal("")),
  bankIfsc: z.string().optional().or(z.literal("")),
  upiId: z.string().optional().or(z.literal("")),
  invoiceNotes: z.string().max(500, "Notes must be at most 500 characters").optional().or(z.literal("")),
  invoiceFooter: z.string().max(500, "Footer must be at most 500 characters").optional().or(z.literal("")),
});

type ProfileForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  gstNumber: string;
  gstMode: "inclusive" | "exclusive" | "";
};

type InvoiceForm = {
  invoicePrefix: string;
  defaultDueDays: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  upiId: string;
  invoiceNotes: string;
  invoiceFooter: string;
};

function toProfileForm(settings: BusinessSettings): ProfileForm {
  return {
    name: settings.name ?? "",
    phone: settings.phone ?? "",
    email: settings.email ?? "",
    address: settings.address ?? "",
    city: settings.city ?? "",
    state: settings.state ?? "",
    pinCode: settings.pinCode ?? "",
    gstNumber: settings.gstNumber ?? "",
    gstMode: settings.gstMode === "inclusive" || settings.gstMode === "exclusive" ? settings.gstMode : "",
  };
}

function toInvoiceForm(settings: BusinessSettings): InvoiceForm {
  return {
    invoicePrefix: settings.invoicePrefix ?? "",
    defaultDueDays: settings.defaultDueDays === null ? "" : String(settings.defaultDueDays),
    bankName: settings.bankName ?? "",
    bankAccountNumber: settings.bankAccountNumber ?? "",
    bankIfsc: settings.bankIfsc ?? "",
    upiId: settings.upiId ?? "",
    invoiceNotes: settings.invoiceNotes ?? "",
    invoiceFooter: settings.invoiceFooter ?? "",
  };
}

function padInvoiceNumber(sequence: number): string {
  return String(sequence).padStart(3, "0");
}

export default function SettingsPageClient() {
  const { updateBusiness } = useAuth();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm | null>(null);
  const [invoiceForm, setInvoiceForm] = useState<InvoiceForm | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [invoiceErrors, setInvoiceErrors] = useState<Record<string, string>>({});
  const [profileGeneralError, setProfileGeneralError] = useState<string | null>(null);
  const [invoiceGeneralError, setInvoiceGeneralError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadingError(null);

      try {
        const nextSettings = await fetchBusinessSettings();
        setSettings(nextSettings);
        setProfileForm(toProfileForm(nextSettings));
        setInvoiceForm(toInvoiceForm(nextSettings));
      } catch (error) {
        setLoadingError(error instanceof Error ? error.message : "Unable to load business settings.");
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const nextInvoicePreview = useMemo(() => {
    if (!settings || !invoiceForm) return "";
    const prefix = (invoiceForm.invoicePrefix || "INV").trim().toUpperCase();
    return `${prefix}-${padInvoiceNumber(settings.invoiceSequence + 1)}`;
  }, [invoiceForm, settings]);

  const updateContextBusiness = (nextSettings: BusinessSettings) => {
    updateBusiness({
      id: nextSettings.id,
      name: nextSettings.name,
    });
  };

  const handleProfileChange = <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => {
    setProfileForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleInvoiceChange = <K extends keyof InvoiceForm>(field: K, value: InvoiceForm[K]) => {
    setInvoiceForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSaveProfile = async () => {
    if (!settings || !profileForm) return;

    setProfileGeneralError(null);
    setProfileErrors({});
    setSuccessMessage(null);

    const parsed = profileSchema.safeParse(profileForm);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setProfileErrors(nextErrors);
      return;
    }

    const payload: UpdateBusinessSettingsInput = {};

    if (profileForm.name !== (settings.name ?? "")) payload.name = profileForm.name.trim();
    if (profileForm.phone !== (settings.phone ?? "")) payload.phone = profileForm.phone.trim();
    if (profileForm.email !== (settings.email ?? "")) payload.email = profileForm.email.trim();
    if (profileForm.address !== (settings.address ?? "")) payload.address = profileForm.address.trim();
    if (profileForm.city !== (settings.city ?? "")) payload.city = profileForm.city.trim();
    if (profileForm.state !== (settings.state ?? "")) payload.state = profileForm.state.trim();
    if (profileForm.pinCode !== (settings.pinCode ?? "")) payload.pin_code = profileForm.pinCode.trim();
    if (profileForm.gstNumber !== (settings.gstNumber ?? "")) {
      payload.gst_number = profileForm.gstNumber.trim().toUpperCase();
    }
    if (profileForm.gstMode !== (settings.gstMode ?? "")) payload.gst_mode = profileForm.gstMode || "exclusive";

    if (Object.keys(payload).length === 0) {
      setSuccessMessage("No profile changes to save.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const nextSettings = await updateBusinessSettings(payload);
      setSettings(nextSettings);
      setProfileForm(toProfileForm(nextSettings));
      setInvoiceForm(toInvoiceForm(nextSettings));
      updateContextBusiness(nextSettings);
      setSuccessMessage("Settings saved");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save profile settings.";
      if (/gst/i.test(message)) {
        setProfileErrors({ gstNumber: message });
      } else {
        setProfileGeneralError(message);
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveInvoice = async () => {
    if (!settings || !invoiceForm) return;

    setInvoiceGeneralError(null);
    setInvoiceErrors({});
    setSuccessMessage(null);

    const parsed = invoiceSchema.safeParse(invoiceForm);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setInvoiceErrors(nextErrors);
      return;
    }

    const payload: UpdateBusinessSettingsInput = {};

    if (invoiceForm.invoicePrefix !== (settings.invoicePrefix ?? "")) {
      payload.invoice_prefix = invoiceForm.invoicePrefix.trim().toUpperCase();
    }

    const currentDueDays = settings.defaultDueDays === null ? "" : String(settings.defaultDueDays);
    if (invoiceForm.defaultDueDays !== currentDueDays) {
      payload.default_due_days = invoiceForm.defaultDueDays === ""
        ? 0
        : Number(invoiceForm.defaultDueDays);
    }

    if (invoiceForm.bankName !== (settings.bankName ?? "")) payload.bank_name = invoiceForm.bankName.trim();
    if (invoiceForm.bankAccountNumber !== (settings.bankAccountNumber ?? "")) {
      payload.bank_account_number = invoiceForm.bankAccountNumber.trim();
    }
    if (invoiceForm.bankIfsc !== (settings.bankIfsc ?? "")) payload.bank_ifsc = invoiceForm.bankIfsc.trim().toUpperCase();
    if (invoiceForm.upiId !== (settings.upiId ?? "")) payload.upi_id = invoiceForm.upiId.trim();
    if (invoiceForm.invoiceNotes !== (settings.invoiceNotes ?? "")) payload.invoice_notes = invoiceForm.invoiceNotes.trim();
    if (invoiceForm.invoiceFooter !== (settings.invoiceFooter ?? "")) payload.invoice_footer = invoiceForm.invoiceFooter.trim();

    if (Object.keys(payload).length === 0) {
      setSuccessMessage("No invoice changes to save.");
      return;
    }

    setIsSavingInvoice(true);
    try {
      const nextSettings = await updateBusinessSettings(payload);
      setSettings(nextSettings);
      setProfileForm(toProfileForm(nextSettings));
      setInvoiceForm(toInvoiceForm(nextSettings));
      updateContextBusiness(nextSettings);
      setSuccessMessage("Settings saved");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save invoice settings.";
      setInvoiceGeneralError(message);
    } finally {
      setIsSavingInvoice(false);
    }
  };

  const handleUploadLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setLogoError("Logo must be a JPG or PNG image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Logo must be smaller than 2MB.");
      return;
    }

    setLogoError(null);
    setSuccessMessage(null);
    setIsUploadingLogo(true);

    try {
      const nextSettings = await uploadBusinessLogo(file);
      setSettings(nextSettings);
      setProfileForm(toProfileForm(nextSettings));
      setInvoiceForm(toInvoiceForm(nextSettings));
      updateContextBusiness(nextSettings);
      setSuccessMessage("Settings saved");
    } catch (error) {
      setLogoError(error instanceof Error ? error.message : "Unable to upload logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!settings?.logoUrl) return;

    setLogoError(null);
    setSuccessMessage(null);
    setIsUploadingLogo(true);

    try {
      const nextSettings = await updateBusinessSettings({ logo_url: null });
      setSettings(nextSettings);
      setProfileForm(toProfileForm(nextSettings));
      setInvoiceForm(toInvoiceForm(nextSettings));
      updateContextBusiness(nextSettings);
      setSuccessMessage("Settings saved");
    } catch (error) {
      setLogoError(error instanceof Error ? error.message : "Unable to remove logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="h-8 w-56 animate-pulse rounded bg-zinc-200" />
        <div className="h-36 animate-pulse rounded-xl bg-zinc-200" />
        <div className="h-40 animate-pulse rounded-xl bg-zinc-200" />
      </section>
    );
  }

  if (loadingError || !profileForm || !invoiceForm || !settings) {
    return (
      <section>
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadingError || "Unable to load settings."}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Settings</h1>
        <p className="text-sm text-zinc-500">Manage your business profile and invoice preferences.</p>
      </div>

      {successMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-zinc-900">Business Profile</h2>
        </div>

        <div className="mb-5 flex flex-wrap items-start gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <div className="h-16 w-16 overflow-hidden rounded-lg border border-zinc-200 bg-white">
            {settings.logoUrl ? (
              <Image src={settings.logoUrl} alt="Business logo" width={64} height={64} className="h-16 w-16 object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-500">
                No logo
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleUploadLogoClick} disabled={isUploadingLogo}>
              {isUploadingLogo ? "Uploading..." : "Upload"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleRemoveLogo()}
              disabled={isUploadingLogo || !settings.logoUrl}
            >
              Remove
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(event) => void handleLogoSelected(event)}
            />
            <p className="text-xs text-zinc-500">JPG/PNG up to 2MB.</p>
          </div>
        </div>

        {logoError ? <p className="mb-3 text-xs text-red-600">{logoError}</p> : null}

        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Business Name"
            required
            error={profileErrors.name}
            input={
              <input
                value={profileForm.name}
                onChange={(event) => handleProfileChange("name", event.target.value)}
                className={inputClassName}
              />
            }
          />

          <Field
            label="Phone"
            error={profileErrors.phone}
            input={
              <input
                value={profileForm.phone}
                onChange={(event) => handleProfileChange("phone", event.target.value)}
                className={inputClassName}
              />
            }
          />

          <div className="md:col-span-2">
            <Field
              label="Email"
              error={profileErrors.email}
              input={
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(event) => handleProfileChange("email", event.target.value)}
                  className={inputClassName}
                />
              }
            />
          </div>

          <div className="md:col-span-2">
            <Field
              label="Address"
              error={profileErrors.address}
              input={
                <input
                  value={profileForm.address}
                  onChange={(event) => handleProfileChange("address", event.target.value)}
                  className={inputClassName}
                />
              }
            />
          </div>

          <Field
            label="City"
            error={profileErrors.city}
            input={
              <input
                value={profileForm.city}
                onChange={(event) => handleProfileChange("city", event.target.value)}
                className={inputClassName}
              />
            }
          />

          <Field
            label="State"
            error={profileErrors.state}
            input={
              <select
                value={profileForm.state}
                onChange={(event) => handleProfileChange("state", event.target.value)}
                className={inputClassName}
              >
                <option value="">Select state / UT</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            }
          />

          <Field
            label="PIN Code"
            error={profileErrors.pinCode}
            input={
              <input
                value={profileForm.pinCode}
                onChange={(event) => handleProfileChange("pinCode", event.target.value)}
                className={inputClassName}
              />
            }
          />
        </div>

        <div className="mt-5 rounded-lg border border-zinc-200 p-3">
          <h3 className="mb-3 text-sm font-semibold text-zinc-800">GST Details</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="GSTIN"
              error={profileErrors.gstNumber}
              input={
                <input
                  value={profileForm.gstNumber}
                  onChange={(event) => handleProfileChange("gstNumber", event.target.value.toUpperCase())}
                  className={inputClassName}
                />
              }
            />

            <div>
              <label className="text-sm font-medium text-zinc-700">GST Mode</label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="radio"
                    name="gstMode"
                    value="exclusive"
                    checked={profileForm.gstMode === "exclusive"}
                    onChange={(event) => handleProfileChange("gstMode", event.target.value as "exclusive")}
                  />
                  Exclusive
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="radio"
                    name="gstMode"
                    value="inclusive"
                    checked={profileForm.gstMode === "inclusive"}
                    onChange={(event) => handleProfileChange("gstMode", event.target.value as "inclusive")}
                  />
                  Inclusive
                </label>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Exclusive: GST is added on top of item rates. Inclusive: item rates already include GST.
              </p>
            </div>
          </div>
        </div>

        {profileGeneralError ? (
          <p className="mt-3 text-sm text-red-600">{profileGeneralError}</p>
        ) : null}

        <div className="mt-4 flex justify-end">
          <Button type="button" className="w-full sm:w-auto" onClick={() => void handleSaveProfile()} disabled={isSavingProfile}>
            {isSavingProfile ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 md:p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-zinc-900">Invoice Settings</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Invoice Prefix"
            error={invoiceErrors.invoicePrefix}
            input={
              <input
                value={invoiceForm.invoicePrefix}
                onChange={(event) => handleInvoiceChange("invoicePrefix", event.target.value.toUpperCase())}
                className={inputClassName}
                placeholder="INV"
              />
            }
          />

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Next invoice</p>
            <p className="mt-1 font-medium text-zinc-900">{nextInvoicePreview}</p>
          </div>

          <Field
            label="Default Due Days"
            error={invoiceErrors.defaultDueDays}
            input={
              <input
                type="number"
                min={0}
                max={365}
                value={invoiceForm.defaultDueDays}
                onChange={(event) => handleInvoiceChange("defaultDueDays", event.target.value)}
                className={inputClassName}
              />
            }
          />
        </div>

        <div className="mt-5 rounded-lg border border-zinc-200 p-3">
          <h3 className="mb-3 text-sm font-semibold text-zinc-800">Bank / Payment Details</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="Bank Name"
              error={invoiceErrors.bankName}
              input={
                <input
                  value={invoiceForm.bankName}
                  onChange={(event) => handleInvoiceChange("bankName", event.target.value)}
                  className={inputClassName}
                />
              }
            />

            <Field
              label="Account Number"
              error={invoiceErrors.bankAccountNumber}
              input={
                <input
                  value={invoiceForm.bankAccountNumber}
                  onChange={(event) => handleInvoiceChange("bankAccountNumber", event.target.value)}
                  className={inputClassName}
                />
              }
            />

            <Field
              label="IFSC"
              error={invoiceErrors.bankIfsc}
              input={
                <input
                  value={invoiceForm.bankIfsc}
                  onChange={(event) => handleInvoiceChange("bankIfsc", event.target.value.toUpperCase())}
                  className={inputClassName}
                />
              }
            />

            <Field
              label="UPI ID"
              error={invoiceErrors.upiId}
              input={
                <input
                  value={invoiceForm.upiId}
                  onChange={(event) => handleInvoiceChange("upiId", event.target.value)}
                  className={inputClassName}
                />
              }
            />
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-zinc-200 p-3">
          <h3 className="mb-3 text-sm font-semibold text-zinc-800">Default Invoice Text</h3>
          <div className="grid gap-3 md:grid-cols-1">
            <Field
              label="Notes"
              error={invoiceErrors.invoiceNotes}
              input={
                <textarea
                  rows={3}
                  value={invoiceForm.invoiceNotes}
                  onChange={(event) => handleInvoiceChange("invoiceNotes", event.target.value)}
                  className={`${inputClassName} resize-y`}
                />
              }
            />

            <Field
              label="Footer"
              error={invoiceErrors.invoiceFooter}
              input={
                <textarea
                  rows={3}
                  value={invoiceForm.invoiceFooter}
                  onChange={(event) => handleInvoiceChange("invoiceFooter", event.target.value)}
                  className={`${inputClassName} resize-y`}
                />
              }
            />
          </div>
        </div>

        {invoiceGeneralError ? (
          <p className="mt-3 text-sm text-red-600">{invoiceGeneralError}</p>
        ) : null}

        <div className="mt-4 flex justify-end">
          <Button type="button" className="w-full sm:w-auto" onClick={() => void handleSaveInvoice()} disabled={isSavingInvoice}>
            {isSavingInvoice ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </section>
  );
}

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-500 disabled:cursor-not-allowed disabled:bg-zinc-100";

type FieldProps = {
  label: string;
  input: React.ReactNode;
  error?: string;
  required?: boolean;
};

function Field({ label, input, error, required = false }: FieldProps) {
  return (
    <label className="block text-sm text-zinc-700">
      <span className="font-medium">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      {input}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  );
}
