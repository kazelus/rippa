"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ArrowRight, ExternalLink } from "lucide-react";

interface ModelWithAccessories {
  id: string;
  name: string;
  accessories: Array<{
    id: string;
    name: string;
    imageUrl: string | null;
    price: string | null;
  }>;
}

export default function AdminAccessoriesPage() {
  const [models, setModels] = useState<ModelWithAccessories[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const modelsRes = await fetch("/api/models?all=true");
      if (!modelsRes.ok) return;
      const allModels = await modelsRes.json();

      const results: ModelWithAccessories[] = [];
      for (const m of allModels) {
        try {
          const accRes = await fetch(`/api/admin/accessories?modelId=${m.id}`);
          if (accRes.ok) {
            const accData = await accRes.json();
            if (accData.length > 0) {
              results.push({ id: m.id, name: m.name, accessories: accData });
            }
          }
        } catch {}
      }
      setModels(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const totalAccessories = models.reduce(
    (sum, m) => sum + m.accessories.length,
    0,
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <p className="text-[#8b92a9] text-sm mb-1">Przegląd powiązań</p>
        <h2 className="text-3xl font-bold text-white">Akcesoria</h2>
        <p className="text-[#8b92a9] text-sm mt-2">
          Aby edytować akcesoria, przejdź do edycji danego modelu → zakładka
          &quot;Akcesoria&quot;.
        </p>
      </div>

      {/* Stats */}
      {!isLoading && models.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl p-5">
            <p className="text-xs text-[#8b92a9] mb-1">Modele z akcesoriami</p>
            <p className="text-2xl font-bold text-white">{models.length}</p>
          </div>
          <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl p-5">
            <p className="text-xs text-[#8b92a9] mb-1">Łącznie akcesoriów</p>
            <p className="text-2xl font-bold text-white">{totalAccessories}</p>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl">
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1b3caf] border-t-transparent" />
              <p className="text-[#8b92a9] text-sm">Ładowanie...</p>
            </div>
          </div>
        </div>
      ) : models.length === 0 ? (
        <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl">
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-[#8b92a9]" />
            </div>
            <p className="text-white font-medium mb-1">
              Brak przypisanych akcesoriów
            </p>
            <p className="text-[#8b92a9] text-sm">
              Aby dodać akcesoria, edytuj dowolny model i przejdź do zakładki
              &quot;Akcesoria&quot;.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {models.map((model) => (
            <div
              key={model.id}
              className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1b3caf]/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-[#0f9fdf]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{model.name}</h3>
                    <p className="text-xs text-[#8b92a9]">
                      {model.accessories.length} akcesoriów
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/products/${model.id}`}
                    target="_blank"
                    className="p-2 rounded-lg text-[#8b92a9] hover:text-white hover:bg-white/10 transition-all"
                    title="Zobacz na stronie"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/admin/models/${model.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 bg-white/[5%] border border-white/10 rounded-xl text-sm text-[#8b92a9] hover:text-white hover:bg-white/10 transition-all"
                  >
                    Edytuj akcesoria
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {model.accessories.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center gap-3 bg-white/[3%] border border-white/[6%] rounded-xl p-3 hover:bg-white/[6%] transition-colors"
                  >
                    {acc.imageUrl ? (
                      <img
                        src={acc.imageUrl}
                        alt={acc.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-[#6b7280]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">
                        {acc.name}
                      </p>
                      {acc.price && (
                        <p className="text-[#0f9fdf] text-xs font-medium">
                          {Math.round(Number(acc.price))
                            .toLocaleString("pl-PL")
                            .replace(/,/g, " ")}{" "}
                          PLN
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
