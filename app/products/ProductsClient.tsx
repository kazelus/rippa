"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ArrowRight,
  Star,
  Layers,
  X,
  SlidersHorizontal,
} from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Model {
  id: string;
  name: string;
  description: string;
  power?: number;
  depth?: number;
  weight?: number;
  bucket?: number;
  price: number;
  featured: boolean;
  categoryId?: string;
  category?: Category;
  images: Array<{ id: string; url: string; alt: string }>;
  quickSpecs?: Array<{
    label: string;
    value: string | number;
    unit: string;
    paramLabel: string;
  }>;
}

export function ProductsClient() {
  const searchParams = useSearchParams();
  const [models, setModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category") || null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showBestsellers, setShowBestsellers] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [modelsRes, categoriesRes] = await Promise.all([
        fetch("/api/models"),
        fetch("/api/categories"),
      ]);

      if (!modelsRes.ok || !categoriesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const modelsData = await modelsRes.json();
      const categoriesData = await categoriesRes.json();

      setModels(modelsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredModels = models.filter((model) => {
    const matchesCategory =
      !selectedCategory || model.categoryId === selectedCategory;
    const matchesSearch =
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBestseller = !showBestsellers || model.featured;

    return matchesCategory && matchesSearch && matchesBestseller;
  });

  const activeCategory = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 relative z-10">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#8b92a9] hover:text-white transition text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Strona główna
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Katalog maszyn
          </h1>
          <p className="text-[#8b92a9]">
            {filteredModels.length}{" "}
            {filteredModels.length === 1
              ? "produkt"
              : filteredModels.length < 5
                ? "produkty"
                : "produktów"}
            {activeCategory && (
              <span>
                {" "}
                w kategorii{" "}
                <span className="text-white font-medium">
                  {activeCategory.name}
                </span>
              </span>
            )}
          </p>
        </div>
        <div className="w-20 h-1 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] md:hidden" />
      </div>

      {/* ─── Filters Bar ─── */}
      <div className="mb-10 space-y-5">
        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b92a9] w-5 h-5" />
          <input
            type="text"
            placeholder="Szukaj modelu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#8b92a9] focus:outline-none focus:ring-2 focus:ring-[#1b3caf]/60 focus:border-[#1b3caf]/40 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b92a9] hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category pills + bestseller toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#8b92a9] mr-1 hidden sm:block" />

          {/* All categories pill */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              !selectedCategory
                ? "bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white shadow-lg shadow-[#1b3caf]/20 scale-105"
                : "bg-white/5 text-[#b0b0b0] border border-white/10 hover:border-white/20 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Wszystkie
            </span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white shadow-lg shadow-[#1b3caf]/20 scale-105"
                  : "bg-white/5 text-[#b0b0b0] border border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

          {/* Bestseller toggle */}
          <button
            onClick={() => setShowBestsellers(!showBestsellers)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
              showBestsellers
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 scale-105"
                : "bg-white/5 text-[#b0b0b0] border border-white/10 hover:border-amber-500/30 hover:text-amber-400"
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${showBestsellers ? "fill-white" : ""}`}
            />
            Bestsellery
          </button>
        </div>
      </div>

      {/* ─── Products Grid ─── */}
      {isLoading ? (
        <LoadingScreen message="Ładowanie produktów..." fullScreen={false} />
      ) : filteredModels.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Search className="w-7 h-7 text-[#8b92a9]" />
          </div>
          <p className="text-white text-lg font-semibold mb-2">
            Nie znaleziono produktów
          </p>
          <p className="text-[#8b92a9] text-sm mb-6">
            Spróbuj zmienić kryteria wyszukiwania
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory(null);
              setShowBestsellers(false);
            }}
            className="px-5 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition"
          >
            Wyczyść filtry
          </button>
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"
        >
          {filteredModels.map((model, idx) => (
            <Link
              key={model.id}
              href={`/products/${model.id}`}
              className="group relative flex flex-col bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl overflow-hidden hover:border-[#1b3caf]/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#1b3caf]/8"
              style={{
                animationDelay: `${idx * 80}ms`,
                animation: "fadeInUp 0.5s ease-out both",
              }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1b3caf]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

              {/* Image */}
              <div className="relative h-60 overflow-hidden bg-gradient-to-br from-[#0f1419] to-[#1a1f2e]">
                {model.images && model.images.length > 0 ? (
                  <Image
                    src={model.images[0].url}
                    alt={model.images[0].alt || model.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8b92a9]">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/5 flex items-center justify-center">
                        <Layers className="w-6 h-6" />
                      </div>
                      <span className="text-sm">Brak zdjęcia</span>
                    </div>
                  </div>
                )}
                {/* Bottom gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0f1419]/80 to-transparent pointer-events-none" />

                {/* Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                  {model.featured ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/30">
                      <Star className="w-3 h-3 fill-white" />
                      Bestseller
                    </span>
                  ) : (
                    <span />
                  )}
                  {model.category && (
                    <span className="px-2.5 py-1 bg-black/50 backdrop-blur-sm text-[#d0d8e6] text-xs rounded-full border border-white/10">
                      {model.category.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1 relative z-10">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#0f9fdf] transition-colors duration-300">
                  {model.name}
                </h3>
                <p className="text-[#8b92a9] text-sm mb-5 line-clamp-2 leading-relaxed">
                  {model.description}
                </p>

                {/* Quick specs */}
                {model.quickSpecs && model.quickSpecs.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-5">
                    {model.quickSpecs.slice(0, 4).map((qs, i) => {
                      let displayVal = qs.value;
                      if (typeof displayVal === "string") {
                        try {
                          displayVal = JSON.parse(displayVal);
                        } catch {}
                      }
                      return (
                        <div
                          key={i}
                          className="flex items-baseline gap-1.5 text-sm"
                        >
                          <span className="text-white font-semibold tabular-nums">
                            {displayVal}
                          </span>
                          <span className="text-[#8b92a9] text-xs truncate">
                            {qs.unit || qs.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Price + CTA */}
                <div className="mt-auto pt-5 border-t border-white/10 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[#8b92a9] text-xs mb-0.5">Cena od</p>
                    <p className="text-white text-2xl font-bold leading-none">
                      {model.price.toLocaleString("pl-PL")}{" "}
                      <span className="text-base font-semibold text-[#8b92a9]">
                        PLN
                      </span>
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white text-sm font-semibold group-hover:shadow-lg group-hover:shadow-[#1b3caf]/30 transition-all duration-300 whitespace-nowrap">
                    Szczegóły
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Fade-in animation keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
