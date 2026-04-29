"use client";

import { useEffect, useState } from "react";
import { Share, X } from "lucide-react";

const DISMISS_KEY = "sellnsettle:ios-install-dismissed-at";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * iOS Safari install guide. iOS does NOT fire `beforeinstallprompt` —
 * users must manually tap Share → Add to Home Screen. We surface a small
 * one-time guide that explains this, since non-technical users will
 * never find the "Add to Home Screen" option on their own.
 *
 * Detection is UA-based (acceptable for a UX hint, not security):
 * iOS user agent + Safari (not Chrome or other shell), and not already
 * running standalone.
 *
 * Once dismissed, hide for 7 days. Same cadence as the Android prompt.
 */
export function IosInstallGuide() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed → never show.
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // iOS exposes navigator.standalone too, used as a belt-and-suspenders check.
    type NavigatorStandalone = Navigator & { standalone?: boolean };
    if ((navigator as NavigatorStandalone).standalone) return;

    const ua = navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/.test(ua);
    if (!isIos) return;

    // Safari only — Chrome iOS / Firefox iOS / etc. all wrap WebKit but
    // don't expose the same Add-to-Home-Screen UI Apple blesses for
    // PWA install. CriOS = Chrome iOS, FxiOS = Firefox iOS, etc.
    const isSafari = !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
    if (!isSafari) return;

    const lastDismiss = Number(
      window.localStorage.getItem(DISMISS_KEY) || "0",
    );
    if (
      lastDismiss > 0 &&
      Date.now() - lastDismiss < DISMISS_DURATION_MS
    ) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- this is the canonical pattern for "decide once on mount based on browser state": we cannot put platform-detection logic in a useState lazy initializer because that would create an SSR / client hydration mismatch (server renders false, client computes true). The setState only fires once because deps is `[]`, so there's no cascading-renders risk.
    setShow(true);
  }, []);

  const dismiss = () => {
    setShow(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Install SellNSettle on iOS"
      className="fixed inset-x-3 z-30 rounded-2xl border border-border bg-card p-4 shadow-lg"
      style={{
        bottom:
          "calc(env(safe-area-inset-bottom) + 4rem + 0.75rem)" /* clear the mobile bottom nav */,
      }}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Share className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="text-sm">
          <p className="font-medium text-foreground">
            Add SellNSettle to your home screen
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Tap{" "}
            <span className="inline-flex items-center align-middle">
              <Share className="mx-0.5 h-3.5 w-3.5" aria-label="Share" />
            </span>{" "}
            in Safari, then choose{" "}
            <strong className="text-foreground">Add to Home Screen</strong>.
            Opens like an app, ready in one tap.
          </p>
        </div>
      </div>
    </div>
  );
}
