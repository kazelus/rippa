"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";

interface Model {
  id: string;
  name: string;
  description: string;
  power: string;
  depth: string;
  weight: string;
  bucket: string;
  price: string;
  featured: boolean;
  categoryId: string;
  images: Array<{ url: string; alt: string }>;
}

export default function ModelsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchModels();
    }
  }, [session]);

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/models");
      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }
      const data = await response.json();
      setModels(data);
    } catch (err: any) {
      setError(err.message || "Failed to load models");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten model?")) {
      return;
    }

    try {
      const response = await fetch(`/api/models/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete model");
      }

      setModels((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete model");
    }
  };

  if (status === "loading" || isLoading || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e] flex items-center justify-center">
        <p className="text-white">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e]">
      {/* Header */}
      <header className="bg-[#1a1f2e] border-b border-[#1b3caf]/30">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Modele mini-kopiarek
            </h1>
            <p className="text-[#b0b0b0] text-sm mt-1">
              {models.length} modeli
            </p>
          </div>
          <Link href="/admin/models/new">
            <Button variant="primary">+ Dodaj model</Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {models.length === 0 ? (
          <div className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl p-12 text-center">
            <p className="text-[#b0b0b0] mb-6">Brak modeli do wyświetlenia</p>
            <Link href="/admin/models/new">
              <Button variant="primary">Dodaj pierwszy model</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <div
                key={model.id}
                className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl overflow-hidden hover:border-[#1b3caf]/60 transition"
              >
                {/* Image */}
                {model.images?.[0] && (
                  <div className="relative h-48 bg-[#242d3d] overflow-hidden">
                    <img
                      src={model.images[0].url}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                    {model.featured && (
                      <div className="absolute top-3 right-3 bg-yellow-500/80 text-white text-xs font-bold px-2 py-1 rounded">
                        BESTSELLER
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {model.name}
                  </h3>

                  {/* Specs */}
                  <div className="space-y-1 text-sm text-[#b0b0b0] mb-4">
                    <p>
                      <span className="text-[#6b7280]">Moc:</span> {model.power}
                    </p>
                    <p>
                      <span className="text-[#6b7280]">Głębokość:</span>{" "}
                      {model.depth}
                    </p>
                    <p>
                      <span className="text-[#6b7280]">Masa:</span>{" "}
                      {model.weight}
                    </p>
                    <p>
                      <span className="text-[#6b7280]">Cena:</span>{" "}
                      {model.price}
                    </p>
                  </div>

                  {/* Images count */}
                  {model.images && model.images.length > 0 && (
                    <p className="text-xs text-[#6b7280] mb-4">
                      {model.images.length} zdjęć
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/models/${model.id}/edit`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full text-sm">
                        Edytuj
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDelete(model.id)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
