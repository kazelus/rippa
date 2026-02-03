"use client";

import { useEffect, useState } from "react";

type Toast = {
  id: string;
  message: string;
  type?: "info" | "success" | "error";
};

export default function Toasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (e: any) => {
      const d = e?.detail || e;
      const t: Toast = {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
        message: d.message || "",
        type: d.type || "info",
      };
      setToasts((s) => [...s, t]);
      setTimeout(() => {
        setToasts((s) => s.filter((x) => x.id !== t.id));
      }, d.duration || 3000);
    };

    window.addEventListener("rippa-toast", handler as EventListener);
    return () =>
      window.removeEventListener("rippa-toast", handler as EventListener);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed left-1/2 top-6 z-[9999] transform -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto w-full max-w-xl px-5 py-3 rounded-xl text-white text-sm font-medium break-words shadow-2xl ring-1 ring-white/10 backdrop-blur-sm transition-all ${
            t.type === "error"
              ? "bg-red-600 border-l-4 border-red-400"
              : t.type === "success"
                ? "bg-green-600 border-l-4 border-green-400"
                : "bg-slate-800 border-l-4 border-blue-400"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
