import { Suspense } from "react";
import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import { Footer } from "@/components/Footer";
import { ProductsClient } from "./ProductsClient";
import LoadingScreen from "@/components/LoadingScreen";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419]">
      <UnifiedNavbar />
      <Suspense
          fallback={<LoadingScreen message="Ładowanie produktów..." fullScreen={false} />}
      >
        <ProductsClient />
      </Suspense>
      <Footer />
    </div>
  );
}
