"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function FeaturesAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [features, setFeatures] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
      }
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
    if (!confirm("Usuń cechę? To działanie jest nieodwracalne.")) return;
    try {
      const res = await fetch(`/api/admin/features/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Nie udało się usunąć cechy");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e]">
      <header className="bg-[#1a1f2e] border-b border-[#1b3caf]/30">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Zarządzaj cechami</h1>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto">
        <div className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-white font-semibold">Lista cech</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFormOpen((s) => !s)}
                className="bg-[#1b3caf] text-white px-4 py-2 rounded"
              >
                {formOpen ? "Anuluj" : "Dodaj nową cechę"}
              </button>
            </div>
          </div>

          {formOpen && (
            <form
              onSubmit={handleCreate}
              className="mb-6 p-4 bg-[#242d3d] rounded"
            >
              {error && <p className="text-red-400 mb-2">{error}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  <label className="text-sm text-white block mb-1">
                    Etykieta
                  </label>
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
                <div className="md:col-span-2">
                  <label className="text-sm text-white block mb-1">
                    Opcje (JSON array dla enum lub pusty)
                  </label>
                  <textarea
                    name="options"
                    value={form.options}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded bg-[#1a1f2e] text-white border border-[#1b3caf]/20"
                    placeholder='e.g. ["Mini","Standard","Max"]'
                  />
                </div>
                <div>
                  <label className="text-sm text-white block mb-1">
                    Wymagane
                  </label>
                  <input
                    type="checkbox"
                    name="required"
                    checked={!!form.required}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-sm text-white block mb-1">
                    Kolejność
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={form.order}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded bg-[#1a1f2e] text-white border border-[#1b3caf]/20"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 px-4 py-2 rounded text-white"
                >
                  {saving ? "Zapisywanie..." : "Utwórz cechę"}
                </button>
              </div>
            </form>
          )}

          <div>
            {loading ? (
              <p className="text-white">Ładowanie...</p>
            ) : (
              <div className="space-y-2">
                {features.length === 0 && (
                  <p className="text-white">Brak zdefiniowanych cech.</p>
                )}
                {features.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 bg-[#242d3d] rounded flex items-center justify-between"
                  >
                    <div>
                      <div className="text-white font-medium">
                        {f.label}{" "}
                        <span className="text-xs text-[#6b7280]">
                          ({f.key})
                        </span>
                      </div>
                      <div className="text-sm text-[#9ca3af]">
                        Typ: {f.type}{" "}
                        {f.categoryId
                          ? `• Kategoria: ${f.categoryId}`
                          : "• Globalna"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/features/${f.id}/edit`}
                        className="text-sm text-[#1b3caf]"
                      >
                        Edytuj
                      </Link>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="text-red-400 text-sm"
                      >
                        Usuń
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
