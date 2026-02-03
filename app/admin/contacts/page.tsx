"use client";

import React, { useEffect, useState } from "react";
import AdminSettingsNav from "@/components/AdminSettingsNav";
import { Trash2, Mail, Check, X } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  topic?: string | null;
  phone?: string | null;
  message: string;
  productId?: string | null;
  product?: { id: string; name: string } | null;
  read: boolean;
  createdAt: string;
}

export default function AdminContactsPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filterUnread, setFilterUnread] = useState(false);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [emails, setEmails] = useState("");
  const [savingEmails, setSavingEmails] = useState(false);

  useEffect(() => {
    fetchData();
    fetchEmails();
  }, []);

  useEffect(() => {
    // reload when page or filter changes
    fetchData();
  }, [page, filterUnread]);

  const fetchData = async () => {
    setLoading(true);
    const q = new URLSearchParams();
    q.set("page", String(page));
    q.set("pageSize", String(pageSize));
    if (filterUnread) q.set("unread", "1");
    const res = await fetch(`/api/admin/contacts?${q.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  };

  const fetchEmails = async () => {
    const res = await fetch("/api/admin/settings/contact");
    if (res.ok) {
      const data = await res.json();
      setEmails(data.emails || "");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usuń zgłoszenie?")) return;
    const res = await fetch("/api/admin/contacts", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    if (res.ok) fetchData();
  };

  const toggleRead = async (c: Contact) => {
    const res = await fetch("/api/admin/contacts", {
      method: "PATCH",
      body: JSON.stringify({ id: c.id, read: !c.read }),
    });
    if (res.ok) fetchData();
  };

  const saveEmails = async () => {
    setSavingEmails(true);
    const res = await fetch("/api/admin/settings/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails }),
    });
    if (res.ok) {
      // saved
    }
    setSavingEmails(false);
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((p) => p - 1);
      setTimeout(fetchData, 0);
    }
  };

  const handleNext = () => {
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    if (page < maxPage) {
      setPage((p) => p + 1);
      setTimeout(fetchData, 0);
    }
  };

  const toggleUnreadFilter = () => {
    setFilterUnread((v) => !v);
    setPage(1);
    setTimeout(fetchData, 0);
  };

  return (
    <div>
      <AdminSettingsNav />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Zgłoszenia kontaktowe
          </h1>
          <p className="text-[#b0b0b0]">
            Podgląd zapytań ze strony oraz konfiguracja odbiorców maili.
          </p>
        </div>
      </div>

      <div className="mb-6 bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-3">
          Gdzie wysyłać maile (oddziel przecinkami)
        </h2>
        <div className="flex gap-3">
          <input
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white"
          />
          <button
            onClick={saveEmails}
            disabled={savingEmails}
            className="px-4 py-2 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] rounded-lg text-white"
          >
            Zapisz
          </button>
        </div>
      </div>

      <div className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-[#1b3caf]/20">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleUnreadFilter}
              className={`px-3 py-1 rounded ${filterUnread ? "bg-[#1b3caf] text-white" : "bg-[#242d3d] text-[#b0b0b0]"}`}
            >
              {filterUnread ? "Tylko nieprzeczytane" : "Wszystkie"}
            </button>
            <div className="text-sm text-[#b0b0b0]">{total} zgłoszeń</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="px-3 py-1 bg-[#242d3d] rounded"
            >
              Poprzednia
            </button>
            <div className="text-sm text-[#b0b0b0]">{page}</div>
            <button
              onClick={handleNext}
              className="px-3 py-1 bg-[#242d3d] rounded"
            >
              Następna
            </button>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-white">Ładowanie...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-[#b0b0b0]">Brak zgłoszeń</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f1419] border-b border-[#1b3caf]/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Klient
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Kontakt
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Temat
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Produkt
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b3caf]/20">
                {items.map((c) => (
                  <tr key={c.id} className="hover:bg-[#242d3d] transition">
                    <td className="px-6 py-4">
                      <span className="text-[#8b92a9] text-sm">
                        {new Date(c.createdAt).toLocaleString("pl-PL")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{c.name}</div>
                      <div className="text-[#b0b0b0] text-sm mt-1">
                        {c.message.slice(0, 120)}
                        {c.message.length > 120 ? "..." : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#b0b0b0] text-sm">
                        {c.email}
                        {c.phone ? " • " + c.phone : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#b0b0b0] text-sm">
                        {(() => {
                          const map: Record<string, string> = {
                            offer: "Zapytanie o ofertę",
                            service: "Serwis i części",
                            partnership: "Współpraca",
                            other: "Inne",
                          };
                          return c.topic ? (map[c.topic] || c.topic) : "–";
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#b0b0b0] text-sm">
                        {c.product?.name || "–"}
                      </div>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <button
                        title="Pokaż"
                        onClick={() => setSelected(c)}
                        className="text-[#1b3caf] hover:text-white"
                      >
                        <Mail className="w-5 h-5" />
                      </button>
                      <button
                        title="Oznacz jako przeczytane"
                        onClick={() => toggleRead(c)}
                        className={`px-2 py-1 rounded ${c.read ? "bg-green-600 text-white" : "bg-[#242d3d] text-[#b0b0b0]"}`}
                      >
                        {c.read ? "Przeczytane" : "Oznacz"}
                      </button>
                      <button
                        title="Usuń"
                        onClick={() => handleDelete(c.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer / Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0f1419] p-6 rounded-lg w-full max-w-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {selected.name}
                </h3>
                <p className="text-sm text-[#b0b0b0]">
                  {selected.email}
                  {selected.phone ? " • " + selected.phone : ""}
                </p>
                <p className="text-sm text-[#b0b0b0] mt-1">
                  {(() => {
                    const map: Record<string, string> = {
                      offer: "Zapytanie o ofertę",
                      service: "Serwis i części",
                      partnership: "Współpraca",
                      other: "Inne",
                    };
                    return selected.topic ? (map[selected.topic] || selected.topic) : null;
                  })()}
                </p>
                <p className="text-sm text-[#8b92a9] mt-1">
                  {new Date(selected.createdAt).toLocaleString("pl-PL")}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-[#b0b0b0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 text-[#d0d8e6] whitespace-pre-line">
              {selected.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
