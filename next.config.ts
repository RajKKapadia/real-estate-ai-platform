import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["bullmq", "ioredis", "postgres"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  allowedDevOrigins: [
    "grateful-lemming-clearly.ngrok-free.app"
  ]
};

export default nextConfig;
