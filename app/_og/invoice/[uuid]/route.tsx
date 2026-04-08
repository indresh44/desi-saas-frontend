import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://sellnsettle.com";

interface InvoiceMeta {
  invoice_number: string;
  total_amount: number;
  due_date: string;
  status: string;
  customer_name: string | null;
  business_name: string;
  items_count: number;
}

function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case "paid":
      return { bg: "#dcfce7", text: "#15803d" };
    case "approved":
      return { bg: "#ccfbf1", text: "#0f766e" };
    case "sent":
      return { bg: "#dbeafe", text: "#1d4ed8" };
    case "partial":
      return { bg: "#fef3c7", text: "#b45309" };
    default:
      return { bg: "#f4f4f5", text: "#52525b" };
  }
}

function getDocLabel(status: string): string {
  return status === "sent" ? "ESTIMATE" : "TAX INVOICE";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params;

  let meta: InvoiceMeta | null = null;
  try {
    const res = await fetch(`${API_BASE}/api/public/invoices/${uuid}/meta`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      meta = await res.json();
    }
  } catch {
    // fallback to generic image
  }

  if (!meta) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8fafc",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 700, color: "#0f766e" }}>
            SellNSettle
          </div>
          <div style={{ fontSize: 24, color: "#71717a", marginTop: 16 }}>
            Invoice not available
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }

  const statusColor = getStatusColor(meta.status);
  const docLabel = getDocLabel(meta.status);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top branding bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#0f766e",
            padding: "24px 48px",
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 700, color: "#ffffff" }}>
            SellNSettle
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#ccfbf1",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            {docLabel}
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flex: 1,
            padding: "48px",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Invoice number + status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            <div style={{ fontSize: 56, fontWeight: 700, color: "#18181b" }}>
              {meta.invoice_number}
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                backgroundColor: statusColor.bg,
                color: statusColor.text,
                padding: "8px 20px",
                borderRadius: "999px",
                textTransform: "capitalize",
              }}
            >
              {meta.status}
            </div>
          </div>

          {/* Amount */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#0f766e",
              marginBottom: "32px",
            }}
          >
            {formatRupees(meta.total_amount)}
          </div>

          {/* Details row */}
          <div
            style={{
              display: "flex",
              gap: "48px",
              fontSize: 24,
              color: "#71717a",
            }}
          >
            {meta.customer_name ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "#a1a1aa" }}>To:</span>
                <span style={{ color: "#3f3f46", fontWeight: 500 }}>
                  {meta.customer_name}
                </span>
              </div>
            ) : null}
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ color: "#a1a1aa" }}>Due:</span>
              <span style={{ color: "#3f3f46", fontWeight: 500 }}>
                {formatDate(meta.due_date)}
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ color: "#a1a1aa" }}>Items:</span>
              <span style={{ color: "#3f3f46", fontWeight: 500 }}>
                {meta.items_count}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 48px",
            backgroundColor: "#f8fafc",
            borderTop: "1px solid #e4e4e7",
          }}
        >
          <div style={{ fontSize: 18, color: "#a1a1aa" }}>
            From {meta.business_name}
          </div>
          <div style={{ fontSize: 18, color: "#a1a1aa" }}>sellnsettle.com</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    },
  );
}
