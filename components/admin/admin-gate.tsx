"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ADMIN_ENABLED } from "@/lib/types/admin";

/**
 * Client-side gate for the /admin route. Hides the page entirely when
 * NEXT_PUBLIC_ENABLE_ADMIN is not "true". This is UX only — the real
 * gate is server-side: admin endpoints don't exist in production
 * (router not registered) and require a JWT email match against
 * SUPER_ADMIN_EMAILS even when they do.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  if (!ADMIN_ENABLED) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        <h1 className="mb-2 text-base font-semibold text-primary">
          Admin disabled
        </h1>
        <p>
          The admin panel is not enabled in this build. Set
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">
            NEXT_PUBLIC_ENABLE_ADMIN=true
          </code>
          on the local dev server to enable it. See
          <Link
            href="/"
            className="ml-1 text-primary underline-offset-4 hover:underline"
          >
            home
          </Link>
          .
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
