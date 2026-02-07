"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag, X, FolderOpen } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { showToast } from "@/lib/toast";

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
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin");
  }, [status, router]);

  useEffect(() => {
    if (session?.user) fetchCategories();
  }, [session]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) setCategories(await response.json());
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
      if (!response.ok) throw new Error("Failed to save category");
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
      showToast(
        editingId ? "Kategoria zaktualizowana" : "Kategoria dodana",
        "success",
      );
    } catch (error) {
      console.error("Error saving category:", error);
      showToast("Błąd podczas zapisywania kategorii", "error");
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
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete category");
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast("Kategoria usunięta", "success");
    } catch (error) {
      console.error("Error deleting category:", error);
      showToast("Błąd podczas usuwania kategorii", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  if (status === "loading" || !session) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1b3caf] border-t-transparent" />
          <p className="text-[#8b92a9] text-sm">Ładowanie kategorii...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[#8b92a9] text-sm mb-1">Organizacja katalogu</p>
          <h2 className="text-3xl font-bold text-white">Kategorie</h2>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (editingId) setEditingId(null);
            if (!showForm) setFormData({ name: "", description: "" });
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-[#1b3caf]/30 hover:scale-105 transition-all duration-300"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Anuluj" : "Dodaj kategorię"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Tag className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">
                {editingId ? "Edytuj kategorię" : "Nowa kategoria"}
              </h3>
              <p className="text-xs text-[#8b92a9]">
                Slug zostanie wygenerowany automatycznie
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#b0b0b0] mb-2">
                Nazwa kategorii *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white/[5%] border border-white/10 rounded-xl text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf]/50 transition"
                placeholder="np. Mini koparka"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#b0b0b0] mb-2">
                Opis (opcjonalnie)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white/[5%] border border-white/10 rounded-xl text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf]/50 transition"
                placeholder="Opis kategorii..."
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#1b3caf]/30 transition-all duration-300 disabled:opacity-50 text-sm"
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
                className="px-6 py-2.5 bg-white/[5%] border border-white/10 text-[#b0b0b0] hover:text-white hover:bg-white/[8%] font-medium rounded-xl transition-all text-sm"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-400/10 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Lista kategorii</h3>
              <p className="text-xs text-[#8b92a9]">
                {categories.length} kategorii
              </p>
            </div>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <FolderOpen className="w-7 h-7 text-[#8b92a9]" />
            </div>
            <p className="text-white font-medium mb-1">Brak kategorii</p>
            <p className="text-[#8b92a9] text-sm">Dodaj pierwszą kategorię</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[6%]">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-white/[3%] transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-violet-400/10 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-semibold truncate">
                      {category.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#6b7280] bg-white/5 px-2 py-0.5 rounded-full">
                        {category.slug}
                      </span>
                      {category.description && (
                        <span className="text-xs text-[#8b92a9] truncate">
                          {category.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 rounded-lg text-[#8b92a9] hover:text-white hover:bg-white/10 transition-all"
                    title="Edytuj"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(category)}
                    className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
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

      <ConfirmModal
        open={!!deleteTarget}
        title="Usunąć kategorię?"
        message={`Czy na pewno chcesz usunąć kategorię „${deleteTarget?.name}"? Modele przypisane do tej kategorii zostaną bez kategorii.`}
        confirmLabel="Usuń kategorię"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
