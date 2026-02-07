"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  X,
  SlidersHorizontal,
  Pencil,
  Trash2,
  Layers,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { showToast } from "@/lib/toast";

export default function FeaturesAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [features, setFeatures] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const [form, setForm] = useState({
    categoryId: "",
    key: "",
    label: "",
    type: "text",
    options: "",
    required: false,
    order: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin");
  }, [status, router]);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/features");
      const data = await res.json();
      setFeatures(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories((await res.json()) || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        categoryId: form.categoryId || null,
        key: form.key,
        label: form.label,
        type: form.type,
        options: form.options ? JSON.parse(form.options) : null,
        required: !!form.required,
        order: Number(form.order) || 0,
      };
      const res = await fetch("/api/admin/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create feature");
      }
      setForm({
        categoryId: "",
        key: "",
        label: "",
        type: "text",
        options: "",
        required: false,
        order: 0,
      });
      setFormOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/features/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchData();
      showToast("Cecha usunięta", "success");
    } catch (err) {
      console.error(err);
      showToast("Nie udało się usunąć cechy", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-white/[5%] border border-white/10 rounded-xl text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf]/50 transition text-sm";
  const labelClass = "block text-sm font-medium text-[#b0b0b0] mb-2";

  const typeLabels: Record<string, string> = {
    text: "Tekst",
    number: "Liczba",
    boolean: "Tak/Nie",
    enum: "Wybór",
    date: "Data",
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[#8b92a9] text-sm mb-1">
            Definicje cech produktów
          </p>
          <h2 className="text-3xl font-bold text-white">Cechy</h2>
        </div>
        <button
          onClick={() => setFormOpen((s) => !s)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-[#1b3caf]/30 hover:scale-105 transition-all duration-300"
        >
          {formOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {formOpen ? "Anuluj" : "Dodaj cechę"}
        </button>
      </div>

      {/* Add Form */}
      {formOpen && (
        <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Nowa cecha</h3>
              <p className="text-xs text-[#8b92a9]">
                Definiuje pole danych dla produktów
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Kategoria (opcjonalnie)</label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Wszystkie (globalna)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Klucz *</label>
                <input
                  name="key"
                  value={form.key}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  placeholder="np. engine_type"
                />
              </div>
              <div>
                <label className={labelClass}>Etykieta *</label>
                <input
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  placeholder="np. Typ silnika"
                />
              </div>
              <div>
                <label className={labelClass}>Typ</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="text">Tekst</option>
                  <option value="number">Liczba</option>
                  <option value="boolean">Tak/Nie</option>
                  <option value="enum">Wybór (enum)</option>
                  <option value="date">Data</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>
                  Opcje (JSON array dla enum)
                </label>
                <textarea
                  name="options"
                  value={form.options}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder='np. ["Mini","Standard","Max"]'
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="required"
                  id="featureRequired"
                  checked={!!form.required}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#0f9fdf] rounded"
                />
                <label
                  htmlFor="featureRequired"
                  className="text-sm text-white cursor-pointer"
                >
                  Wymagane
                </label>
              </div>
              <div>
                <label className={labelClass}>Kolejność</label>
                <input
                  type="number"
                  name="order"
                  value={form.order}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#1b3caf]/30 transition-all duration-300 disabled:opacity-50 text-sm"
              >
                {saving ? "Zapisywanie..." : "Utwórz cechę"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Features List */}
      <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-400/10 rounded-lg flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Lista cech</h3>
              <p className="text-xs text-[#8b92a9]">
                {features.length} zdefiniowanych
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1b3caf] border-t-transparent" />
              <p className="text-[#8b92a9] text-sm">Ładowanie...</p>
            </div>
          </div>
        ) : features.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Layers className="w-7 h-7 text-[#8b92a9]" />
            </div>
            <p className="text-white font-medium mb-1">
              Brak zdefiniowanych cech
            </p>
            <p className="text-[#8b92a9] text-sm">
              Dodaj cechy, aby definiować dane produktów
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[6%]">
            {features.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-white/[3%] transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center flex-shrink-0">
                    <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold truncate">
                        {f.label}
                      </p>
                      <span className="text-[10px] text-[#6b7280] bg-white/5 px-2 py-0.5 rounded-full">
                        {f.key}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#8b92a9]">
                        {typeLabels[f.type] || f.type}
                      </span>
                      <span className="text-xs text-[#6b7280]">•</span>
                      <span className="text-xs text-[#6b7280]">
                        {f.categoryId
                          ? `Kategoria: ${f.categoryId}`
                          : "Globalna"}
                      </span>
                      {f.required && (
                        <>
                          <span className="text-xs text-[#6b7280]">•</span>
                          <span className="text-xs text-amber-400">
                            Wymagane
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                  <Link
                    href={`/admin/features/${f.id}/edit`}
                    className="p-2 rounded-lg text-[#8b92a9] hover:text-white hover:bg-white/10 transition-all"
                    title="Edytuj"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(f)}
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
        title="Usunąć cechę?"
        message={`Czy na pewno chcesz usunąć cechę „${deleteTarget?.label}"? To działanie jest nieodwracalne.`}
        confirmLabel="Usuń cechę"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
