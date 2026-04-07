import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Security: only allow proxying from your R2 domain and known storage providers
const ALLOWED_DOMAINS = [
  "pub-",                         // Cloudflare R2 public bucket URLs start with pub- (e.g., pub-xxx.r2.dev)
  ".r2.dev",                      // R2 dev domain
  ".r2.cloudflarestorage.com",    // R2 Cloudflare Storage domain
];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Enforce HTTPS for security
    if (parsed.protocol !== "https:") return false;
    // Check if the URL matches allowed domains
    return ALLOWED_DOMAINS.some((domain) => url.includes(domain));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch PDF from storage" },
        { status: response.status }
      );
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        // Cache the proxied PDF for 1 hour to avoid repeated fetches
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("PDF proxy error:", error);
    return NextResponse.json({ error: "Failed to proxy PDF" }, { status: 500 });
  }
}
