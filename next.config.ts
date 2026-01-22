import type { NextConfig } from "next";

const API_PROXY_TARGET = process.env.NEXT_PUBLIC_API_PROXY_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Provide an explicit turbopack config so Next 16 won't error when a webpack
  // override is present. Turbopack stays the default unless you run with
  // `--webpack`.
  turbopack: {},
  // Avoid eval-based source maps in dev so CSP `script-src` works without unsafe-eval.
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = "cheap-module-source-map";
    }
    return config;
  },
};

export default nextConfig;
