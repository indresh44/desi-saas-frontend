/**
 * Share a file using the Web Share API (mobile) or fall back to download (desktop).
 */

export function canNativeShare(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare;
}

export async function shareInvoicePdf(
  pdfUrl: string,
  invoiceNumber: string,
  customerName: string,
): Promise<"shared" | "downloaded" | "cancelled" | "error"> {
  try {
    const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch PDF");
    }

    const blob = await response.blob();
    const fileName = `${invoiceNumber}.pdf`;
    const file = new File([blob], fileName, { type: "application/pdf" });

    if (canNativeShare()) {
      const shareData: ShareData = {
        title: `Invoice ${invoiceNumber}`,
        text: `Invoice ${invoiceNumber} for ${customerName}`,
        files: [file],
      };

      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return "shared";
      }
    }

    downloadBlob(blob, fileName);
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

    console.error("Share failed:", error);
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
    return "error";
  }
}

/**
 * Share just a link (no file). Falls back to copying the URL.
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
