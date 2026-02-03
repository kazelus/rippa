"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ChevronLeft } from "lucide-react";
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
      <div className="flex items-center mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#b0b0b0] hover:text-white transition"
        >
          <ChevronLeft className="w-5 h-5" />
          Powrót do strony głównej
        </Link>
      </div>

      <h1 className="text-4xl font-bold text-white mb-8">Nasze produkty</h1>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b92a9] w-5 h-5" />
            <input
              type="text"
              placeholder="Szukaj modelu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#8b92a9] focus:outline-none focus:ring-2 focus:ring-[#1b3caf]"
            />
          </div>

          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1b3caf]"
          >
            <option value="">Wszystkie kategorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowBestsellers(!showBestsellers)}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              showBestsellers
                ? "bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white"
                : "bg-white/5 border border-white/10 text-[#b0b0b0] hover:text-white"
            }`}
          >
            {showBestsellers ? "Wszystkie" : "Bestsellery"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b3caf] mx-auto"></div>
          <p className="text-[#b0b0b0] mt-4">Ładowanie produktów...</p>
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#b0b0b0] text-lg">
            Nie znaleziono produktów spełniających kryteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              className="group bg-gradient-to-br from-white/5 to-white/[2%] border border-white/10 rounded-xl overflow-hidden hover:border-[#1b3caf]/50 transition duration-300"
            >
              <div className="relative h-56 overflow-hidden bg-[#0f1419]">
                {model.images && model.images.length > 0 ? (
                  <img
                    src={model.images[0].url}
                    alt={model.images[0].alt || model.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8b92a9]">
                    Brak zdjęcia
                  </div>
                )}
                {model.featured && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white px-3 py-1 rounded-full text-sm font-bold">
                    Bestseller
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {model.name}
                </h3>
                <p className="text-[#b0b0b0] text-sm mb-4 line-clamp-2">
                  {model.description}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="text-[#8b92a9]">
                    <span className="text-white font-semibold">
                      {model.power}
                    </span>{" "}
                    KM
                  </div>
                  <div className="text-[#8b92a9]">
                    <span className="text-white font-semibold">
                      {model.depth}
                    </span>{" "}
                    mm
                  </div>
                  <div className="text-[#8b92a9]">
                    <span className="text-white font-semibold">
                      {model.weight}
                    </span>{" "}
                    kg
                  </div>
                  <div className="text-[#8b92a9]">
                    <span className="text-white font-semibold">
                      {model.bucket}
                    </span>{" "}
                    L
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[#8b92a9] text-xs">Od</p>
                    <p className="text-white text-2xl font-bold">
                      {model.price.toLocaleString("pl-PL")} PLN
                    </p>
                  </div>
                  <Link href={`/products/${model.id}`}>
                    <Button variant="outline">Zobacz więcej</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
