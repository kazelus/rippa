"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ChevronLeft } from "lucide-react";
import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import { Button } from "@/components/Button";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Model {
  id: string;
  name: string;
  description: string;
  power: number;
  depth: number;
  weight: number;
  bucket: number;
  price: number;
  featured: boolean;
  categoryId?: string;
  category?: Category;
  images: Array<{ id: string; url: string; alt: string }>;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [models, setModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category") || null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showBestsellers, setShowBestsellers] = useState(false);

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

      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        setModels(modelsData);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419] relative overflow-x-hidden">
      {/* Decorative background inspired by Rippa logo */}
      <div className="pointer-events-none select-none fixed inset-0 z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-[#1b3caf]/40 via-[#0f9fdf]/20 to-transparent rounded-full blur-3xl opacity-70 animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tr from-[#0f9fdf]/30 via-[#1b3caf]/20 to-transparent rounded-full blur-2xl opacity-60 animate-pulse-slow2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[300px] bg-gradient-to-r from-[#1b3caf]/10 via-[#0f9fdf]/10 to-transparent rounded-full blur-2xl opacity-40 rotate-[-18deg]" />
      </div>
      <UnifiedNavbar />
      {/* Main Content */}
      <main className="w-full relative z-10 pt-24">
        {/* Hero Section - more width, slightly smaller */}
        <section className="py-14 bg-white/5 border-b border-white/10">
          <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-20">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Katalog Produktów
            </h1>
            <p className="text-[#b0b0b0] text-xl max-w-3xl mb-2">
              Pełna gama mini-koparek dostosowanych do każdych wymagań
              profesjonalnych
            </p>
          </div>
        </section>
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-20 py-10">
          <div>
            {/* Filter Bar */}
            <div className="mb-10 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                {/* Search */}
                <div className="relative w-full md:max-w-md group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280] group-focus-within:text-[#1b3caf] transition-colors" />
                  <input
                    type="text"
                    placeholder="Szukaj modelu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0f1419] border border-white/10 rounded-xl text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] focus:ring-1 focus:ring-[#1b3caf] transition-all text-sm"
                  />
                </div>

                {/* Status Toggle */}
                <label className="flex items-center gap-3 cursor-pointer select-none group px-4 py-2 rounded-xl hover:bg-white/5 transition-colors">
                  <span
                    className={`text-sm font-medium transition-colors ${!showBestsellers ? "text-white" : "text-[#6b7280]"}`}
                  >
                    Wszystkie
                  </span>
                  <div
                    className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${
                      showBestsellers
                        ? "bg-[#1b3caf]"
                        : "bg-white/10 group-hover:bg-white/20"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setShowBestsellers(!showBestsellers);
                    }}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                        showBestsellers ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors ${showBestsellers ? "text-[#1b3caf]" : "text-[#6b7280]"}`}
                  >
                    Bestsellery
                  </span>
                </label>
              </div>

              {/* Categories Pills */}
              <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide mask-linear-fade">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                    selectedCategory === null
                      ? "bg-[#1b3caf] text-white border-[#1b3caf] shadow-[0_4px_12px_rgba(27,60,175,0.25)]"
                      : "bg-white/5 text-[#b0b0b0] border-white/5 hover:border-white/20 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Wszystkie mode
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                      selectedCategory === category.id
                        ? "bg-[#1b3caf] text-white border-[#1b3caf] shadow-[0_4px_12px_rgba(27,60,175,0.25)]"
                        : "bg-white/5 text-[#b0b0b0] border-white/5 hover:border-white/20 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid - smaller cards */}
            <div className="w-full">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-white/5 rounded-lg mb-4"></div>
                      <div className="h-4 bg-white/5 rounded mb-2"></div>
                      <div className="h-4 bg-white/5 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : filteredModels.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#b0b0b0] text-lg mb-4">
                    Brak produktów w tej kategorii
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchTerm("");
                    }}
                    className="px-6 py-2 bg-[#1b3caf] hover:bg-[#1b3caf]/80 text-white rounded-lg transition"
                  >
                    Wyświetl wszystkie
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredModels.map((model) => (
                    <Link key={model.id} href={`/products/${model.id}`}>
                      <div className="group h-full cursor-pointer">
                        <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#1b3caf]/30 rounded-xl overflow-hidden transition duration-300 h-full flex flex-col">
                          {/* Image */}
                          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#242d3d] to-[#1a1f2e]">
                            {model.images && model.images.length > 0 ? (
                              <>
                                <img
                                  src={model.images[0].url}
                                  alt={model.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419]/60 via-transparent to-transparent" />
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#6b7280]">
                                Brak zdjęcia
                              </div>
                            )}
                            {model.featured && (
                              <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white text-xs font-bold rounded-full">
                                Bestseller
                              </div>
                            )}
                            {model.category && (
                              <div className="absolute top-3 left-3 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                                {model.category.name}
                              </div>
                            )}
                          </div>
                          {/* Info */}
                          <div className="p-3 flex flex-col flex-grow">
                            <h3 className="text-base font-bold text-white mb-1 group-hover:text-[#1b3caf] transition">
                              {model.name}
                            </h3>
                            {/* Specs Row */}
                            <div className="grid grid-cols-2 gap-1 mb-2 text-xs">
                              <div className="bg-white/5 p-1.5 rounded">
                                <p className="text-[#6b7280] text-[11px]">
                                  Moc
                                </p>
                                <p className="text-[#1b3caf] font-semibold">
                                  {model.power} KM
                                </p>
                              </div>
                              <div className="bg-white/5 p-1.5 rounded">
                                <p className="text-[#6b7280] text-[11px]">
                                  Waga
                                </p>
                                <p className="text-[#1b3caf] font-semibold">
                                  {model.weight}t
                                </p>
                              </div>
                            </div>
                            {/* Description */}
                            {model.description && (
                              <p className="text-[#b0b0b0] text-xs mb-2 line-clamp-2 flex-grow">
                                {model.description}
                              </p>
                            )}
                            {/* Price & Button */}
                            <div className="mt-auto pt-2 border-t border-white/10">
                              <p className="text-[#1b3caf] font-bold text-base mb-2">
                                Od {model.price.toLocaleString("en-US")} PLN
                              </p>
                              <button className="w-full px-3 py-2 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] hover:from-[#1b3caf]/80 hover:to-[#0f9fdf]/80 text-white font-bold rounded-lg transition duration-300 text-xs">
                                Dowiedz się więcej
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-[#0f1419]/80 border-t border-white/10 py-10 mt-16 relative z-10">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-20 text-center text-[#b0b0b0] text-base">
          <p>&copy; 2025 Rippa Polska. Wszystkie prawa zastrzeżone.</p>
        </div>
      </footer>
      {/* Animacje tła */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 0.4;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite;
        }
        @keyframes pulse-slow2 {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.3;
          }
        }
        .animate-pulse-slow2 {
          animation: pulse-slow2 10s infinite;
        }
      `}</style>
    </div>
  );
}
