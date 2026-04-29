import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.3",
    "192.168.1.7",
    "127.0.0.1",
    "localhost",
    "*.ngrok-free.app",
    "192."
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      canvas: path.join(__dirname, "lib/pdf-canvas-stub.ts"),
    },
  },
  webpack: (config) => {
    config.resolve.alias.canvas = path.join(__dirname, "lib/pdf-canvas-stub.ts");
    return config;
  },
};

// Serwist generates the service worker from `app/sw.ts` and writes it to
// `public/sw.js`. The SW is disabled in dev so the dev server's HMR
// isn't intercepted by stale cache responses. See Docs/plans/pwa-installable-app.md.
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
  cacheOnNavigation: true,
  reloadOnOnline: true,
});

export default withSerwist(nextConfig);
