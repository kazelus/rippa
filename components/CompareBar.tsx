"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Trash2, ChevronDown } from "lucide-react";

type Item = { id: string; name?: string; url?: string };

export default function CompareBar() {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("compareModels");
      if (raw) setItems(JSON.parse(raw));
    } catch {
      setItems([]);
    }

    const onUpdate = () => {
      try {
        const raw = localStorage.getItem("compareModels");
        setItems(raw ? JSON.parse(raw) : []);
      } catch {
        setItems([]);
      }
    };
    window.addEventListener("compare-updated", onUpdate);
    return () => window.removeEventListener("compare-updated", onUpdate);
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return;
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const remove = (id: string) => {
    const next = items.filter((p) => p.id !== id);
    setItems(next);
    try {
      localStorage.setItem("compareModels", JSON.stringify(next));
    } catch {}
    window.dispatchEvent(new Event("compare-updated"));
    window.dispatchEvent(
      new CustomEvent("rippa-toast", {
        detail: { message: "Usunięto z porównań", type: "info" },
      }),
    );
  };

  const clearAll = () => {
    setItems([]);
    try {
      localStorage.removeItem("compareModels");
    } catch {}
    window.dispatchEvent(new Event("compare-updated"));
    window.dispatchEvent(
      new CustomEvent("rippa-toast", {
        detail: { message: "Wyczyszczono listę porównań", type: "success" },
      }),
    );
  };

  if (items.length === 0) return null;

  return (
    <div
      ref={ref}
      className="fixed left-1/2 transform -translate-x-1/2 top-20 z-40 w-full max-w-3xl px-4 pointer-events-auto"
    >
      <div className="relative">
        <div className="mx-auto flex items-center gap-3 bg-[#0f1724]/95 border border-white/8 rounded-full px-4 py-2 shadow-lg backdrop-blur-sm w-fit">
          <button
            onClick={() => setOpen((s) => !s)}
            className="flex items-center gap-2"
            aria-expanded={open}
          >
            <span className="inline-flex items-center bg-white/10 px-3 py-1 rounded-full text-sm font-semibold">
              {items.length}
            </span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          <div className="ml-2 flex items-center gap-2">
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-shadow"
            >
              Porównaj
            </Link>
            <button
              onClick={clearAll}
              className="text-sm text-[#b0b0b0] hover:text-white px-3 transition-colors"
            >
              Wyczyść
            </button>
          </div>
        </div>

        {open && (
          <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-[min(95%,720px)] bg-[#071026] border border-white/6 rounded-xl shadow-2xl p-3">
            <div className="flex flex-col gap-2">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between gap-3 p-2 bg-white/3 rounded"
                >
                  <div className="flex items-center gap-3">
                    {it.url ? (
                      <img
                        src={it.url}
                        className="w-10 h-10 object-cover rounded"
                        alt={it.name || ""}
                      />
                    ) : null}
                    <div>
                      <div className="font-semibold">{it.name}</div>
                      <div className="text-sm text-[#9aa6b8] text-xs">
                        {it.id}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
