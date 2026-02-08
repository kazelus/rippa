"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import { Footer } from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";

// Helper to parse JSON-stored parameter/feature values
function parseValue(val: any): any {
  if (val == null) return null;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

// Format price nicely
function formatPrice(value: number) {
  return Math.round(value).toLocaleString("pl-PL").replace(/,/g, " ");
}

export default function ComparePage() {
  const [items, setItems] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("compareModels");
      if (raw) setItems(JSON.parse(raw));
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    if (items.length === 0) return setLoading(false);
    // Fetch full model details
    const fetchAll = async () => {
      try {
        const rs = await Promise.all(
          items.map((it) =>
            fetch(`/api/models/${it.id}`).then((r) => r.json()),
          ),
        );
        setModels(rs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [items]);

  const remove = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    localStorage.setItem("compareModels", JSON.stringify(next));
    setModels((m) => m.filter((x) => x.id !== id));
  };

  // Collect all unique parameters across all models (by key)
  const allParameters = (() => {
    const map = new Map<
      string,
      { key: string; label: string; unit: string; group: string; order: number }
    >();
    for (const m of models) {
      if (m.parameters) {
        for (const p of m.parameters) {
          if (!map.has(p.key)) {
            map.set(p.key, {
              key: p.key,
              label: p.label,
              unit: p.unit || "",
              group: p.group || "Ogólne",
              order: p.quickSpecOrder || 999,
            });
          }
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  })();

  // Group parameters by group name
  const parameterGroups = (() => {
    const groups = new Map<string, typeof allParameters>();
    for (const p of allParameters) {
      const g = p.group;
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g)!.push(p);
    }
    return Array.from(groups.entries());
  })();

  // Collect all unique features across all models (by key)
  const allFeatures = (() => {
    const map = new Map<string, { key: string; label: string; type: string }>();
    for (const m of models) {
      if (m.features) {
        for (const f of m.features) {
          if (!map.has(f.key)) {
            map.set(f.key, { key: f.key, label: f.label, type: f.type });
          }
        }
      }
    }
    return Array.from(map.values());
  })();

  if (loading)
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e] text-white">
          <UnifiedNavbar />
          <div className="max-w-4xl mx-auto pt-32 p-8 text-center">
            <LoadingScreen message="Ładowanie porównania..." fullScreen={false} />
          </div>
        </div>
      );

  if (items.length === 0)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e] text-white">
        <UnifiedNavbar />
        <div className="max-w-4xl mx-auto pt-32 p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Brak modeli do porównania</h2>
          <p className="text-[#b0b0b0] mb-6">
            Przejdź do strony modelu i kliknij &quot;Dodaj do porównania&quot;.
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] rounded-lg font-bold"
          >
            Przejdź do katalogu
          </Link>
        </div>
      </div>
    );

  // Row component for table
  const Row = ({
    label,
    values,
    isHeader,
    highlight,
  }: {
    label: string;
    values: string[];
    isHeader?: boolean;
    highlight?: boolean;
  }) => (
    <tr
      className={`border-t border-white/6 ${highlight ? "bg-[#1b3caf]/5" : ""}`}
    >
      <td
        className={`p-3 text-sm sticky left-0 z-20 bg-[#071026] ${
          isHeader
            ? "text-white font-bold text-xs uppercase tracking-wider"
            : "text-[#b0b0b0]"
        }`}
      >
        {label}
      </td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`p-3 ${isHeader ? "font-semibold text-white" : ""}`}
        >
          {v}
        </td>
      ))}
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071026] via-[#0f1724] to-[#071026] text-white">
      <UnifiedNavbar />
      <div className="max-w-7xl mx-auto pt-28 px-4 sm:px-6 lg:px-8 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#081125] to-[#071026] rounded-2xl p-8 mb-8 border border-white/6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold">Porównanie modeli</h1>
              <p className="text-[#9aa6b8] mt-2">
                Szybkie porównanie najważniejszych parametrów i cech — wybierz
                najlepszy model dla siebie.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="px-4 py-2 bg-white/5 rounded hover:bg-white/10 transition"
              >
                Przeglądaj katalog
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] rounded font-semibold"
              >
                Skontaktuj się
              </Link>
            </div>
          </div>
        </div>

        {/* Model cards strip */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {models.map((m) => (
            <div
              key={m.id}
              className="min-w-[220px] p-4 bg-white/5 rounded-xl border border-white/8 shadow-md flex-shrink-0"
            >
              <div className="flex items-center gap-3">
                {m.images && m.images.length > 0 ? (
                  <img
                    src={m.images[0].url}
                    className="w-16 h-16 object-cover rounded"
                    alt={m.name || ""}
                  />
                ) : null}
                <div className="min-w-0">
                  <div className="font-semibold text-lg truncate">{m.name}</div>
                  <div className="text-sm text-[#9aa6b8]">
                    {m.category?.name || "—"}
                  </div>
                  <div className="text-sm text-white font-bold">
                    {formatPrice(Number(m.price))} PLN
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Link
                  href={`/products/${m.id}`}
                  className="text-sm text-[#1b3caf] hover:text-[#0f9fdf] transition"
                >
                  Zobacz
                </Link>
                <button
                  onClick={() => remove(m.id)}
                  className="text-red-400 text-sm hover:text-red-300 transition"
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="overflow-auto bg-white/3 rounded-xl border border-white/8">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-gradient-to-r from-[#071026] to-[#0b1622] text-[#9aa6b8]">
                <th className="p-3 text-left sticky left-0 z-30 bg-[#071026] w-[200px]">
                  Atrybut
                </th>
                {models.map((m) => (
                  <th key={m.id} className="p-3 text-left min-w-[180px]">
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* === Basic Info === */}
              <Row
                label="INFORMACJE PODSTAWOWE"
                values={models.map(() => "")}
                isHeader
              />
              <Row
                label="Kategoria"
                values={models.map((m) => m.category?.name || "—")}
              />
              <Row
                label="Cena"
                values={models.map(
                  (m) => formatPrice(Number(m.price)) + " PLN",
                )}
                highlight
              />

              {/* === Dynamic Parameters by group === */}
              {parameterGroups.map(([groupName, params]) => (
                <Fragment key={`group-${groupName}`}>
                  <Row
                    label={groupName.toUpperCase()}
                    values={models.map(() => "")}
                    isHeader
                  />
                  {params.map((param) => {
                    const values = models.map((m) => {
                      const found = m.parameters?.find(
                        (p: any) => p.key === param.key,
                      );
                      if (!found || found.value == null) return "—";
                      const parsed = parseValue(found.value);
                      if (parsed == null || parsed === "") return "—";
                      return `${parsed}${param.unit ? ` ${param.unit}` : ""}`;
                    });
                    return (
                      <Row
                        key={param.key}
                        label={param.label}
                        values={values}
                      />
                    );
                  })}
                </Fragment>
              ))}

              {/* === Dynamic Features === */}
              {allFeatures.length > 0 && (
                <>
                  <Row
                    label="CECHY / WYPOSAŻENIE"
                    values={models.map(() => "")}
                    isHeader
                  />
                  {allFeatures.map((feat) => {
                    const values = models.map((m) => {
                      const found = m.features?.find(
                        (f: any) => f.key === feat.key,
                      );
                      if (!found || found.value == null) return "—";
                      const parsed = parseValue(found.value);
                      if (parsed == null || parsed === "") return "—";

                      if (feat.type === "boolean") {
                        return parsed === true || parsed === "true"
                          ? "✓ Tak"
                          : "✗ Nie";
                      }
                      if (
                        feat.type === "date" &&
                        typeof parsed === "string" &&
                        parsed.includes("-")
                      ) {
                        return new Date(parsed).toLocaleDateString("pl-PL");
                      }
                      return String(parsed);
                    });
                    return (
                      <Row key={feat.key} label={feat.label} values={values} />
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <p className="text-[#9aa6b8] mb-4">
            Nie możesz się zdecydować? Nasi specjaliści chętnie pomogą.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] rounded-lg font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          >
            Zapytaj eksperta
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
