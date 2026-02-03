"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UnifiedNavbar } from "@/components/UnifiedNavbar";

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

  if (loading) return <div className="p-12 text-white">Ładowanie...</div>;

  if (items.length === 0)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e] text-white">
        <UnifiedNavbar />
        <div className="max-w-4xl mx-auto pt-32 p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Brak modeli do porównania</h2>
          <p className="text-[#b0b0b0] mb-6">
            Przejdź do strony modelu i kliknij "Dodaj do porównania".
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071026] via-[#0f1724] to-[#071026] text-white">
      <UnifiedNavbar />
      <div className="max-w-7xl mx-auto pt-28 px-4 sm:px-6 lg:px-8 pb-20">
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
                className="px-4 py-2 bg-white/5 rounded hover:bg-white/10"
              >
                Przeglądaj katalog
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] rounded font-semibold"
              >
                Skontaktuj się
              </Link>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          {items.map((it) => {
            const full = models.find((m) => String(m.id) === String(it.id));
            return (
              <div
                key={it.id}
                className="min-w-[220px] p-4 bg-white/5 rounded-xl border border-white/8 shadow-md"
              >
                <div className="flex items-center gap-3">
                  {it.url ? (
                    <img
                      src={it.url}
                      className="w-16 h-16 object-cover rounded"
                      alt={it.name || ""}
                    />
                  ) : null}
                  <div>
                    <div className="font-semibold text-lg">{it.name}</div>
                    <div className="text-sm text-[#9aa6b8]">
                      {full
                        ? full.price?.toLocaleString("pl-PL") + " PLN"
                        : "—"}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Link
                    href={`/products/${it.id}`}
                    className="text-sm text-[#1b3caf]"
                  >
                    Zobacz
                  </Link>
                  <button
                    onClick={() => remove(it.id)}
                    className="text-red-400 text-sm"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="overflow-auto bg-white/3 rounded-xl border border-white/8">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-gradient-to-r from-[#071026] to-[#0b1622] text-[#9aa6b8]">
                <th className="p-3 text-left sticky left-0 z-30">Atrybut</th>
                {models.map((m) => (
                  <th key={m.id} className="p-3 text-left">
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Basic fields */}
              {[
                ["Cena", (m: any) => m.price?.toLocaleString("pl-PL") + " PLN"],
                ["Moc", (m: any) => m.power + " KM"],
                ["Głębokość", (m: any) => m.depth + " m"],
                ["Waga", (m: any) => m.weight + " t"],
                ["Pojemność łyżki", (m: any) => m.bucket + " m³"],
              ].map(([label, fn]: any, idx) => (
                <tr
                  key={label}
                  className={`${idx % 2 === 0 ? "bg-white/2" : ""} border-t border-white/6`}
                >
                  <td className="p-3 text-sm text-[#b0b0b0] sticky left-0 bg-[#071026] z-20">
                    {label}
                  </td>
                  {models.map((m) => (
                    <td key={m.id} className="p-3">
                      {fn(m)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Dynamic features */}
              {(() => {
                const allFeatures = new Map<string, any>();
                for (const m of models) {
                  if (m.features) {
                    for (const f of m.features) {
                      allFeatures.set(f.key, f);
                    }
                  }
                }
                return Array.from(allFeatures.values()).map((f) => (
                  <tr key={f.key} className="border-t border-white/6">
                    <td className="p-3 text-sm text-[#b0b0b0] sticky left-0 bg-[#071026] z-20">
                      {f.label}
                    </td>
                    {models.map((m) => {
                      const found = m.features?.find(
                        (x: any) => x.key === f.key,
                      );
                      let disp = (found && (found.value ?? "—")) || "—";
                      if (f.type === "boolean")
                        disp = found && found.value ? "Tak" : "Nie";
                      if (f.type === "date" && found && found.value)
                        disp = new Date(found.value).toLocaleDateString(
                          "pl-PL",
                        );
                      return (
                        <td key={m.id} className="p-3">
                          {disp}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
