"use client";

import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

/**
 * Banner shown when a new service worker has been installed and is
 * waiting to take over. The user taps Refresh → we post SKIP_WAITING
 * to the SW → it activates → the page reloads.
 *
 * We do NOT auto-skip-waiting: forcing a reload mid-action could lose
 * a half-typed chat message or partial form. The user-driven refresh
 * is the safety boundary. See Docs/plans/pwa-installable-app.md.
 */
export function PwaUpdateBanner() {
  const [waitingSw, setWaitingSw] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let mounted = true;

    function trackUpdate(reg: ServiceWorkerRegistration) {
      // A new SW is already waiting (e.g., user came back to the tab
      // after the SW updated in a background fetch).
      if (reg.waiting) {
        if (mounted) setWaitingSw(reg.waiting);
      }

      // A new SW is being installed right now — wait for it to reach
      // 'installed' state, then surface the banner.
      reg.addEventListener("updatefound", () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (
            installing.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            if (mounted) setWaitingSw(installing);
          }
        });
      });
    }

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg && mounted) trackUpdate(reg);
    });

    // When the new SW takes over (after SKIP_WAITING fires), reload so
    // the page picks up the new version's assets.
    const onControllerChange = () => {
      if (!mounted) return;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    return () => {
      mounted = false;
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  if (!waitingSw || dismissed) return null;

  const handleRefresh = () => {
    waitingSw.postMessage({ type: "SKIP_WAITING" });
    // The reload happens via the controllerchange handler above
    // once the new SW takes over.
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-2 shadow-md"
      style={{ paddingTop: "max(env(safe-area-inset-top), 0.5rem)" }}
    >
      <div className="flex items-center gap-2 text-sm text-foreground">
        <RefreshCw className="h-4 w-4 text-primary" aria-hidden="true" />
        <span>
          A new version is ready. <strong>Refresh</strong> to update.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleRefresh}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
