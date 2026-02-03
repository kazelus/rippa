import { Suspense } from "react";
import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import { ProductsClient } from "./ProductsClient";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419]">
      <UnifiedNavbar />
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b3caf] mx-auto"></div>
              <p className="text-[#b0b0b0] mt-4">Ładowanie produktów...</p>
            </div>
          </div>
        }
      >
        <ProductsClient />
      </Suspense>
    </div>
  );
}
