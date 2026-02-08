"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  X,
  BarChart3,
  Pencil,
  Trash2,
  Layers,
  Zap,
  Search,
  Filter,
  Copy,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Globe,
  Tag,
  RotateCcw,
  GripVertical,
  Eye,
  EyeOff,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { showToast } from "@/lib/toast";

interface Parameter {
  id: string;
  categoryId: string | null;
  key: string;
  label: string;
  unit: string | null;
  type: string;
  options: any;
  required: boolean;
  order: number;
  group: string | null;
  affectsPrice: boolean;
  priceModifier: number | null;
  priceModifierType: string | null;
  isVariant: boolean;
  variantOptions: any;
  isQuickSpec: boolean;
  quickSpecOrder: number;
  quickSpecLabel: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ParametersAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Data
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingGroups, setExistingGroups] = useState<string[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Parameter | null>(null);
  const [cloning, setCloning] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterQuickSpec, setFilterQuickSpec] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grouped" | "flat">("grouped");

  // Collapsed groups
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  const collapsedInitRef = useRef(false);

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

  // ---------- Filtering Logic ----------
  const getCategoryName = (id: string | null) => {
    if (!id) return "Globalna";
    return categories.find((c) => c.id === id)?.name || id;
  };

  const filteredParameters = useMemo(() => {
    return parameters.filter((p) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          p.label.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q) ||
          (p.unit && p.unit.toLowerCase().includes(q)) ||
          (p.group && p.group.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filterCategory !== "all") {
        if (filterCategory === "global" && p.categoryId !== null) return false;
        if (filterCategory !== "global" && p.categoryId !== filterCategory)
          return false;
      }

      // Type filter
      if (filterType !== "all" && p.type !== filterType) return false;

      // Group filter
      if (filterGroup !== "all") {
        if (filterGroup === "none" && p.group !== null) return false;
        if (filterGroup !== "none" && p.group !== filterGroup) return false;
      }

      // QuickSpec filter
      if (filterQuickSpec !== "all") {
        if (filterQuickSpec === "yes" && !p.isQuickSpec) return false;
        if (filterQuickSpec === "no" && p.isQuickSpec) return false;
      }

      return true;
    });
  }, [
    parameters,
    searchQuery,
    filterCategory,
    filterType,
    filterGroup,
    filterQuickSpec,
  ]);

  // ---------- Grouped Data ----------
  const groupedParameters = useMemo(() => {
    if (viewMode === "flat") return null;

    const byCategoryAndGroup = new Map<string, Map<string, Parameter[]>>();

    filteredParameters.forEach((p) => {
      const catKey = p.categoryId || "__global__";
      const grpKey = p.group || "__none__";

      if (!byCategoryAndGroup.has(catKey)) {
        byCategoryAndGroup.set(catKey, new Map());
      }
      const catGroups = byCategoryAndGroup.get(catKey)!;
      if (!catGroups.has(grpKey)) {
        catGroups.set(grpKey, []);
      }
      catGroups.get(grpKey)!.push(p);
    });

    byCategoryAndGroup.forEach((catGroups) => {
      catGroups.forEach((params) => {
        params.sort((a, b) => (a.order || 0) - (b.order || 0));
      });
    });

    return byCategoryAndGroup;
  }, [filteredParameters, viewMode]);

    // Initialize collapsed state once after groupedParameters is computed
    useEffect(() => {
      if (collapsedInitRef.current) return;
      if (!groupedParameters || groupedParameters.size === 0) return;
      const allKeys = new Set<string>();
      groupedParameters.forEach((groups, catKey) => {
        allKeys.add(`cat_${catKey}`);
        groups.forEach((_, grpKey) => {
          allKeys.add(`grp_${catKey}_${grpKey}`);
        });
      });
      setCollapsedGroups(allKeys);
      collapsedInitRef.current = true;
    }, [groupedParameters]);

  const toggleGroupCollapse = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterCategory !== "all") count++;
    if (filterType !== "all") count++;
    if (filterGroup !== "all") count++;
    if (filterQuickSpec !== "all") count++;
    return count;
  }, [filterCategory, filterType, filterGroup, filterQuickSpec]);

  const resetFilters = () => {
    setSearchQuery("");
    setFilterCategory("all");
    setFilterType("all");
    setFilterGroup("all");
    setFilterQuickSpec("all");
  };

  // ---------- Handlers ----------
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
      showToast("Parametr utworzony", "success");
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

  const handleClone = async (id: string) => {
    setCloning(id);
    try {
      const res = await fetch(`/api/admin/parameters/${id}/clone`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Clone failed");
      const cloned = await res.json();
      showToast("Parametr skopiowany — przekierowuję do edycji", "success");
      router.push(`/admin/parameters/${cloned.id}/edit`);
    } catch (err) {
      console.error(err);
      showToast("Nie udało się skopiować parametru", "error");
    } finally {
      setCloning(null);
    }
  };

  // ---------- Styles ----------
  const inputClass =
    "w-full px-4 py-2.5 bg-white/[5%] border border-white/10 rounded-xl text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf]/50 transition text-sm";
  const labelClass = "block text-sm font-medium text-[#b0b0b0] mb-2";
  const selectFilterClass =
    "w-full px-3 py-2 bg-white/[5%] border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-[#1b3caf]/50 transition";

  const typeLabels: Record<string, string> = {
    text: "Tekst",
    number: "Liczba",
    boolean: "Tak/Nie",
    enum: "Wybór",
  };

  const typeColors: Record<string, string> = {
    text: "text-blue-400 bg-blue-400/10",
    number: "text-emerald-400 bg-emerald-400/10",
    boolean: "text-purple-400 bg-purple-400/10",
    enum: "text-amber-400 bg-amber-400/10",
  };

  // ---------- Render Helpers ----------
  const renderParameterRow = (p: Parameter) => (
    <div
      key={p.id}
      className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[3%] transition-colors group"
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-1 h-8 rounded-full bg-amber-400/30 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-medium text-sm truncate">{p.label}</p>
            <span className="text-[10px] text-[#6b7280] bg-white/5 px-2 py-0.5 rounded font-mono">
              {p.key}
            </span>
            {p.unit && (
              <span className="text-[10px] text-[#8b92a9] bg-white/5 px-2 py-0.5 rounded">
                {p.unit}
              </span>
            )}
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-medium ${typeColors[p.type] || "text-gray-400 bg-gray-400/10"}`}
            >
              {typeLabels[p.type] || p.type}
            </span>
            {p.isQuickSpec && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#0f9fdf]/10 text-[#0f9fdf] border border-[#0f9fdf]/20">
                <Zap className="w-2.5 h-2.5" /> QS #{p.quickSpecOrder}
              </span>
            )}
            {p.required && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-400/10 text-red-400 font-medium">
                Wymagane
              </span>
            )}
            {p.affectsPrice && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-green-400/10 text-green-400 font-medium">
                Cena
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-[#6b7280]">
              {getCategoryName(p.categoryId)}
            </span>
            {p.group && (
              <>
                <span className="text-[11px] text-[#4b5563]">›</span>
                <span className="text-[11px] text-violet-400/80">
                  {p.group}
                </span>
              </>
            )}
            <span className="text-[11px] text-[#4b5563]">•</span>
            <span className="text-[11px] text-[#6b7280]">
              Kolejność: {p.order}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => handleClone(p.id)}
          disabled={cloning === p.id}
          className="p-2 rounded-lg text-[#8b92a9] hover:text-cyan-400 hover:bg-cyan-400/10 transition-all disabled:opacity-30"
          title="Kopiuj parametr"
        >
          <Copy className="w-4 h-4" />
        </button>
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
  );

  const renderGroupedView = () => {
    if (!groupedParameters || groupedParameters.size === 0) {
      return renderEmptyState();
    }

    const sortedCategories = Array.from(groupedParameters.entries()).sort(
      ([a], [b]) => {
        if (a === "__global__") return -1;
        if (b === "__global__") return 1;
        const nameA = getCategoryName(a);
        const nameB = getCategoryName(b);
        return nameA.localeCompare(nameB, "pl");
      },
    );

    return (
      <div className="divide-y divide-white/[4%]">
        {sortedCategories.map(([catKey, groups]) => {
          const catName =
            catKey === "__global__" ? "Globalne" : getCategoryName(catKey);
          const catCollapseKey = `cat_${catKey}`;
          const isCatCollapsed = collapsedGroups.has(catCollapseKey);
          const totalInCategory = Array.from(groups.values()).reduce(
            (sum, arr) => sum + arr.length,
            0,
          );

          const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) => {
            if (a === "__none__") return -1;
            if (b === "__none__") return 1;
            return a.localeCompare(b, "pl");
          });

          return (
            <div key={catKey}>
              {/* Category Header */}
              <button
                onClick={() => toggleGroupCollapse(catCollapseKey)}
                className="w-full flex items-center gap-3 px-5 py-3.5 bg-white/[3%] hover:bg-white/[5%] transition-colors border-b border-white/[4%]"
              >
                {isCatCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-[#8b92a9]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8b92a9]" />
                )}
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  {catKey === "__global__" ? (
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <Tag className="w-3.5 h-3.5 text-blue-400" />
                  )}
                </div>
                <span className="text-white font-semibold text-sm">
                  {catName}
                </span>
                <span className="text-[11px] text-[#6b7280] bg-white/5 px-2 py-0.5 rounded-full ml-1">
                  {totalInCategory}
                </span>
              </button>

              {!isCatCollapsed && (
                <div>
                  {sortedGroups.map(([grpKey, params]) => {
                    const grpName = grpKey === "__none__" ? "Ogólne" : grpKey;
                    const grpCollapseKey = `grp_${catKey}_${grpKey}`;
                    const isGrpCollapsed = collapsedGroups.has(grpCollapseKey);

                    return (
                      <div key={grpKey}>
                        {/* Group Sub-header */}
                        <button
                          onClick={() => toggleGroupCollapse(grpCollapseKey)}
                          className="w-full flex items-center gap-3 px-5 pl-12 py-2.5 hover:bg-white/[2%] transition-colors border-b border-white/[3%]"
                        >
                          {isGrpCollapsed ? (
                            <ChevronRight className="w-3.5 h-3.5 text-[#6b7280]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#6b7280]" />
                          )}
                          <FolderOpen className="w-3.5 h-3.5 text-violet-400/70" />
                          <span className="text-[#b0b0b0] text-xs font-medium">
                            {grpName}
                          </span>
                          <span className="text-[10px] text-[#6b7280] bg-white/5 px-1.5 py-0.5 rounded ml-0.5">
                            {params.length}
                          </span>
                        </button>

                        {!isGrpCollapsed && (
                          <div className="border-b border-white/[3%]">
                            {params.map(renderParameterRow)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderFlatView = () => {
    if (filteredParameters.length === 0) return renderEmptyState();
    const sorted = [...filteredParameters].sort(
      (a, b) => (a.order || 0) - (b.order || 0),
    );
    return (
      <div className="divide-y divide-white/[4%]">
        {sorted.map(renderParameterRow)}
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Layers className="w-7 h-7 text-[#8b92a9]" />
      </div>
      {searchQuery || activeFiltersCount > 0 ? (
        <>
          <p className="text-white font-medium mb-1">Brak wyników</p>
          <p className="text-[#8b92a9] text-sm mb-4">
            Spróbuj zmienić kryteria wyszukiwania lub filtry
          </p>
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 bg-white/[5%] border border-white/10 rounded-xl text-sm text-white hover:bg-white/10 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Resetuj filtry
          </button>
        </>
      ) : (
        <>
          <p className="text-white font-medium mb-1">
            Brak zdefiniowanych parametrów
          </p>
          <p className="text-[#8b92a9] text-sm">
            Dodaj parametry techniczne dla produktów
          </p>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[#8b92a9] text-sm mb-1">Specyfikacja techniczna</p>
          <h2 className="text-3xl font-bold text-white">
            Parametry techniczne
          </h2>
          {!loading && (
            <p className="text-xs text-[#6b7280] mt-1">
              {filteredParameters.length} z {parameters.length} parametrów
              {existingGroups.length > 0 && ` • ${existingGroups.length} grup`}
            </p>
          )}
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

      {/* Search & Filters Bar */}
      <div className="space-y-3">
        {/* Search + Toggle Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj po nazwie, kluczu, jednostce, grupie..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/[5%] border border-white/10 rounded-xl text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf]/50 transition text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View mode toggle */}
          <div className="flex gap-1.5 bg-white/[5%] border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grouped")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === "grouped"
                  ? "bg-[#1b3caf] text-white shadow-sm"
                  : "text-[#8b92a9] hover:text-white"
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Grupy
            </button>
            <button
              onClick={() => setViewMode("flat")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === "flat"
                  ? "bg-[#1b3caf] text-white shadow-sm"
                  : "text-[#8b92a9] hover:text-white"
              }`}
            >
              <GripVertical className="w-3.5 h-3.5" />
              Lista
            </button>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all border ${
              showFilters || activeFiltersCount > 0
                ? "bg-[#1b3caf]/20 border-[#1b3caf]/40 text-white"
                : "bg-white/[5%] border-white/10 text-[#8b92a9] hover:text-white"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtry
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#1b3caf] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-white/[3%] border border-white/[8%] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[#b0b0b0]">
                Filtruj parametry
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-[11px] text-[#8b92a9] hover:text-white transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  Resetuj
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Category filter */}
              <div>
                <label className="text-[10px] text-[#6b7280] mb-1 block uppercase tracking-wider">
                  Kategoria
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={selectFilterClass}
                >
                  <option value="all">Wszystkie</option>
                  <option value="global">Globalne</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type filter */}
              <div>
                <label className="text-[10px] text-[#6b7280] mb-1 block uppercase tracking-wider">
                  Typ danych
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={selectFilterClass}
                >
                  <option value="all">Wszystkie</option>
                  <option value="text">Tekst</option>
                  <option value="number">Liczba</option>
                  <option value="boolean">Tak/Nie</option>
                  <option value="enum">Wybór</option>
                </select>
              </div>

              {/* Group filter */}
              <div>
                <label className="text-[10px] text-[#6b7280] mb-1 block uppercase tracking-wider">
                  Grupa
                </label>
                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className={selectFilterClass}
                >
                  <option value="all">Wszystkie</option>
                  <option value="none">Bez grupy</option>
                  {existingGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* QuickSpec filter */}
              <div>
                <label className="text-[10px] text-[#6b7280] mb-1 block uppercase tracking-wider">
                  Quick Spec
                </label>
                <select
                  value={filterQuickSpec}
                  onChange={(e) => setFilterQuickSpec(e.target.value)}
                  className={selectFilterClass}
                >
                  <option value="all">Wszystkie</option>
                  <option value="yes">Tylko QS</option>
                  <option value="no">Bez QS</option>
                </select>
              </div>
            </div>

            {/* Active filter pills */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[5%]">
                {filterCategory !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[11px] border border-blue-500/20">
                    Kategoria:{" "}
                    {filterCategory === "global"
                      ? "Globalne"
                      : getCategoryName(filterCategory)}
                    <button
                      onClick={() => setFilterCategory("all")}
                      className="hover:text-white transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterType !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] border border-emerald-500/20">
                    Typ: {typeLabels[filterType] || filterType}
                    <button
                      onClick={() => setFilterType("all")}
                      className="hover:text-white transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterGroup !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-[11px] border border-violet-500/20">
                    Grupa: {filterGroup === "none" ? "Brak" : filterGroup}
                    <button
                      onClick={() => setFilterGroup("all")}
                      className="hover:text-white transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterQuickSpec !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[11px] border border-cyan-500/20">
                    QS: {filterQuickSpec === "yes" ? "Tak" : "Nie"}
                    <button
                      onClick={() => setFilterQuickSpec("all")}
                      className="hover:text-white transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Parameters List */}
      <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl overflow-hidden">
        {/* List header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">
                {viewMode === "grouped"
                  ? "Parametry wg kategorii i grup"
                  : "Lista parametrów"}
              </h3>
              <p className="text-[11px] text-[#6b7280]">
                {filteredParameters.length} parametrów
                {filteredParameters.length !== parameters.length &&
                  ` (filtrowano z ${parameters.length})`}
              </p>
            </div>
          </div>

          {viewMode === "grouped" && filteredParameters.length > 0 && (
            <div className="flex gap-1.5">
              <button
                onClick={() => setCollapsedGroups(new Set())}
                className="px-3 py-1.5 rounded-lg text-[11px] text-[#8b92a9] hover:text-white hover:bg-white/[5%] transition flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                Rozwiń
              </button>
              <button
                onClick={() => {
                  const allKeys = new Set<string>();
                  groupedParameters?.forEach((groups, catKey) => {
                    allKeys.add(`cat_${catKey}`);
                    groups.forEach((_, grpKey) => {
                      allKeys.add(`grp_${catKey}_${grpKey}`);
                    });
                  });
                  setCollapsedGroups(allKeys);
                }}
                className="px-3 py-1.5 rounded-lg text-[11px] text-[#8b92a9] hover:text-white hover:bg-white/[5%] transition flex items-center gap-1"
              >
                <EyeOff className="w-3 h-3" />
                Zwiń
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1b3caf] border-t-transparent" />
              <p className="text-[#8b92a9] text-sm">Ładowanie...</p>
            </div>
          </div>
        ) : viewMode === "grouped" ? (
          renderGroupedView()
        ) : (
          renderFlatView()
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
