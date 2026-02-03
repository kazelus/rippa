import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Zwiększamy maksymalny rozmiar body przesyłanego do middleware/route handlers
  // Domyślnie Next.js ogranicza do ~10MB; ustawiamy na 20MB (20 * 1024 * 1024)
  experimental: {
    middlewareClientMaxBodySize: 20 * 1024 * 1024,
  },
};

export default nextConfig;
