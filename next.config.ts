import type { NextConfig } from "next";

const API_PROXY_TARGET = process.env.NEXT_PUBLIC_API_PROXY_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*/",
        destination: `${API_PROXY_TARGET}/api/:path*/`,
      },
      {
        source: "/api/:path*",
        destination: `${API_PROXY_TARGET}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
