/**
 * Share an invoice as a text message containing the branded URL. WhatsApp /
 * other targets unfurl the URL into a rich preview card (title, business,
 * amount) using the OG meta tags on the public invoice page. Sending the PDF
 * file directly was tried earlier but WhatsApp strips the caption when files
 * are attached, so the link-preview path gives a better message.
 */

export function canNativeShare(): boolean {
  if (typeof navigator === "undefined") return false;
  return typeof navigator.share === "function";
}

/**
 * Returns true while the invoice content can still change (draft / sent
 * estimates). Once approved, content is locked, so the share URL can be
 * canonical without a cache-busting query param.
 */
function isEditableStatus(status?: string): boolean {
  return status === "draft" || status === "sent";
}

/**
 * Convert any timestamp-ish value to a unix epoch (seconds). Used for
 * the `?v=` query param that busts WhatsApp / social-media OG-preview
 * caches when the invoice is edited.
 */
function toUnixSeconds(value?: string | number | Date | null): number | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.floor(value) : null;
  }
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? Math.floor(ts / 1000) : null;
}

/**
 * Build the branded public invoice URL.
 *
 * When the invoice is still editable (draft / sent), appends a
 * `?v={updated_at_unix}` query param so WhatsApp / Telegram / Slack
 * treat the URL as new on every edit — busting their OG-preview caches
 * and fetching fresh metadata. Once approved, the URL goes back to
 * canonical (no `?v=`) — the invoice is content-locked, the
 * legally-binding tax document, and a clean URL is more shareable /
 * bookmarkable.
 *
 * The public invoice page server-renders metadata from current data and
 * ignores any extra query params for routing, so the `?v=` is purely a
 * cache-bust hint.
 */
export function buildBrandedInvoiceUrl(
  invoiceId: string,
  invoiceNumber: string,
  status?: string,
  updatedAt?: string | number | Date | null,
): string {
  const base = `https://sellnsettle.com/invoices/${invoiceId}/${invoiceNumber}.pdf`;
  if (!isEditableStatus(status)) return base;

  const v = toUnixSeconds(updatedAt);
  return v != null ? `${base}?v=${v}` : base;
}

export async function shareInvoicePdf(
  invoiceId: string,
  invoiceNumber: string,
  status?: string,
  businessName?: string,
  totalAmount?: number,
  updatedAt?: string | number | Date | null,
): Promise<"shared" | "cancelled" | "error"> {
  try {
    const isEstimate = isEditableStatus(status);
    const docLabel = isEstimate ? "Estimate" : "Invoice";
    const brandedUrl = buildBrandedInvoiceUrl(
      invoiceId,
      invoiceNumber,
      status,
      updatedAt,
    );

    const amountStr = totalAmount != null
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(totalAmount)
      : null;

    const parts = [`${docLabel} ${invoiceNumber}`];
    if (businessName) parts.push(`from ${businessName}`);
    if (amountStr) parts.push(`— Total ${amountStr}`);
    const shareText = `${parts.join(" ")}.\nView & download: ${brandedUrl}`;

    if (canNativeShare()) {
      try {
        await navigator.share({
          title: `${docLabel} ${invoiceNumber}`,
          text: shareText,
        });
        return "shared";
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") {
          return "cancelled";
        }
        console.warn("[Share] Native share failed, falling back to wa.me:", err);
      }
    }

    const waMessage = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${waMessage}`, "_blank", "noopener,noreferrer");
    return "shared";
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name: string }).name === "AbortError"
    ) {
      return "cancelled";
    }

    console.error("[Share] Error:", error);
    return "error";
  }
}

/**
 * Share just a link (no file). Falls back to copying the URL to clipboard.
 */
export async function shareInvoiceLink(
  pdfUrl: string,
  invoiceNumber: string,
  customerName: string,
): Promise<"shared" | "copied" | "cancelled"> {
  if (canNativeShare()) {
    try {
      await navigator.share({
        title: `Invoice ${invoiceNumber}`,
        text: `Invoice ${invoiceNumber} for ${customerName}`,
        url: pdfUrl,
      });
      return "shared";
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        (error as { name: string }).name === "AbortError"
      ) {
        return "cancelled";
      }
    }
  }

  // Fallback: copy URL to clipboard
  try {
    await navigator.clipboard.writeText(pdfUrl);
    return "copied";
  } catch {
    return "cancelled";
  }
}

