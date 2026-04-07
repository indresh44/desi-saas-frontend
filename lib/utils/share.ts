/**
 * Share a file using the Web Share API (mobile) or fall back to download (desktop).
 */

import { API_BASE_URL } from "@/lib/constants/api";
import { getAccessToken } from "@/lib/auth/token-store";

export function canNativeShare(): boolean {
  if (typeof navigator === "undefined") return false;
  return typeof navigator.share === "function";
}

/**
 * Fetch the PDF blob from our backend (server-to-server, no CORS issues).
 */
async function fetchPdfBlob(invoiceId: string): Promise<Blob | null> {
  const token = getAccessToken();
  const url = `${API_BASE_URL}/api/v1/invoices/${invoiceId}/pdf/download`;
  console.log("[Share] Fetching PDF from backend:", url);

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
}

export async function shareInvoicePdf(
  invoiceId: string,
  invoiceNumber: string,
  status?: string,
): Promise<"shared" | "downloaded" | "cancelled" | "error"> {
  try {
    const fileName = `${invoiceNumber}.pdf`;
    const isEstimate = status === "draft" || status === "sent";
    const docLabel = isEstimate ? "Estimate" : "Invoice";
    const statusLabel = status ? ` | Status: ${status.charAt(0).toUpperCase() + status.slice(1)}` : "";
    const shareText = `Hi, please find your ${docLabel} ${invoiceNumber}${statusLabel}`;

    // Step 1: Fetch PDF blob from backend
    const blob = await fetchPdfBlob(invoiceId);

    // Step 2: Try native share with actual PDF file (mobile)
    // Copy caption to clipboard first — WhatsApp ignores the text param,
    // so user can long-press → paste in the caption field.
    if (canNativeShare() && blob) {
      const file = new File([blob], fileName, { type: "application/pdf" });

      try {
        await navigator.clipboard.writeText(shareText);
      } catch {
        // clipboard write may fail silently — not critical
      }

      try {
        console.log("[Share] Attempting navigator.share with PDF file");
        await navigator.share({
          title: `Invoice ${invoiceNumber}`,
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

    // Step 3: Fallback — download the PDF
    if (blob) {
      console.log("[Share] Downloading PDF blob");
      downloadBlob(blob, fileName);
    } else {
      console.error("[Share] Could not fetch PDF");
      return "error";
    }
    return "downloaded";

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

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
