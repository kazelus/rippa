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
        <ProductsClient />
      </Suspense>
    </div>
    <Footer />
    </>
  );
}
