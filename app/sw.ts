/**
 * Service worker entry. Compiled by `@serwist/next` (configured in
 * `next.config.ts`) and emitted to `public/sw.js` on every production
 * build.
 *
 * Strategy:
 * - Static assets: stale-while-revalidate (default Serwist runtime caching)
 * - HTML / app routes: NetworkFirst — keeps live content fresh, falls back
 *   to cache only when offline
 * - API calls (`/api/...`): NetworkOnly — never cache user data
 *
 * Update behavior: when a new SW build is deployed, this SW enters the
 * "waiting" state. The PwaUpdateBanner component listens for that event
 * and prompts the user to reload. We intentionally do NOT call
 * `skipWaiting()` automatically — forcing a mid-action reload could lose
 * user input (half-typed chat message, etc.). The banner's "Refresh"
 * button posts a SKIP_WAITING message to trigger the takeover.
 */

/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

// Listen for the "SKIP_WAITING" message from the update banner.
// When the user taps "Refresh", the banner posts this message and the
// new SW takes over immediately. The page reload is triggered by the
// 'controllerchange' event on the page side.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

serwist.addEventListeners();
