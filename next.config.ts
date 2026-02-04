import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Nowy API w Next.js 16
    proxyClientMaxBodySize: 50 * 1024 * 1024, // 50MB
  },
};

export default nextConfig;
