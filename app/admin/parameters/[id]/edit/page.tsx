"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";

export default function EditParameterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [parameterId, setParameterId] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);
  const [existingGroups, setExistingGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showNewGroup, setShowNewGroup] = useState(false);

  const [form, setForm] = useState({
    categoryId: "",
    key: "",
    label: "",
    unit: "",
    type: "text",
    options: "",
    required: false,
    order: 0,
    group: "",
    newGroup: "",
    isQuickSpec: false,
    quickSpecOrder: 0,
    quickSpecLabel: "",
  });

  useEffect(() => {
    params.then((p) => setParameterId(p.id));
  }, [params]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin");
  }, [status, router]);

  useEffect(() => {
    if (parameterId) {
      fetchParameter();
      fetchCategories();
      fetchGroups();
    }
  }, [parameterId]);

  const fetchParameter = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/parameters/${parameterId}`);
      if (!res.ok) throw new Error("Failed to fetch parameter");
      const data = await res.json();
      setForm({
        categoryId: data.categoryId || "",
        key: data.key || "",
        label: data.label || "",
        unit: data.unit || "",
        type: data.type || "text",
        options: data.options ? JSON.stringify(data.options, null, 2) : "",
        required: !!data.required,
        order: data.order || 0,
        group: data.group || "",
        newGroup: "",
        isQuickSpec: !!data.isQuickSpec,
        quickSpecOrder: data.quickSpecOrder || 0,
        quickSpecLabel: data.quickSpecLabel || "",
      });
    } catch (err) {
      console.error(err);
      setError("Nie udało się załadować parametru");
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

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/admin/parameters/groups");
      if (res.ok) {
        const data = await res.json();
        setExistingGroups(data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const finalGroup =
        showNewGroup && form.newGroup.trim()
          ? form.newGroup.trim()
          : form.group || null;

      const payload = {
        categoryId: form.categoryId || null,
        key: form.key,
        label: form.label,
        unit: form.unit || null,
        type: form.type,
        options: form.options ? JSON.parse(form.options) : null,
        required: !!form.required,
        order: Number(form.order) || 0,
        group: finalGroup,
        isQuickSpec: !!form.isQuickSpec,
        quickSpecOrder: Number(form.quickSpecOrder) || 0,
        quickSpecLabel: form.quickSpecLabel || null,
      };

      const res = await fetch(`/api/admin/parameters/${parameterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update parameter");
      }

      router.push("/admin/parameters");
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen fullScreen={false} message="Ładowanie parametru..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e]">
      <header className="bg-[#1a1f2e] border-b border-[#1b3caf]/30 sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/parameters"
              className="text-[#6b7280] hover:text-white transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-white">Edytuj parametr</h1>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto">
        <div className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kategoria */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Kategoria (opcjonalnie)
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white focus:border-[#1b3caf] focus:outline-none transition"
                >
                  <option value="">Wszystkie (globalna)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[#6b7280] mt-1">
                  Pozostaw puste dla parametru globalnego
                </p>
              </div>

              {/* Klucz */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Klucz *
                </label>
                <input
                  name="key"
                  value={form.key}
                  onChange={handleChange}
                  placeholder="np. engine_power"
                  className="w-full px-4 py-3 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white focus:border-[#1b3caf] focus:outline-none transition"
                  required
                />
                <p className="text-xs text-[#6b7280] mt-1">
                  Unikalny identyfikator (snake_case)
                </p>
              </div>

              {/* Etykieta */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Etykieta *
                </label>
                <input
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  placeholder="np. Moc silnika"
                  className="w-full px-4 py-3 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white focus:border-[#1b3caf] focus:outline-none transition"
                  required
                />
                <p className="text-xs text-[#6b7280] mt-1">
                  Wyświetlana nazwa parametru
                </p>
              </div>

              {/* Jednostka */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Jednostka (opcjonalnie)
                </label>
                <input
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  placeholder="np. kW, mm, kg, bar"
                  className="w-full px-4 py-3 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white focus:border-[#1b3caf] focus:outline-none transition"
                />
                <p className="text-xs text-[#6b7280] mt-1">
                  Jednostka miary (wyświetlana po wartości)
                </p>
              </div>

              {/* Typ */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Typ danych *
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white focus:border-[#1b3caf] focus:outline-none transition"
                >
                  <option value="text">Tekst</option>
                  <option value="number">Liczba</option>
                  <option value="boolean">Tak/Nie</option>
                  <option value="enum">Wybór (enum)</option>
                </select>
              </div>

              {/* Kolejność */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Kolejność
                </label>
                <input
                  type="number"
                  name="order"
                  value={form.order}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white focus:border-[#1b3caf] focus:outline-none transition"
                />
                <p className="text-xs text-[#6b7280] mt-1">
                  Niższa liczba = wyższa pozycja
                </p>
              </div>
            </div>

            {/* Grupa */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Grupa parametrów
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewGroup(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border transition ${
                    !showNewGroup
                      ? "bg-[#1b3caf] border-[#1b3caf] text-white"
                      : "bg-[#151a24] border-[#1b3caf]/20 text-[#6b7280] hover:text-white"
                  }`}
                >
                  Wybierz istniejącą
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewGroup(true)}
                  className={`flex-1 px-4 py-2 rounded-lg border transition ${
                    showNewGroup
                      ? "bg-[#1b3caf] border-[#1b3caf] text-white"
                      : "bg-[#151a24] border-[#1b3caf]/20 text-[#6b7280] hover:text-white"
                  }`}
                >
                  Dodaj nową
                </button>
              </div>

              {!showNewGroup ? (
                <select
                  name="group"
                  value={form.group}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white focus:border-[#1b3caf] focus:outline-none transition"
                >
                  <option value="">Brak grupy (Ogólne)</option>
                  {existingGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name="newGroup"
                  value={form.newGroup}
                  onChange={handleChange}
                  placeholder="np. Silnik, Wymiary, Hydraulika"
                  className="w-full px-4 py-3 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white focus:border-[#1b3caf] focus:outline-none transition"
                />
              )}

              <p className="text-xs text-[#6b7280]">
                Parametry z tą samą grupą będą wyświetlane razem w zakładce na
                stronie produktu
              </p>
            </div>

            {/* Opcje dla enum */}
            {form.type === "enum" && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Opcje (JSON array) <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="options"
                  value={form.options}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white focus:border-[#1b3caf] focus:outline-none transition font-mono text-sm"
                  placeholder='["Opcja 1", "Opcja 2", "Opcja 3"]'
                  rows={4}
                />
                <p className="text-xs text-[#6b7280] mt-1">
                  Format: tablica JSON ze stringami
                </p>
              </div>
            )}

            {/* Warianty cenowe zarządzane na poziomie modelu */}

            {/* Quick Spec toggle */}
            <div className="space-y-3 pt-2 border-t border-[#1b3caf]/20">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isQuickSpec"
                  id="isQuickSpec"
                  checked={form.isQuickSpec}
                  onChange={handleChange}
                  className="w-5 h-5 accent-[#0f9fdf] rounded"
                />
                <label
                  htmlFor="isQuickSpec"
                  className="text-sm text-white cursor-pointer"
                >
                  Pokaż w podglądzie (Quick Spec)
                </label>
              </div>
              <p className="text-xs text-[#6b7280]">
                Wyświetlaj ten parametr jako skrócone info na kartach produktów
                i w sekcji hero. Wartość zmieni się automatycznie przy wyborze
                wariantu.
              </p>

              {form.isQuickSpec && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Kolejność Quick Spec
                    </label>
                    <input
                      type="number"
                      name="quickSpecOrder"
                      value={form.quickSpecOrder}
                      onChange={handleChange}
                      min="1"
                      max="6"
                      className="w-full px-4 py-3 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white focus:border-[#1b3caf] focus:outline-none transition"
                    />
                    <p className="text-xs text-[#6b7280] mt-1">Pozycja 1-6</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Skrócona etykieta
                    </label>
                    <input
                      name="quickSpecLabel"
                      value={form.quickSpecLabel}
                      onChange={handleChange}
                      placeholder="np. Moc (zamiast Moc silnika)"
                      className="w-full px-4 py-3 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white focus:border-[#1b3caf] focus:outline-none transition"
                    />
                    <p className="text-xs text-[#6b7280] mt-1">
                      Krótka nazwa (opcjonalna, domyślnie etykieta)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Wymagane */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="required"
                id="required"
                checked={form.required}
                onChange={handleChange}
                className="w-5 h-5 accent-[#1b3caf] rounded"
              />
              <label
                htmlFor="required"
                className="text-sm text-white cursor-pointer"
              >
                Parametr wymagany (musi być wypełniony przy tworzeniu produktu)
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-[#1b3caf]/20">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Zapisywanie..." : "Zapisz zmiany"}
              </button>
              <Link
                href="/admin/parameters"
                className="px-6 py-3 bg-[#242d3d] text-white rounded-lg hover:bg-[#2a3444] transition text-center"
              >
                Anuluj
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
