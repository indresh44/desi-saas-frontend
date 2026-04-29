import type { Metadata } from "next";
import { PublicInvoiceView } from "./public-invoice-view";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://sellnsettle.com";

interface InvoiceMeta {
  invoice_number: string;
  total_amount: number;
  due_date: string;
  status: string;
  customer_name: string | null;
  business_name: string;
  items_count: number;
  updated_at: string;
}

async function fetchMeta(uuid: string): Promise<InvoiceMeta | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/invoices/${uuid}/meta`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchCoverPhoto(uuid: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/invoices/${uuid}/detail`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    for (const item of data.items ?? []) {
      const photos = item.photos ?? [];
      if (photos.length > 0) {
        const primary = photos.find((p: { is_primary: boolean }) => p.is_primary);
        return (primary ?? photos[0]).file_url;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}): Promise<Metadata> {
  const { uuid } = await params;
  const [meta, coverPhoto] = await Promise.all([
    fetchMeta(uuid),
    fetchCoverPhoto(uuid),
  ]);

  if (!meta) {
    return {
      title: "Invoice Not Found — SellNSettle",
      description: "This invoice is not available.",
    };
  }

  const isEstimate = meta.status === "draft" || meta.status === "sent";
  const docLabel = isEstimate ? "Estimate" : "Invoice";
  const title = `${docLabel} ${meta.invoice_number} — ${formatRupees(meta.total_amount)}`;
  const description = `From ${meta.business_name}${meta.customer_name ? ` for ${meta.customer_name}` : ""} | Due ${formatDate(meta.due_date)} | ${meta.items_count} item${meta.items_count !== 1 ? "s" : ""}`;

  // While the invoice is editable (draft/sent), append `?v={updated_at_unix}`
  // to the canonical URL AND the og:image URL. Both URLs are independently
  // cached by WhatsApp / Telegram / Slack — versioning both layers ensures
  // the preview refreshes after every edit. Once approved, content is
  // locked; URLs go back to canonical.
  const updatedAtUnix = Math.floor(new Date(meta.updated_at).getTime() / 1000);
  const versionParam =
    isEstimate && Number.isFinite(updatedAtUnix) ? `?v=${updatedAtUnix}` : "";
  const ogImageBase = coverPhoto ?? `https://sellnsettle.com/_og/invoice/${uuid}`;
  const ogImage = `${ogImageBase}${versionParam}`;
  const canonicalUrl = `https://sellnsettle.com/invoices/${uuid}/${meta.invoice_number}.pdf${versionParam}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      siteName: "SellNSettle",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${docLabel} ${meta.invoice_number}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const meta = await fetchMeta(uuid);

  return <PublicInvoiceView uuid={uuid} meta={meta} />;
}
