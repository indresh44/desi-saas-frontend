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
 * Build the branded public invoice URL.
 */
export function buildBrandedInvoiceUrl(
  invoiceId: string,
  invoiceNumber: string,
): string {
  return `https://sellnsettle.com/invoices/${invoiceId}/${invoiceNumber}.pdf`;
}

export async function shareInvoicePdf(
  invoiceId: string,
  invoiceNumber: string,
  status?: string,
  businessName?: string,
  totalAmount?: number,
): Promise<"shared" | "cancelled" | "error"> {
  try {
    const isEstimate = status === "draft" || status === "sent";
    const docLabel = isEstimate ? "Estimate" : "Invoice";
    const brandedUrl = buildBrandedInvoiceUrl(invoiceId, invoiceNumber);

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

