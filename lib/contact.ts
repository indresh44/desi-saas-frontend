// Small contact-link helpers used across the dashboard action cards and
// elsewhere. Centralised so the wa.me + 91-prefix logic doesn't drift
// between call sites (previously inlined in dashboard and leads page).

export function firstName(fullName: string | null | undefined): string {
  return (fullName || "Customer").trim().split(/\s+/)[0] || "Customer";
}

export function normalisePhone(phone: string | null | undefined): string {
  const digits = (phone || "").replace(/\D/g, "");
  // 10-digit local numbers get the India country code prepended; longer
  // strings (already-prefixed numbers) are returned as-is.
  return digits.length === 10 ? `91${digits}` : digits;
}

export function whatsappHref(
  phone: string | null | undefined,
  message: string,
): string | null {
  const normalised = normalisePhone(phone);
  if (!normalised) return null;
  return `https://wa.me/${normalised}?text=${encodeURIComponent(message)}`;
}

export function telHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  return `tel:${phone}`;
}
