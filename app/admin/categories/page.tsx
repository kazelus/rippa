"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2, Edit2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function AdminCategories() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchCategories();
    }
  }, [session]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/categories/${editingId}`
        : "/api/categories";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save category");
      }

      const newCategory = await response.json();

      if (editingId) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? newCategory : c)),
        );
      } else {
        setCategories((prev) => [newCategory, ...prev]);
      }

      setFormData({ name: "", description: "" });
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Błąd podczas zapisywania kategorii");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Na pewno chcesz usunąć tę kategorię?")) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Błąd podczas usuwania kategorii");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e] flex items-center justify-center">
        <p className="text-white">Ładowanie...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e]">
      {/* Header */}
      <header className="bg-[#1a1f2e] border-b border-[#1b3caf]/30 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Kategorie</h1>
            <p className="text-sm text-[#b0b0b0]">Zarządzanie kategorii</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Add Button */}
          <div className="mb-8">
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (editingId) setEditingId(null);
                if (!showForm) {
                  setFormData({ name: "", description: "" });
                }
              }}
              className="flex items-center gap-2 px-6 py-2 bg-[#1b3caf] hover:bg-[#1b3caf]/80 text-white font-bold rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Dodaj kategorię
            </button>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl p-8 mb-8">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingId ? "Edytuj kategorię" : "Dodaj nową kategorię"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Nazwa kategorii *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf]"
                    placeholder="np. Mini koparka"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Opis (opcjonalnie)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf]"
                    placeholder="Opis kategorii..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[#1b3caf] hover:bg-[#1b3caf]/80 disabled:opacity-50 text-white font-bold rounded-lg transition"
                  >
                    {isSubmitting ? "Zapisuję..." : "Zapisz"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({ name: "", description: "" });
                    }}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Categories List */}
          <div className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Kategorie</h2>

            {isLoading ? (
              <p className="text-[#b0b0b0]">Ładowanie kategorii...</p>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#b0b0b0]">Brak kategorii</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:border-[#1b3caf]/30 transition"
                  >
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-[#b0b0b0] text-sm">
                          {category.description}
                        </p>
                      )}
                      <p className="text-[#6b7280] text-xs mt-1">
                        Slug: {category.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-[#1b3caf] hover:bg-white/10 rounded-lg transition"
                        title="Edytuj"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-400 hover:bg-white/10 rounded-lg transition"
                        title="Usuń"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
