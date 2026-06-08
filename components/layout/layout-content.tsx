"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { useAuth } from "@/lib/auth/auth-context";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/blog", "/privacy-policy", "/terms-and-conditions", "/landing_page_old"];
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

  // PWA bits — service worker registration + update banner + install
  // prompts. Mounted once at the root so they work on every route
  // (landing, auth, authenticated app). They self-gate based on
  // platform / state, so it's safe to render unconditionally.
  const pwa = <PwaProvider />;

  // Full-screen routes (e.g., onboarding) render without AppShell, for both
  // authenticated and unauthenticated visitors. The page itself handles auth
  // requirements (onboarding layout redirects completed users; preview mode
  // lets anyone view the screens). Placed BEFORE the auth gate so logged-out
  // testers visiting /onboarding/role?preview=1 get the page, not a blank.
  if (FULL_SCREEN_ROUTES.some((r) => pathname.startsWith(r))) {
    return (
      <>
        {children}
        {pwa}
      </>
    );
  }

  // Home page: show landing for unauthenticated, otherwise let page handle it
  if (pathname === "/" && !isAuthenticated) {
    return (
      <>
        {children}
        {pwa}
      </>
    );
  }

  // Other public routes (login, register)
  if (isPublicRoute(pathname) && pathname !== "/") {
    return (
      <>
        {children}
        {pwa}
      </>
    );
  }

  // Protected routes: show AppShell for authenticated users
  if (isAuthenticated) {
    return (
      <>
        <AppShell>{children}</AppShell>
        {pwa}
      </>
    );
  }

  return null;
}
