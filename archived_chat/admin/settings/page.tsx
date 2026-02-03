"use client";
import React, { useEffect, useState } from "react";

const AdminSettingsPage = () => {
  const [number, setNumber] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setNumber(data.number || "");
        setInput(data.number || "");
      });
  }, []);

  const saveNumber = async () => {
    setLoading(true);
    setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: input }),
    });
    const data = await res.json();
    setNumber(data.number);
    setSaved(true);
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-[#1b3caf]/20 animate-fade-in relative">
      <button
        className="absolute left-6 top-6 flex items-center gap-2 text-[#1b3caf] hover:text-[#174a8c] text-sm font-semibold px-3 py-2 rounded-lg bg-[#f3f6fa] border border-[#1b3caf]/10 shadow-sm transition"
        onClick={() => window.history.back()}
        aria-label="Powrót do panelu admina"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 5l-5 5 5 5"
          />
        </svg>
        Powrót
      </button>

      <h2 className="text-2xl font-bold mb-8 text-[#1b3caf] text-center tracking-tight">
        Ustawienia WhatsApp
      </h2>
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-gray-700 text-sm">
          Numer WhatsApp do powiadomień:
        </label>
        <input
          className="w-full border border-[#1b3caf]/30 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#1b3caf] bg-[#f8fafc]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="np. +48500111222"
          disabled={loading}
        />
      </div>
      <button
        className="w-full bg-gradient-to-r from-[#1b3caf] to-[#174a8c] text-white py-3 rounded-lg font-semibold text-base hover:scale-[1.03] transition disabled:opacity-50 shadow-md"
        onClick={saveNumber}
        disabled={loading || !input}
      >
        {loading ? "Zapisywanie..." : "Zapisz numer"}
      </button>
      {saved && (
        <div className="text-green-600 mt-6 text-base text-center">
          Zapisano numer: <span className="font-bold">{number}</span>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
