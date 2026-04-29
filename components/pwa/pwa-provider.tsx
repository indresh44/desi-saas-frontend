"use client";

import { useEffect } from "react";
import { IosInstallGuide } from "@/components/pwa/ios-install-guide";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { PwaUpdateBanner } from "@/components/pwa/pwa-update-banner";

/**
 * Registers the Serwist-generated service worker and mounts the three
 * PWA UX surfaces (update banner, Android install prompt, iOS install
 * guide). Mounted once at the root inside LayoutContent so it covers
 * every route — both public (landing, login) and authenticated.
 *
 * The SW is only emitted in production builds (Serwist `disable: true`
 * in dev — see next.config.ts), so the registration call is a no-op
 * during `npm run dev`.
 */
export function PwaProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => {
        console.warn("[PWA] Service worker registration failed:", err);
      });
  }, []);

  return (
    <>
      <PwaUpdateBanner />
      <PwaInstallPrompt />
      <IosInstallGuide />
    </>
  );
}
