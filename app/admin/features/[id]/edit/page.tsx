"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function EditFeaturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

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
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin");
  }, [status, router]);

  useEffect(() => {
    if (id) {
      fetchFeature();
      fetchCategories();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } catch (err) {}
  };

  const fetchFeature = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/features/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setForm({
        categoryId: data.categoryId || "",
        key: data.key,
        label: data.label,
        type: data.type,
        options: data.options ? JSON.stringify(data.options) : "",
        required: !!data.required,
        order: data.order || 0,
      });
    } catch (err) {
      console.error(err);
      setError("Nie można wczytać cechy");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
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

      const res = await fetch(`/api/admin/features/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin/features");
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Usuń cechę?")) return;
    try {
      const res = await fetch(`/api/admin/features/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/admin/features");
    } catch (err) {
      alert("Nie udało się usunąć");
    }
  };

  if (status === "loading" || loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Ładowanie...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e]">
      <header className="bg-[#1a1f2e] border-b border-[#1b3caf]/30">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Edytuj cechę</h1>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-12 max-w-3xl mx-auto">
        <div className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl p-6">
          {error && <p className="text-red-400 mb-3">{error}</p>}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm text-white block mb-1">
                Kategoria (opcjonalnie)
              </label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-[#1a1f2e] text-white border border-[#1b3caf]/20"
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
              <label className="text-sm text-white block mb-1">Klucz</label>
              <input
                name="key"
                value={form.key}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-[#1a1f2e] text-white border border-[#1b3caf]/20"
                required
              />
            </div>

            <div>
              <label className="text-sm text-white block mb-1">Etykieta</label>
              <input
                name="label"
                value={form.label}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-[#1a1f2e] text-white border border-[#1b3caf]/20"
                required
              />
            </div>

            <div>
              <label className="text-sm text-white block mb-1">Typ</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-[#1a1f2e] text-white border border-[#1b3caf]/20"
              >
                <option value="text">Tekst</option>
                <option value="number">Liczba</option>
                <option value="boolean">Tak/Nie</option>
                <option value="enum">Wybór (enum)</option>
                <option value="date">Data</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white block mb-1">
                Opcje (JSON)
              </label>
              <textarea
                name="options"
                value={form.options}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-[#1a1f2e] text-white border border-[#1b3caf]/20"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm text-white block">Wymagane</label>
              <input
                type="checkbox"
                name="required"
                checked={form.required}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm text-white block mb-1">Kolejność</label>
              <input
                type="number"
                name="order"
                value={form.order}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-[#1a1f2e] text-white border border-[#1b3caf]/20"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#1b3caf] text-white px-4 py-2 rounded"
              >
                {saving ? "Zapisywanie..." : "Zapisz"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Usuń
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
