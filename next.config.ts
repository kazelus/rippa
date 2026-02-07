import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Nowy API w Next.js 16
    proxyClientMaxBodySize: 50 * 1024 * 1024, // 50MB
  },
  outputFileTracingExcludes: {
    "*": [
      "scripts/**",
      "prisma/migrations/**",
      "public/downloads/**",
      "public/uploads/**",
      "setup-db.js",
      "setup-db.bat",
      "archived_chat/**",
      "node_modules/@prisma/engines/**",
      "node_modules/prisma/**",
    ],
  },
};

export default nextConfig;
