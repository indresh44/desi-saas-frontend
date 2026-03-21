/**
 * Share a file using the Web Share API (mobile) or fall back to download (desktop).
 */

const API_BASE = typeof window !== "undefined" ? window.location.origin : "";

export function canNativeShare(): boolean {
  if (typeof navigator === "undefined") return false;
  return typeof navigator.share === "function";
}

function canShareFiles(data: ShareData): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.canShare !== "function") return false;
  return navigator.canShare(data);
}

export async function shareInvoicePdf(
  pdfUrl: string,
  invoiceNumber: string,
  customerName: string,
): Promise<"shared" | "downloaded" | "cancelled" | "error"> {
  try {
    const fileName = `${invoiceNumber}.pdf`;
    const shareText = `Invoice ${invoiceNumber} for ${customerName}`;

    // Step 1: Try to fetch the PDF through our Next.js proxy (avoids R2 CORS issues).
    // If this fails, we still continue with URL share/open fallback.
    let blob: Blob | null = null;
    try {
      const proxyUrl = `${API_BASE}/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;
      console.log("[Share] Fetching PDF via proxy:", proxyUrl);

      const response = await fetch(proxyUrl);
      if (!response.ok) {
        console.warn("[Share] Proxy fetch failed:", response.status, response.statusText);
      } else {
        blob = await response.blob();
        console.log("[Share] PDF fetched, size:", blob.size, "bytes");
      }
    } catch (proxyError) {
      console.warn("[Share] Proxy fetch threw error, continuing with URL fallback:", proxyError);
    }

    // Step 2: Try native share (mobile)
    if (canNativeShare()) {
      console.log("[Share] Native share API available");

      if (blob) {
        const file = new File([blob], fileName, { type: "application/pdf" });
        const fileShareData: ShareData = {
          title: `Invoice ${invoiceNumber}`,
          text: shareText,
          files: [file],
        };

        if (canShareFiles(fileShareData)) {
          console.log("[Share] canShare(file) returned true — opening share sheet");
          await navigator.share(fileShareData);
          return "shared";
        }
        console.warn("[Share] File share not supported. Trying link share...");
      }

      // Try sharing just the URL (works in more browsers/devices)
      await navigator.share({
        title: `Invoice ${invoiceNumber}`,
        text: shareText,
        url: pdfUrl,
      });
      return "shared";
    } else {
      console.log("[Share] Native share API NOT available — will download");
    }

    // Step 3: Fallback — download/open the PDF
    if (blob) {
      console.log("[Share] Downloading proxied PDF blob");
      downloadBlob(blob, fileName);
    } else {
      console.log("[Share] Opening PDF URL directly");
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
