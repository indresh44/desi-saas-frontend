"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "sellnsettle:pwa-install-dismissed-at";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * Android Chrome / desktop Chromium install prompt. Captures
 * `beforeinstallprompt` (a Chromium-specific event Apple does NOT fire
 * — see IosInstallGuide.tsx for the iOS path) and surfaces a small
 * banner. iOS Safari is handled by IosInstallGuide.
 *
 * UX rules:
 * - Don't ask on first page load. Wait for the deferred event +
 *   one full session of usage before showing.
 * - If the user dismisses, hide for 7 days (localStorage).
 * - If the user installs, hide forever (browser stops firing the event).
 * - Hide if the app is already running in standalone mode.
 */
export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  const dismissTemporarily = useCallback(() => {
    setVisible(false);
    setDeferredPrompt(null);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed / running standalone → never show.
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Recently dismissed → wait 7 days.
    const lastDismiss = Number(
      window.localStorage.getItem(DISMISS_KEY) || "0",
    );
    if (
      lastDismiss > 0 &&
      Date.now() - lastDismiss < DISMISS_DURATION_MS
    ) {
      return;
    }

    const onBeforeInstallPrompt = (e: Event) => {
      // Stop Chrome's default mini-infobar; we'll show our own banner.
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onAppInstalled = () => {
      // Browser stops firing beforeinstallprompt after install, but
      // double-clean state in case our component is mounted across nav.
      setDeferredPrompt(null);
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (!visible || !deferredPrompt) return null;

  const handleInstall = async () => {
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "dismissed") {
        dismissTemporarily();
      } else {
        // Accepted — clear local state. `appinstalled` listener also fires.
        setDeferredPrompt(null);
        setVisible(false);
      }
    } catch {
      dismissTemporarily();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Install SellNSettle"
      className="fixed inset-x-3 z-30 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-lg md:inset-x-auto md:right-6 md:max-w-sm"
      style={{
        bottom:
          "calc(env(safe-area-inset-bottom) + 4rem + 0.75rem)" /* clear the mobile bottom nav */,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Download className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="text-sm">
          <p className="font-medium text-foreground">Install SellNSettle</p>
          <p className="text-xs text-muted-foreground">
            Add to your home screen for faster access.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-1.5">
        <button
          type="button"
          onClick={() => void handleInstall()}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Install
        </button>
        <button
          type="button"
          onClick={dismissTemporarily}
          aria-label="Dismiss install prompt"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Not now
        </button>
      </div>
      <button
        type="button"
        onClick={dismissTemporarily}
        aria-label="Close"
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted md:hidden"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
