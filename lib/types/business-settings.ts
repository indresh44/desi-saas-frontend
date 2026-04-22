export interface BusinessSettings {
  id: string;
  name: string;
  phone: string | null;
  whatsappNumber: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  logoUrl: string | null;
  gstNumber: string | null;
  gstMode: string | null;
  invoicePrefix: string | null;
  invoiceSequence: number;
  defaultDueDays: number | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  upiId: string | null;
  invoiceNotes: string | null;
  invoiceFooter: string | null;
  preferredLanguage: string;
  timezone: string;
  createdAt: string;
}

export interface BusinessSettingsApiResponse {
  id: string;
  name: string;
  phone: string | null;
  whatsapp_number: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pin_code: string | null;
  logo_url: string | null;
  gst_number: string | null;
  gst_mode: string | null;
  invoice_prefix: string | null;
  invoice_sequence: number;
  default_due_days: number | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  upi_id: string | null;
  invoice_notes: string | null;
  invoice_footer: string | null;
  preferred_language: string;
  timezone: string;
  created_at: string;
}

export interface UpdateBusinessSettingsInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  logo_url?: string | null;
  gst_number?: string;
  gst_mode?: string;
  invoice_prefix?: string;
  default_due_days?: number;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  upi_id?: string;
  invoice_notes?: string;
  invoice_footer?: string;
  preferred_language?: string;
  timezone?: string;
}

export function toBusinessSettings(raw: BusinessSettingsApiResponse): BusinessSettings {
  return {
    id: raw.id,
    name: raw.name,
    phone: raw.phone,
    whatsappNumber: raw.whatsapp_number,
    email: raw.email,
    address: raw.address,
    city: raw.city,
    state: raw.state,
    pinCode: raw.pin_code,
    logoUrl: raw.logo_url,
    gstNumber: raw.gst_number,
    gstMode: raw.gst_mode,
    invoicePrefix: raw.invoice_prefix,
    invoiceSequence: Number(raw.invoice_sequence),
    defaultDueDays: raw.default_due_days,
    bankName: raw.bank_name,
    bankAccountNumber: raw.bank_account_number,
    bankIfsc: raw.bank_ifsc,
    upiId: raw.upi_id,
    invoiceNotes: raw.invoice_notes,
    invoiceFooter: raw.invoice_footer,
    preferredLanguage: raw.preferred_language ?? "hinglish",
    timezone: raw.timezone ?? "Asia/Kolkata",
    createdAt: raw.created_at,
  };
}
