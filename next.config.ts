import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.3",
    "192.168.1.8",
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

export default nextConfig;
