"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/lib/auth/auth-context";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/blog", "/privacy-policy", "/terms-and-conditions"];
const FULL_SCREEN_ROUTES = ["/onboarding"];

// Public invoice view: /invoices/{uuid}/filename.pdf
const INVOICE_VIEW_PATTERN = /^\/invoices\/[0-9a-f-]{36}\/.+/;

function isPublicRoute(pathname: string): boolean {
  if (INVOICE_VIEW_PATTERN.test(pathname)) return true;

  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") {
      return pathname === route;
    }

    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

export function LayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  // Home page: show landing for unauthenticated, otherwise let page handle it
  if (pathname === "/" && !isAuthenticated) {
    return <>{children}</>;
  }

  // Other public routes (login, register)
  if (isPublicRoute(pathname) && pathname !== "/") {
    return <>{children}</>;
  }

  // Full-screen routes: authenticated but no AppShell (e.g., onboarding)
  if (isAuthenticated && FULL_SCREEN_ROUTES.some((r) => pathname.startsWith(r))) {
    return <>{children}</>;
  }

  // Protected routes: show AppShell for authenticated users
  if (isAuthenticated) {
    return <AppShell>{children}</AppShell>;
  }

  return null;
}
