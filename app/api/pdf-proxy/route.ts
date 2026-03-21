import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = [".r2.dev"];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return ALLOWED_HOSTS.some((host) => parsed.hostname.endsWith(host));
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

  const response = await fetch(url);

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: response.status }
    );
  }

  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const body = await response.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=300",
    },
  });
}
