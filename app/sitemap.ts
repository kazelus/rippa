import { MetadataRoute } from "next";
import { pool } from "@/lib/db";

const BASE_URL = "https://rippapolska.pl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/financing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const result = await pool.query(
      `SELECT id, "updatedAt" FROM "Model" WHERE COALESCE(visible, true) = true ORDER BY "createdAt" DESC`
    );
    productPages = result.rows.map((row: { id: string; updatedAt: Date }) => ({
      url: `${BASE_URL}/products/${row.id}`,
      lastModified: row.updatedAt ? new Date(row.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.error("[SITEMAP] Failed to fetch products:", e);
  }

  return [...staticPages, ...productPages];
}
