"use client";

import React, { useEffect, useState } from "react";
import {
  Trash2,
  Mail,
  X,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Clock,
  CheckCircle2,
  Search,
  Send,
  ExternalLink,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { showToast } from "@/lib/toast";

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
  const [emailsSaved, setEmailsSaved] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);

  useEffect(() => {
    fetchData();
    fetchEmails();
  }, []);

  useEffect(() => {
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
    const res = await fetch("/api/admin/contacts", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      fetchData();
      showToast("Zgłoszenie usunięte", "success");
      if (selected?.id === id) setSelected(null);
    } else {
      showToast("Nie udało się usunąć zgłoszenia", "error");
    }
    setDeleteTarget(null);
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
      setEmailsSaved(true);
      setTimeout(() => setEmailsSaved(false), 3000);
    }
    setSavingEmails(false);
  };

  const maxPage = Math.max(1, Math.ceil(total / pageSize));

  const topicMap: Record<string, string> = {
    offer: "Zapytanie o ofertę",
    service: "Serwis i części",
    partnership: "Współpraca",
    other: "Inne",
  };

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Przed chwilą";
    if (mins < 60) return `${mins} min temu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h temu`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Wczoraj";
    return `${days} dni temu`;
  }

  const unreadCount = items.filter((c) => !c.read).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[#8b92a9] text-sm mb-1">Komunikacja z klientami</p>
          <h2 className="text-3xl font-bold text-white">
            Zgłoszenia kontaktowe
          </h2>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#8b92a9]">
          <span>{total} zgłoszeń</span>
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
              {unreadCount} nowych
            </span>
          )}
        </div>
      </div>

      {/* Email config */}
      <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-[#0f9fdf]/10 rounded-lg flex items-center justify-center">
            <Send className="w-4 h-4 text-[#0f9fdf]" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">
              Adresy e-mail do powiadomień
            </h3>
            <p className="text-xs text-[#8b92a9]">
              Oddziel przecinkami wielu odbiorców
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white/[5%] border border-white/10 rounded-xl text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf]/50 transition text-sm"
            placeholder="email1@firma.pl, email2@firma.pl"
          />
          <button
            onClick={saveEmails}
            disabled={savingEmails}
            className="px-5 py-2.5 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-[#1b3caf]/30 transition-all disabled:opacity-50"
          >
            {savingEmails ? "..." : emailsSaved ? "✓ Zapisano" : "Zapisz"}
          </button>
        </div>
      </div>

      {/* Filters + Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFilterUnread(false);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              !filterUnread
                ? "bg-[#1b3caf] text-white shadow-lg shadow-[#1b3caf]/20"
                : "bg-white/[5%] text-[#8b92a9] border border-white/10 hover:bg-white/[8%] hover:text-white"
            }`}
          >
            Wszystkie
          </button>
          <button
            onClick={() => {
              setFilterUnread(true);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              filterUnread
                ? "bg-[#1b3caf] text-white shadow-lg shadow-[#1b3caf]/20"
                : "bg-white/[5%] text-[#8b92a9] border border-white/10 hover:bg-white/[8%] hover:text-white"
            }`}
          >
            Nieprzeczytane
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => page > 1 && setPage((p) => p - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg bg-white/[5%] border border-white/10 text-[#8b92a9] hover:text-white hover:bg-white/[8%] transition-all disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-[#8b92a9] tabular-nums px-2">
            {page} / {maxPage}
          </span>
          <button
            onClick={() => page < maxPage && setPage((p) => p + 1)}
            disabled={page >= maxPage}
            className="p-2 rounded-lg bg-white/[5%] border border-white/10 text-[#8b92a9] hover:text-white hover:bg-white/[8%] transition-all disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1b3caf] border-t-transparent" />
              <p className="text-[#8b92a9] text-sm">Ładowanie...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-[#8b92a9]" />
            </div>
            <p className="text-white font-medium mb-1">Brak zgłoszeń</p>
            <p className="text-[#8b92a9] text-sm">
              Nowe wiadomości pojawią się tutaj
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[6%]">
            {items.map((c) => (
              <div
                key={c.id}
                className={`px-6 py-4 hover:bg-white/[3%] transition-colors group cursor-pointer ${
                  !c.read ? "bg-[#1b3caf]/[3%]" : ""
                }`}
                onClick={() => setSelected(c)}
              >
                <div className="flex items-start gap-3">
                  {/* Status dot */}
                  <div className="mt-2 flex-shrink-0">
                    {!c.read ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`font-semibold truncate ${!c.read ? "text-white" : "text-[#b0b0b0]"}`}
                        >
                          {c.name}
                        </span>
                        {c.topic && (
                          <span className="px-2 py-0.5 bg-white/5 text-[#8b92a9] text-[10px] rounded-full flex-shrink-0 uppercase tracking-wider">
                            {topicMap[c.topic] || c.topic}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#6b7280] flex-shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-[#8b92a9] line-clamp-1 mb-1.5">
                      {c.message}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#6b7280]">{c.email}</span>
                      {c.phone && (
                        <span className="text-xs text-[#6b7280]">
                          • {c.phone}
                        </span>
                      )}
                      {c.product && (
                        <span className="text-xs text-[#1b3caf]">
                          → {c.product.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => toggleRead(c)}
                      className={`p-1.5 rounded-lg transition-all ${c.read ? "text-[#8b92a9] hover:text-emerald-400 hover:bg-emerald-400/10" : "text-emerald-400 hover:bg-emerald-400/10"}`}
                      title={
                        c.read
                          ? "Oznacz jako nieprzeczytane"
                          : "Oznacz jako przeczytane"
                      }
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      title="Usuń"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#1a1f2e] border border-white/10 p-6 rounded-2xl w-full max-w-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {selected.name}
                </h3>
                <p className="text-sm text-[#8b92a9] mt-1">
                  {selected.email}
                  {selected.phone ? ` • ${selected.phone}` : ""}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {selected.topic && (
                    <span className="px-2.5 py-0.5 bg-white/5 text-[#8b92a9] text-xs rounded-full">
                      {topicMap[selected.topic] || selected.topic}
                    </span>
                  )}
                  <span className="text-xs text-[#6b7280]">
                    {new Date(selected.createdAt).toLocaleString("pl-PL")}
                  </span>
                </div>
                {selected.product && (
                  <p className="text-sm text-[#1b3caf] mt-2">
                    Produkt: {selected.product.name}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg text-[#8b92a9] hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 p-4 bg-white/[3%] border border-white/[6%] rounded-xl text-[#d0d8e6] whitespace-pre-line text-sm leading-relaxed">
              {selected.message}
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/[6%]">
              <button
                onClick={() => {
                  toggleRead(selected);
                  setSelected(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                {selected.read
                  ? "Oznacz jako nieprzeczytane"
                  : "Oznacz jako przeczytane"}
              </button>
              <button
                onClick={() => {
                  setDeleteTarget(selected);
                  setSelected(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Usunąć zgłoszenie?"
        message={`Czy na pewno chcesz usunąć zgłoszenie od „${deleteTarget?.name}" (${deleteTarget?.email})?`}
        confirmLabel="Usuń zgłoszenie"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
