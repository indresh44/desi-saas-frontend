/**
 * Share an invoice via native share (PDF file) or branded URL fallback.
 */

import { API_BASE_URL } from "@/lib/constants/api";
import { getAccessToken } from "@/lib/auth/token-store";

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

/**
 * Fetch the PDF blob from our backend (server-to-server, no CORS issues).
 */
async function fetchPdfBlob(invoiceId: string): Promise<Blob | null> {
  const token = getAccessToken();
  const url = `${API_BASE_URL}/api/v1/invoices/${invoiceId}/pdf/download`;
  console.log("[Share] Fetching PDF from backend:", url);

  try {
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      console.warn("[Share] Backend PDF fetch failed:", response.status);
      return null;
    }

    const blob = await response.blob();
    console.log("[Share] PDF fetched, size:", blob.size, "bytes");
    return blob;
  } catch (err) {
    console.warn("[Share] PDF fetch error:", err);
    return null;
  }
}

export async function shareInvoicePdf(
  invoiceId: string,
  invoiceNumber: string,
  status?: string,
  businessName?: string,
  totalAmount?: number,
): Promise<"shared" | "downloaded" | "cancelled" | "error"> {
  try {
    const fileName = `${invoiceNumber}.pdf`;
    const isEstimate = status === "draft" || status === "sent";
    const docLabel = isEstimate ? "Estimate" : "Invoice";
    const brandedUrl = buildBrandedInvoiceUrl(invoiceId, invoiceNumber);

    // Build share message
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

    // Step 1: Fetch PDF blob from backend
    const blob = await fetchPdfBlob(invoiceId);

    // Step 2: Try native share with actual PDF file (mobile)
    if (canNativeShare() && blob) {
      const file = new File([blob], fileName, { type: "application/pdf" });

      // Copy caption to clipboard — WhatsApp ignores text param with files
      try {
        await navigator.clipboard.writeText(shareText);
      } catch {
        // not critical
      }

      try {
        console.log("[Share] Attempting navigator.share with PDF file");
        await navigator.share({
          title: `${docLabel} ${invoiceNumber}`,
          text: shareText,
          files: [file],
        });
        return "shared";
      } catch (fileTextErr) {
        if ((fileTextErr as { name?: string })?.name === "AbortError") {
          return "cancelled";
        }
        console.warn("[Share] File+text share failed, trying file-only:", fileTextErr);
      }

      // Some devices reject file+text but accept file-only
      try {
        await navigator.share({ files: [file] });
        return "shared";
      } catch (fileOnlyErr) {
        if ((fileOnlyErr as { name?: string })?.name === "AbortError") {
          return "cancelled";
        }
        console.warn("[Share] File-only share also failed:", fileOnlyErr);
      }
    }

    // Step 3: Fallback — share branded URL (with wa.me deep link)
    if (canNativeShare()) {
      try {
        await navigator.share({
          title: `${docLabel} ${invoiceNumber}`,
          text: shareText,
          url: brandedUrl,
        });
        return "shared";
      } catch (urlErr) {
        if ((urlErr as { name?: string })?.name === "AbortError") {
          return "cancelled";
        }
        console.warn("[Share] URL share failed:", urlErr);
      }
    }

    // Step 4: Final fallback — open wa.me with branded URL
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

