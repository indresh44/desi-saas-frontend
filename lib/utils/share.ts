/**
 * Share a file using the Web Share API (mobile) or fall back to download (desktop).
 */

const API_BASE = typeof window !== "undefined" ? window.location.origin : "";

export function canNativeShare(): boolean {
  if (typeof navigator === "undefined") return false;
  return typeof navigator.share === "function";
}

export async function shareInvoicePdf(
  pdfUrl: string,
  invoiceNumber: string,
  customerName: string,
): Promise<"shared" | "downloaded" | "cancelled" | "error"> {
  try {
    const fileName = `${invoiceNumber}.pdf`;
    const shareText = `Invoice ${invoiceNumber} for ${customerName}`;

    // Step 1: Fetch the PDF blob via our proxy (avoids R2 CORS issues).
    // If proxy fails, try direct fetch as fallback.
    let blob: Blob | null = null;
    const proxyUrl = `${API_BASE}/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;

    try {
      console.log("[Share] Fetching PDF via proxy:", proxyUrl);
      const response = await fetch(proxyUrl);
      if (response.ok) {
        blob = await response.blob();
        console.log("[Share] PDF fetched via proxy, size:", blob.size, "bytes");
      } else {
        console.warn("[Share] Proxy fetch failed:", response.status, response.statusText);
      }
    } catch (proxyErr) {
      console.warn("[Share] Proxy fetch error:", proxyErr);
    }

    // Fallback: try fetching directly from R2 (works if CORS is configured)
    if (!blob) {
      try {
        console.log("[Share] Trying direct fetch:", pdfUrl);
        const response = await fetch(pdfUrl);
        if (response.ok) {
          blob = await response.blob();
          console.log("[Share] PDF fetched directly, size:", blob.size, "bytes");
        }
      } catch (directErr) {
        console.warn("[Share] Direct fetch also failed (CORS):", directErr);
      }
    }

    // Step 2: Try native share with actual PDF file (mobile)
    if (canNativeShare() && blob) {
      const file = new File([blob], fileName, { type: "application/pdf" });

      // Try sharing file + caption text
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
      console.log("[Share] Downloading proxied PDF blob");
      downloadBlob(blob, fileName);
    } else {
      console.log("[Share] Opening PDF URL directly for download");
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
    return "downloaded";

  } catch (error) {
    // User cancelled the share sheet
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name: string }).name === "AbortError"
    ) {
      console.log("[Share] User cancelled");
      return "cancelled";
    }

    console.error("[Share] Error:", error);
    // Do NOT open in new tab — that was causing the problem.
    // Just return error and let the UI handle it.
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
