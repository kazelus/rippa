import { getModelById } from "@/lib/models";
import { notFound } from "next/navigation";
import { ProductClient } from "./ProductClient";
import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const model = await getModelById(id);

  if (!model) {
    return {
      title: "Produkt nie znaleziony | Rippa Polska",
    };
  }

  const title = `${model.name} - Koparka Rippa Polska`;
  const description = model.heroDescription || model.description || `Sprawdź szczegóły modelu ${model.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: model.images && model.images.length > 0 ? [{ url: model.images[0].url }] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const model = await getModelById(id);

  if (!model) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419] text-white">
      <UnifiedNavbar />
      <ProductClient initialModel={model} />
      <Footer />
    </div>
  );
}
