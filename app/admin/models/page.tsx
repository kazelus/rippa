"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Package,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  Star,
  ImageIcon,
  Copy,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { showToast } from "@/lib/toast";

interface Model {
  id: string;
  name: string;
  description: string;
  power?: string;
  depth?: string;
  weight?: string;
  bucket?: string;
  price: string;
  featured: boolean;
  visible: boolean;
  categoryId: string;
  category?: { name: string } | null;
  images: Array<{ url: string; alt: string }>;
}

export default function ModelsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "visible" | "hidden" | "featured"
  >("all");
  const [deleteTarget, setDeleteTarget] = useState<Model | null>(null);
  const [cloning, setCloning] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin");
  }, [status, router]);

  useEffect(() => {
    if (session?.user) fetchModels();
  }, [session]);

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/models?all=true");
      if (!response.ok) throw new Error("Failed to fetch models");
      setModels(await response.json());
    } catch (err: any) {
      setError(err.message || "Failed to load models");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/models/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete model");
      setModels((prev) => prev.filter((m) => m.id !== id));
      showToast("Model został usunięty", "success");
    } catch (err: any) {
      showToast(err.message || "Nie udało się usunąć modelu", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const toggleVisibility = async (model: Model) => {
    try {
      const res = await fetch(`/api/models/${model.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !model.visible }),
      });
      if (res.ok) {
        setModels((prev) =>
          prev.map((m) =>
            m.id === model.id ? { ...m, visible: !m.visible } : m,
          ),
        );
      }
    } catch (err) {
      console.error("Error toggling visibility:", err);
    }
  };

  const handleClone = async (model: Model) => {
    try {
      setCloning(model.id);
      const res = await fetch(`/api/models/${model.id}/clone`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Nie udało się skopiować modelu");
      const cloned = await res.json();
      showToast(`Model „${model.name}" został skopiowany`, "success");
      router.push(`/admin/models/${cloned.id}/edit`);
    } catch (err: any) {
      showToast(err.message || "Nie udało się skopiować modelu", "error");
    } finally {
      setCloning(null);
    }
  };

  const filtered = models.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    if (filter === "visible") return matchSearch && m.visible !== false;
    if (filter === "hidden") return matchSearch && m.visible === false;
    if (filter === "featured") return matchSearch && m.featured;
    return matchSearch;
  });

  const visibleCount = models.filter((m) => m.visible !== false).length;
  const hiddenCount = models.filter((m) => m.visible === false).length;
  const featuredCount = models.filter((m) => m.featured).length;

  if (status === "loading" || isLoading || !session) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1b3caf] border-t-transparent" />
          <p className="text-[#8b92a9] text-sm">Ładowanie modeli...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[#8b92a9] text-sm mb-1">Zarządzanie produktami</p>
          <h2 className="text-3xl font-bold text-white">Modele</h2>
        </div>
        <Link
          href="/admin/models/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-[#1b3caf]/30 hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Nowy model
        </Link>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: "all" as const, label: "Wszystkie", count: models.length },
          { key: "visible" as const, label: "Widoczne", count: visibleCount },
          { key: "hidden" as const, label: "Ukryte", count: hiddenCount },
          {
            key: "featured" as const,
            label: "Bestsellery",
            count: featuredCount,
          },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              filter === f.key
                ? "bg-[#1b3caf] text-white shadow-lg shadow-[#1b3caf]/20"
                : "bg-white/[5%] text-[#8b92a9] border border-white/10 hover:bg-white/[8%] hover:text-white"
            }`}
          >
            {f.label}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${filter === f.key ? "bg-white/20" : "bg-white/10"}`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj modelu..."
          className="w-full pl-11 pr-4 py-3 bg-white/[5%] border border-white/10 rounded-xl text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf]/50 transition"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Models table */}
      <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-[#8b92a9]" />
            </div>
            <p className="text-white font-medium mb-1">Brak modeli</p>
            <p className="text-[#8b92a9] text-sm mb-4">
              {search
                ? "Zmień kryteria wyszukiwania"
                : "Dodaj pierwszy model do katalogu"}
            </p>
            {!search && (
              <Link
                href="/admin/models/new"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Dodaj model
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#8b92a9] uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#8b92a9] uppercase tracking-wider hidden md:table-cell">
                    Cena
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-[#8b92a9] uppercase tracking-wider hidden lg:table-cell">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#8b92a9] uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[6%]">
                {filtered.map((model) => (
                  <tr
                    key={model.id}
                    className="hover:bg-white/[3%] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {model.images?.[0] ? (
                          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                            <img
                              src={model.images[0].url}
                              alt={model.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-5 h-5 text-[#6b7280]" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-semibold truncate">
                              {model.name}
                            </p>
                            {model.featured && (
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {model.category && (
                              <span className="text-xs text-[#8b92a9] bg-white/5 px-2 py-0.5 rounded-full">
                                {model.category.name}
                              </span>
                            )}
                            <span className="text-xs text-[#6b7280]">
                              {model.images?.length || 0} zdjęć
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-white font-medium tabular-nums">
                        {model.price
                          ? `${Number(model.price).toLocaleString("pl-PL")} PLN`
                          : "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex justify-center">
                        {model.visible !== false ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                            <Eye className="w-3 h-3" /> Widoczny
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
                            <EyeOff className="w-3 h-3" /> Ukryty
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/products/${model.id}`}
                          target="_blank"
                          className="p-2 rounded-lg text-[#8b92a9] hover:text-[#0f9fdf] hover:bg-[#0f9fdf]/10 transition-all"
                          title="Zobacz na stronie"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => toggleVisibility(model)}
                          className={`p-2 rounded-lg transition-all ${model.visible !== false ? "text-emerald-400 hover:bg-emerald-400/10" : "text-red-400 hover:bg-red-400/10"}`}
                          title={
                            model.visible !== false
                              ? "Ukryj model"
                              : "Pokaż model"
                          }
                        >
                          {model.visible !== false ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleClone(model)}
                          disabled={cloning === model.id}
                          className="p-2 rounded-lg text-[#8b92a9] hover:text-[#0f9fdf] hover:bg-[#0f9fdf]/10 transition-all disabled:opacity-40"
                          title="Kopiuj model"
                        >
                          <Copy
                            className={`w-4 h-4 ${cloning === model.id ? "animate-pulse" : ""}`}
                          />
                        </button>
                        <Link
                          href={`/admin/models/${model.id}/edit`}
                          className="p-2 rounded-lg text-[#8b92a9] hover:text-white hover:bg-white/10 transition-all"
                          title="Edytuj"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(model)}
                          className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
                          title="Usuń"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Usunąć model?"
        message={`Czy na pewno chcesz usunąć model „${deleteTarget?.name}"? To działanie jest nieodwracalne — zostaną usunięte wszystkie zdjęcia, sekcje i pliki powiązane z tym modelem.`}
        confirmLabel="Usuń model"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
