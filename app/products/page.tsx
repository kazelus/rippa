import { Suspense } from "react";
import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import { Footer } from "@/components/Footer";
import { ProductsClient } from "./ProductsClient";
import LoadingScreen from "@/components/LoadingScreen";
import { Metadata } from "next";

import { getModelsWithDetails } from "@/lib/models";
import { getCategories } from "@/lib/categories";

const BASE_URL = "https://rippapolska.pl";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Katalog Mini Koparek — Rippa Polska",
  description:
    "Przeglądaj pełny katalog mini koparek i maszyn budowlanych Rippa Polska. Ceny, dane techniczne, serwis. Autoryzowany dealer w Polsce.",
  alternates: { canonical: `${BASE_URL}/products` },
  openGraph: {
    title: "Katalog Mini Koparek — Rippa Polska",
    description: "Przeglądaj pełny katalog mini koparek i maszyn budowlanych Rippa Polska.",
    url: `${BASE_URL}/products`,
    siteName: "Rippa Polska",
    locale: "pl_PL",
    type: "website",
  },
};

// Static breadcrumbs for Products page
const breadcrumbsJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Strona główna", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Produkty", item: `${BASE_URL}/products` },
  ],
};

export default async function ProductsPage() {
  const [initialModels, initialCategories] = await Promise.all([
    getModelsWithDetails(),
    getCategories(),
  ]);

  // ItemList JSON-LD — lista produktów widoczna dla Google
  const ACCESSORY_KEYWORDS = ["akcesor", "accessori", "accessory"];
  const machines = initialModels.filter((m) => {
    if (!m.category) return true;
    const hay = `${m.category.name} ${m.category.slug}`.toLowerCase();
    return !ACCESSORY_KEYWORDS.some((kw) => hay.includes(kw));
  });

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Katalog mini koparek Rippa Polska",
    url: `${BASE_URL}/products`,
    numberOfItems: machines.length,
    itemListElement: machines.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/products/${m.slug || m.id}`,
      name: m.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419] relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#1b3caf]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#0f9fdf]/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Floating particles background */}
        <div className="absolute top-40 left-[10%] w-2 h-2 bg-[#1b3caf]/30 rounded-full animate-bounce" style={{ animationDuration: "3s" }} />
        <div className="absolute top-60 right-[15%] w-1.5 h-1.5 bg-[#0f9fdf]/40 rounded-full animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }} />
      <UnifiedNavbar />
      <Suspense
          fallback={<LoadingScreen message="Ładowanie produktów..." fullScreen={false} />}
      >
        <ProductsClient initialModels={initialModels} initialCategories={initialCategories} />
      </Suspense>
    </div>
    <Footer />
    </>
  );
}
