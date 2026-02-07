"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Package,
  Mail,
  Settings,
  Tag,
  SlidersHorizontal,
  Puzzle,
  MessageCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Clock,
  Bell,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Inbox,
  ExternalLink,
} from "lucide-react";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  topic?: string;
  read: boolean;
  createdAt: string;
  product?: { id: string; name: string } | null;
}

export default function AdminDashboard() {
  const [models, setModels] = useState<any[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [unreadContacts, setUnreadContacts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [modelsRes, contactsRes, unreadRes] = await Promise.all([
        fetch("/api/models?all=true"),
        fetch("/api/admin/contacts?pageSize=5"),
        fetch("/api/admin/contacts?unread=1&pageSize=100"),
      ]);

      const modelsData = await modelsRes.json();
      const contactsData = await contactsRes.json();
      const unreadData = await unreadRes.json();

      setModels(modelsData);
      setContacts(contactsData.items || []);
      setTotalContacts(contactsData.total || 0);
      setUnreadContacts(unreadData.total || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, read: true } : c)),
      );
      setUnreadContacts((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const visibleModels = models.filter((m: any) => m.visible !== false);
  const hiddenModels = models.filter((m: any) => m.visible === false);
  const featuredModels = models.filter((m: any) => m.featured);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1b3caf] border-t-transparent" />
          <p className="text-[#8b92a9] text-sm">Ładowanie dashboardu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[#8b92a9] text-sm mb-1">Panel administracyjny</p>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/models/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-[#1b3caf]/30 hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Nowy model
          </Link>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Modele w katalogu",
            value: models.length,
            icon: Package,
            color: "from-[#1b3caf] to-[#0f9fdf]",
            detail: `${visibleModels.length} widocznych`,
            href: "/admin/models",
          },
          {
            label: "Bestsellery",
            value: featuredModels.length,
            icon: TrendingUp,
            color: "from-amber-500 to-orange-500",
            detail: `z ${models.length} modeli`,
            href: "/admin/models",
          },
          {
            label: "Zgłoszenia",
            value: totalContacts,
            icon: Mail,
            color: "from-emerald-500 to-teal-500",
            detail: `${unreadContacts} nieprzeczytanych`,
            href: "/admin/contacts",
          },
          {
            label: "Ukryte modele",
            value: hiddenModels.length,
            icon: EyeOff,
            color: "from-rose-500 to-pink-500",
            detail: "niewidoczne na stronie",
            href: "/admin/models",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              href={stat.href}
              className="group p-5 bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl hover:border-[#1b3caf]/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#8b92a9] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-3xl font-bold text-white mb-0.5 tabular-nums">
                {stat.value}
              </p>
              <p className="text-sm text-[#8b92a9]">{stat.label}</p>
              <p className="text-xs text-[#6b7280] mt-1">{stat.detail}</p>
            </Link>
          );
        })}
      </div>

      {/* ─── Quick Actions ─── */}
      <div>
        <h3 className="text-sm font-semibold text-[#8b92a9] uppercase tracking-wider mb-4">
          Szybkie akcje
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              href: "/admin/models",
              icon: Package,
              label: "Modele",
              color: "text-[#0f9fdf]",
              bg: "bg-[#0f9fdf]/10",
            },
            {
              href: "/admin/categories",
              icon: Tag,
              label: "Kategorie",
              color: "text-violet-400",
              bg: "bg-violet-400/10",
            },
            {
              href: "/admin/features",
              icon: SlidersHorizontal,
              label: "Cechy",
              color: "text-emerald-400",
              bg: "bg-emerald-400/10",
            },
            {
              href: "/admin/parameters",
              icon: BarChart3,
              label: "Parametry",
              color: "text-amber-400",
              bg: "bg-amber-400/10",
            },
            {
              href: "/admin/accessories",
              icon: Puzzle,
              label: "Akcesoria",
              color: "text-pink-400",
              bg: "bg-pink-400/10",
            },
            {
              href: "/admin/settings",
              icon: Settings,
              label: "Ustawienia",
              color: "text-[#8b92a9]",
              bg: "bg-white/5",
            },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={i}
                href={action.href}
                className="group flex flex-col items-center gap-2.5 p-4 rounded-xl bg-white/[3%] border border-white/[6%] hover:border-white/15 hover:bg-white/[6%] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div
                  className={`w-10 h-10 ${action.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <span className="text-sm text-[#b0b0b0] font-medium group-hover:text-white transition-colors">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ─── Main content: Notifications + Recent Models ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Notifications / Contact submissions — 3 cols */}
        <div className="lg:col-span-3 bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Powiadomienia</h3>
                <p className="text-xs text-[#8b92a9]">
                  Ostatnie zgłoszenia kontaktowe
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {unreadContacts > 0 && (
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                  {unreadContacts} nowych
                </span>
              )}
              <Link
                href="/admin/contacts"
                className="text-xs text-[#8b92a9] hover:text-white transition flex items-center gap-1"
              >
                Wszystkie
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
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
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`px-6 py-4 hover:bg-white/[3%] transition-colors group ${
                    !contact.read ? "bg-[#1b3caf]/[3%]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status indicator */}
                    <div className="mt-1.5 flex-shrink-0">
                      {!contact.read ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`font-semibold truncate ${
                              !contact.read ? "text-white" : "text-[#b0b0b0]"
                            }`}
                          >
                            {contact.name}
                          </span>
                          {contact.topic && (
                            <span className="px-2 py-0.5 bg-white/5 text-[#8b92a9] text-[10px] rounded-full flex-shrink-0 uppercase tracking-wider">
                              {contact.topic}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#6b7280] flex-shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(contact.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-[#8b92a9] line-clamp-1 mb-1">
                        {contact.message}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#6b7280]">
                          {contact.email}
                        </span>
                        {contact.product && (
                          <span className="text-xs text-[#1b3caf]">
                            → {contact.product.name}
                          </span>
                        )}
                        {!contact.read && (
                          <button
                            onClick={() => markAsRead(contact.id)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 transition opacity-0 group-hover:opacity-100 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Oznacz jako przeczytane
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent models — 2 cols */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1b3caf]/10 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-[#1b3caf]" />
              </div>
              <h3 className="text-white font-semibold">Ostatnie modele</h3>
            </div>
            <Link
              href="/admin/models"
              className="text-xs text-[#8b92a9] hover:text-white transition flex items-center gap-1"
            >
              Zarządzaj
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-white/[6%]">
            {models.slice(0, 6).map((model: any) => (
              <Link
                key={model.id}
                href={`/admin/models/${model.id}/edit`}
                className="flex items-center gap-3 px-6 py-3.5 hover:bg-white/[3%] transition-colors group"
              >
                {/* Thumbnail */}
                {model.images && model.images.length > 0 ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                    <img
                      src={model.images[0].url}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-[#6b7280]" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate group-hover:text-[#0f9fdf] transition-colors">
                    {model.name}
                  </p>
                  <p className="text-xs text-[#6b7280]">
                    {model.price?.toLocaleString("pl-PL")} PLN
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {model.featured && (
                    <span
                      className="w-2 h-2 rounded-full bg-amber-400"
                      title="Bestseller"
                    />
                  )}
                  {model.visible === false ? (
                    <EyeOff className="w-3.5 h-3.5 text-red-400/60" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-emerald-400/60" />
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-[#8b92a9] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>

          {models.length > 6 && (
            <div className="px-6 py-3 border-t border-white/[6%]">
              <Link
                href="/admin/models"
                className="text-xs text-[#8b92a9] hover:text-white transition"
              >
                + {models.length - 6} więcej modeli...
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
