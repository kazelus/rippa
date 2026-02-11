import { Suspense } from "react";
import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import { Footer } from "@/components/Footer";
import { ProductsClient } from "./ProductsClient";
import LoadingScreen from "@/components/LoadingScreen";

// Static breadcrumbs for Products page
const breadcrumbsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Strona główna',
      item: 'https://rippapolska.pl',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Produkty',
      item: 'https://rippapolska.pl/products',
    },
  ],
};

export default function ProductsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419]">
      <UnifiedNavbar />
      <Suspense
          fallback={<LoadingScreen message="Ładowanie produktów..." fullScreen={false} />}
      >
        <ProductsClient />
      </Suspense>
    </div>
    <Footer />
    </>
  );
}
