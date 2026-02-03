"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import AdminTile from "@/components/AdminTile";

export default function AdminDashboard() {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch("/api/models");
      const data = await response.json();
      setModels(data);
    } catch (error) {
      console.error("Error fetching models:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Na pewno chcesz usunąć ten model? Akcji nie da się cofnąć.",
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      const response = await fetch(`/api/models/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Błąd podczas usuwania");
      }
      setModels((prev) => prev.filter((m: any) => m.id !== id));
    } catch (error) {
      console.error("Error deleting model:", error);
      alert("Błąd podczas usuwania modelu");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <p className="text-white">Ładowanie modeli...</p>;
  }

  return (
    <div>
      {/* Navigation */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <AdminTile href="/admin/models/new" title="Dodaj nowy model">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </AdminTile>

          <AdminTile href="/admin/models" title="Zarządzaj modelami">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="4" y="7" width="16" height="13" rx="2" />
              <path d="M8 7V5a4 4 0 018 0v2" />
            </svg>
          </AdminTile>

          <AdminTile href="/admin/contacts" title="Zgłoszenia kontaktowe">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 8V7a2 2 0 00-2-2H5a2 2 0 00-2 2v1" />
              <rect x="3" y="8" width="18" height="10" rx="2" />
              <path d="M7 12h10M7 16h6" />
            </svg>
          </AdminTile>

          <AdminTile href="/admin/settings/smtp" title="Ustawienia">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 8v4l3 3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82L4.21 3.4A2 2 0 016.04.57l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V1a2 2 0 014 0v.09c.12.83.66 1.48 1.51 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.01.83.66 1.48 1.51 1.51H21a2 2 0 010 4h-.06c-.85.03-1.5.68-1.51 1.51v.09c0 .58.36 1.09.92 1.37z" />
            </svg>
          </AdminTile>
          <AdminTile href="/admin/categories" title="Zarządzaj kategoriami">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M9 9h6v6H9z" />
            </svg>
          </AdminTile>

          <AdminTile href="/admin/features" title="Zarządzaj cechami">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </AdminTile>

          <AdminTile href="/admin/users" title="Zarządzaj użytkownikami">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 7a4 4 0 11-8 0 4 4 0 018 0zM6.5 20H.5" />
            </svg>
          </AdminTile>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl p-8">
          <p className="text-[#b0b0b0] text-sm mb-2">Wszystkie modele</p>
          <p className="text-4xl font-bold text-[#1b3caf]">{models.length}</p>
        </div>
        <div className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl p-8">
          <p className="text-[#b0b0b0] text-sm mb-2">Modele aktywne</p>
          <p className="text-4xl font-bold text-[#1b3caf]">
            {models.filter((m: any) => m.featured).length}
          </p>
        </div>
        <div className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl p-8">
          <p className="text-[#b0b0b0] text-sm mb-2">Ostatnia aktualizacja</p>
          <p className="text-lg font-semibold text-white">
            {new Date().toLocaleDateString("pl-PL")}
          </p>
        </div>
      </div>

      {/* Models List */}
      <div className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6">Modele</h3>

        {isLoading ? (
          <p className="text-[#b0b0b0]">Ładowanie modeli...</p>
        ) : models.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#b0b0b0] mb-4">Brak modeli w bazie</p>
            <Link href="/admin/models/new">
              <Button variant="primary">Stwórz pierwszy model</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {models.map((model: any) => (
              <div
                key={model.id}
                className="p-4 bg-[#242d3d] rounded-lg border border-[#1b3caf]/20 hover:border-[#1b3caf]/50 transition"
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  {model.images && model.images.length > 0 ? (
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={model.images[0].url}
                        alt={model.images[0].alt || model.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-[#1a1f2e] border border-[#1b3caf]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#6b7280] text-xs">
                        Brak zdjęcia
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-semibold">{model.name}</h4>
                      {model.featured && (
                        <span className="px-2 py-1 bg-[#1b3caf]/30 text-[#1b3caf] text-xs font-semibold rounded-full">
                          Wyróżniony
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#b0b0b0] mb-2">
                      Moc: {model.power} | Cena: {model.price}
                    </p>
                    <p className="text-xs text-[#6b7280]">
                      Zdjęcia: {model.images?.length || 0}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/admin/models/${model.id}/edit`}>
                      <Button variant="outline" className="text-xs">
                        Edytuj
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDelete(model.id)}
                      disabled={deletingId === model.id}
                      className="px-3 py-1 text-xs text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition disabled:opacity-50"
                    >
                      {deletingId === model.id ? "Usuwanie..." : "Usuń"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
