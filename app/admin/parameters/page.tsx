"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X, BarChart3, Pencil, Trash2, Layers, Zap } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { showToast } from "@/lib/toast";

export default function ParametersAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [parameters, setParameters] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [existingGroups, setExistingGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

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
    if (status === "unauthenticated") router.push("/admin");
  }, [status, router]);

  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchGroups();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/parameters");
      const data = await res.json();
      setParameters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setParameters([]);
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

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/admin/parameters/groups");
      if (res.ok) setExistingGroups((await res.json()) || []);
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
      const res = await fetch("/api/admin/parameters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create parameter");
      }
      setForm({
        categoryId: "",
        key: "",
        label: "",
        unit: "",
        type: "text",
        options: "",
        required: false,
        group: "",
        newGroup: "",
        order: 0,
        isQuickSpec: false,
        quickSpecOrder: 0,
        quickSpecLabel: "",
      });
      setShowNewGroup(false);
      setFormOpen(false);
      fetchData();
      fetchGroups();
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/parameters/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchData();
      showToast("Parametr usunięty", "success");
    } catch (err) {
      console.error(err);
      showToast("Nie udało się usunąć parametru", "error");
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
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[#8b92a9] text-sm mb-1">Specyfikacja techniczna</p>
          <h2 className="text-3xl font-bold text-white">
            Parametry techniczne
          </h2>
        </div>
        <button
          onClick={() => setFormOpen((s) => !s)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-[#1b3caf]/30 hover:scale-105 transition-all duration-300"
        >
          {formOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {formOpen ? "Anuluj" : "Dodaj parametr"}
        </button>
      </div>

      {/* Add Form */}
      {formOpen && (
        <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Nowy parametr</h3>
              <p className="text-xs text-[#8b92a9]">
                Parametr techniczny wyświetlany na stronie produktu
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Kategoria</label>
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
                <p className="text-xs text-[#6b7280] mt-1">
                  Pozostaw puste dla parametru globalnego
                </p>
              </div>
              <div>
                <label className={labelClass}>Klucz *</label>
                <input
                  name="key"
                  value={form.key}
                  onChange={handleChange}
                  placeholder="np. engine_power"
                  className={inputClass}
                  required
                />
                <p className="text-xs text-[#6b7280] mt-1">
                  Unikalny identyfikator (snake_case)
                </p>
              </div>
              <div>
                <label className={labelClass}>Etykieta *</label>
                <input
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  placeholder="np. Moc silnika"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Jednostka</label>
                <input
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  placeholder="np. kW, mm, kg"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Typ danych</label>
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
                </select>
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
                <p className="text-xs text-[#6b7280] mt-1">
                  Niższa = wyższa pozycja
                </p>
              </div>
            </div>

            {/* Group */}
            <div className="pt-4 border-t border-white/[6%] space-y-3">
              <label className={labelClass}>Grupa parametrów</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewGroup(false)}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${!showNewGroup ? "bg-[#1b3caf] text-white" : "bg-white/[5%] border border-white/10 text-[#8b92a9] hover:text-white"}`}
                >
                  Wybierz istniejącą
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewGroup(true)}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${showNewGroup ? "bg-[#1b3caf] text-white" : "bg-white/[5%] border border-white/10 text-[#8b92a9] hover:text-white"}`}
                >
                  Dodaj nową
                </button>
              </div>
              {!showNewGroup ? (
                <select
                  name="group"
                  value={form.group}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Brak grupy (Ogólne)</option>
                  {existingGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name="newGroup"
                  value={form.newGroup}
                  onChange={handleChange}
                  placeholder="np. Silnik, Wymiary, Hydraulika"
                  className={inputClass}
                />
              )}
              <p className="text-xs text-[#6b7280]">
                Parametry z tą samą grupą będą wyświetlane razem
              </p>
            </div>

            {/* Enum options */}
            {form.type === "enum" && (
              <div className="pt-4 border-t border-white/[6%]">
                <label className={labelClass}>Opcje (JSON array) *</label>
                <textarea
                  name="options"
                  value={form.options}
                  onChange={handleChange}
                  className={`${inputClass} font-mono`}
                  placeholder='["Opcja 1", "Opcja 2"]'
                  rows={3}
                />
              </div>
            )}

            {/* Quick Spec */}
            <div className="pt-4 border-t border-white/[6%] space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 bg-white/[3%] border border-white/[6%] rounded-xl">
                <input
                  type="checkbox"
                  name="isQuickSpec"
                  id="isQuickSpec"
                  checked={form.isQuickSpec}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#0f9fdf] rounded"
                />
                <div>
                  <label
                    htmlFor="isQuickSpec"
                    className="text-sm text-white cursor-pointer flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    Pokaż w podglądzie (Quick Spec)
                  </label>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    Wyświetlaj na kartach produktów i w sekcji hero
                  </p>
                </div>
              </div>
              {form.isQuickSpec && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Kolejność Quick Spec</label>
                    <input
                      type="number"
                      name="quickSpecOrder"
                      value={form.quickSpecOrder}
                      onChange={handleChange}
                      min="1"
                      max="6"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Skrócona etykieta</label>
                    <input
                      name="quickSpecLabel"
                      value={form.quickSpecLabel}
                      onChange={handleChange}
                      placeholder="np. Moc"
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Required */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="required"
                id="paramRequired"
                checked={form.required}
                onChange={handleChange}
                className="w-4 h-4 accent-[#1b3caf] rounded"
              />
              <label
                htmlFor="paramRequired"
                className="text-sm text-white cursor-pointer"
              >
                Parametr wymagany
              </label>
            </div>

            <div className="pt-4 border-t border-white/[6%]">
              <button
                type="submit"
                disabled={saving}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#1b3caf]/30 transition-all duration-300 disabled:opacity-50"
              >
                {saving ? "Zapisywanie..." : "Utwórz parametr"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Parameters List */}
      <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Lista parametrów</h3>
              <p className="text-xs text-[#8b92a9]">
                {parameters.length} zdefiniowanych
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
        ) : parameters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Layers className="w-7 h-7 text-[#8b92a9]" />
            </div>
            <p className="text-white font-medium mb-1">
              Brak zdefiniowanych parametrów
            </p>
            <p className="text-[#8b92a9] text-sm">
              Dodaj parametry techniczne dla produktów
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[6%]">
            {parameters.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-white/[3%] transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold truncate">
                        {p.label}
                      </p>
                      <span className="text-[10px] text-[#6b7280] bg-white/5 px-2 py-0.5 rounded-full">
                        {p.key}
                      </span>
                      {p.unit && (
                        <span className="text-[10px] text-[#8b92a9] bg-white/5 px-2 py-0.5 rounded-full">
                          [{p.unit}]
                        </span>
                      )}
                      {p.isQuickSpec && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0f9fdf]/10 text-[#0f9fdf] border border-[#0f9fdf]/20">
                          <Zap className="w-2.5 h-2.5" /> QS #{p.quickSpecOrder}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#8b92a9]">
                        {typeLabels[p.type] || p.type}
                      </span>
                      <span className="text-xs text-[#6b7280]">•</span>
                      <span className="text-xs text-[#6b7280]">
                        {p.categoryId
                          ? `Kategoria: ${p.categoryId}`
                          : "Globalna"}
                      </span>
                      {p.group && (
                        <>
                          <span className="text-xs text-[#6b7280]">•</span>
                          <span className="text-xs text-violet-400">
                            {p.group}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                  <Link
                    href={`/admin/parameters/${p.id}/edit`}
                    className="p-2 rounded-lg text-[#8b92a9] hover:text-white hover:bg-white/10 transition-all"
                    title="Edytuj"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(p)}
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
        title="Usunąć parametr?"
        message={`Czy na pewno chcesz usunąć parametr „${deleteTarget?.label}"? To działanie jest nieodwracalne.`}
        confirmLabel="Usuń parametr"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
