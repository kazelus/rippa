import { NextResponse } from "next/server";

export async function GET() {
  // Pobierz listę produktów z API
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "https://rippapolska.pl"}/api/models`);
  const models = res.ok ? await res.json() : [];

  // Dodaj inne ważne strony
  const staticPages = [
    "",
    "about",
    "contact",
    "products",
    "compare",
    "admin",
  ];

  const urls = [
    ...staticPages.map((slug) => `https://rippapolska.pl/${slug}`),
    ...models.map((m: any) => `https://rippapolska.pl/products/${m.id}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (url) => `<url><loc>${url}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`
    )
    .join("\n")}\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
