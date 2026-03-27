import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "sxfzgbvwlxikonohczeo.supabase.co" },
      { protocol: "https", hostname: "image.mux.com" },
      { protocol: "https", hostname: "stream.mux.com" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
};

export default nextConfig;
