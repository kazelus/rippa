import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        port: "",
        pathname: "/**",
      },
    ],
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
