import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["https://19e4-2401-4900-8820-61b6-4d68-ca00-3dd0-ff52.ngrok-free.app","https://44bf-172-105-53-206.ngrok-free.app"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
    ],
  },
};

export default nextConfig;
