"use client";

import { useEffect, useState } from "react";
import {
  Server,
  Eye,
  EyeOff,
  Shield,
  Save,
  CheckCircle2,
  Trash2,
  Plus,
  Mail,
  Users,
  X,
  UserPlus,
  Settings,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { showToast } from "@/lib/toast";

type Tab = "smtp" | "users";

interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>("smtp");

  // --- SMTP state ---
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // --- Users state ---
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  useEffect(() => {
    fetchSmtp();
    fetchUsers();
  }, []);

  // --- SMTP ---
  const fetchSmtp = async () => {
    const res = await fetch("/api/admin/settings/smtp");
    if (res.ok) {
      const data = await res.json();
      setValues(data.values || {});
    }
  };

  const handleSmtpChange = (k: string, v: string) =>
    setValues((s) => ({ ...s, [k]: v }));

  const saveSmtp = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings/smtp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      await fetchSmtp();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  // --- Users ---
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Błąd");
      setUsers(await res.json());
    } catch {
      setUserError("Błąd pobierania użytkowników");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword) {
      setUserError("Email i hasło są wymagane");
      return;
    }
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          name: newUserName,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Błąd");
      }
      setUserSuccess("Użytkownik dodany pomyślnie");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      setShowAddForm(false);
      setUserError("");
      await fetchUsers();
      setTimeout(() => setUserSuccess(""), 3000);
    } catch (err: any) {
      setUserError(err.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Błąd");
      showToast("Użytkownik usunięty", "success");
      await fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Błąd usuwania użytkownika", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-white/[5%] border border-white/10 rounded-xl text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf]/50 transition text-sm";
  const labelClass = "block text-sm font-medium text-[#b0b0b0] mb-2";

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "smtp", label: "Email / SMTP", icon: Server },
    { key: "users", label: "Użytkownicy", icon: Users },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <p className="text-[#8b92a9] text-sm mb-1">Konfiguracja systemu</p>
        <h2 className="text-3xl font-bold text-white">Ustawienia</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/[3%] border border-white/[6%] rounded-xl w-fit">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === t.key
                  ? "bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white shadow-lg shadow-[#1b3caf]/20"
                  : "text-[#8b92a9] hover:text-white hover:bg-white/[5%]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ========= SMTP TAB ========= */}
      {tab === "smtp" && (
        <div className="space-y-6">
          {/* SendGrid */}
          <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#0f9fdf]/10 flex items-center justify-center">
                <SendIcon className="w-5 h-5 text-[#0f9fdf]" />
              </div>
              <div>
                <h3 className="text-white font-semibold">SendGrid API</h3>
                <p className="text-xs text-[#8b92a9]">
                  Opcjonalnie — jeśli używasz SendGrid
                </p>
              </div>
            </div>
            <div>
              <label className={labelClass}>SendGrid API Key</label>
              <input
                value={values.sendgrid_api_key || ""}
                onChange={(e) =>
                  handleSmtpChange("sendgrid_api_key", e.target.value.trim())
                }
                className={inputClass}
                placeholder="SG.xxxx..."
              />
            </div>
          </div>

          {/* SMTP */}
          <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Server className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Serwer SMTP</h3>
                <p className="text-xs text-[#8b92a9]">
                  Konfiguracja bezpośredniego serwera SMTP
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>SMTP Host</label>
                <input
                  value={values.smtp_host || ""}
                  onChange={(e) =>
                    handleSmtpChange("smtp_host", e.target.value.trim())
                  }
                  className={inputClass}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>SMTP Port</label>
                  <input
                    value={values.smtp_port || ""}
                    onChange={(e) =>
                      handleSmtpChange("smtp_port", e.target.value.trim())
                    }
                    className={inputClass}
                    placeholder="587"
                  />
                </div>
                <div>
                  <label className={labelClass}>SMTP Secure</label>
                  <select
                    value={values.smtp_secure || "false"}
                    onChange={(e) =>
                      handleSmtpChange("smtp_secure", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="false">Nie (STARTTLS)</option>
                    <option value="true">Tak (SSL/TLS)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>SMTP User</label>
                <input
                  value={values.smtp_user || ""}
                  onChange={(e) =>
                    handleSmtpChange("smtp_user", e.target.value)
                  }
                  className={inputClass}
                  placeholder="user@domena.pl"
                />
              </div>
              <div>
                <label className={labelClass}>SMTP Pass</label>
                <div className="flex gap-2">
                  <input
                    type={showPass ? "text" : "password"}
                    value={values.smtp_pass || ""}
                    onChange={(e) =>
                      handleSmtpChange("smtp_pass", e.target.value)
                    }
                    className={`flex-1 ${inputClass}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="px-3 py-2 bg-white/[5%] border border-white/10 rounded-xl text-[#8b92a9] hover:text-white hover:bg-white/[8%] transition-all"
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>From Address</label>
                <input
                  value={values.smtp_from || ""}
                  onChange={(e) =>
                    handleSmtpChange("smtp_from", e.target.value.trim())
                  }
                  className={inputClass}
                  placeholder="noreply@rippa-polska.pl"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-3 px-4 py-3 bg-white/[3%] border border-white/[6%] rounded-xl">
                  <input
                    type="checkbox"
                    id="selfSigned"
                    checked={values.smtp_allow_self_signed === "true"}
                    onChange={(e) =>
                      handleSmtpChange(
                        "smtp_allow_self_signed",
                        e.target.checked ? "true" : "false",
                      )
                    }
                    className="w-4 h-4 accent-[#0f9fdf] rounded"
                  />
                  <div>
                    <label
                      htmlFor="selfSigned"
                      className="text-sm text-white cursor-pointer flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      Zezwól na samopodpisane certyfikaty
                    </label>
                    <p className="text-xs text-[#6b7280] mt-0.5">
                      Tylko dla środowisk dev/test
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-4">
            <button
              onClick={saveSmtp}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#1b3caf]/30 hover:scale-105 transition-all duration-300 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Zapisywanie...
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Zapisano!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Zapisz ustawienia
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========= USERS TAB ========= */}
      {tab === "users" && (
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-[#1b3caf]/30 hover:scale-105 transition-all duration-300"
            >
              {showAddForm ? (
                <X className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {showAddForm ? "Anuluj" : "Dodaj użytkownika"}
            </button>
          </div>

          {/* Messages */}
          {userError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{userError}</p>
            </div>
          )}
          {userSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <p className="text-emerald-400 text-sm">{userSuccess}</p>
            </div>
          )}

          {/* Add User Form */}
          {showAddForm && (
            <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#0f9fdf]/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-[#0f9fdf]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Nowy użytkownik</h3>
                  <p className="text-xs text-[#8b92a9]">
                    Będzie mógł się zalogować do panelu
                  </p>
                </div>
              </div>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="user@rippa.pl"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Imię i nazwisko</label>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Jan Kowalski"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Hasło *</label>
                    <input
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#1b3caf]/30 transition-all duration-300 text-sm"
                  >
                    Dodaj użytkownika
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2.5 bg-white/[5%] border border-white/10 text-[#b0b0b0] hover:text-white hover:bg-white/[8%] font-medium rounded-xl transition-all text-sm"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users list */}
          <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1b3caf]/10 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#1b3caf]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Administratorzy</h3>
                  <p className="text-xs text-[#8b92a9]">
                    {users.length} użytkowników
                  </p>
                </div>
              </div>
            </div>

            {usersLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1b3caf] border-t-transparent" />
                  <p className="text-[#8b92a9] text-sm">Ładowanie...</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-[#8b92a9]" />
                </div>
                <p className="text-white font-medium mb-1">Brak użytkowników</p>
                <p className="text-[#8b92a9] text-sm">
                  Dodaj pierwszego administratora
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[6%]">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-white/[3%] transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1b3caf] to-[#0f9fdf] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold truncate">
                            {user.name || "Bez nazwy"}
                          </p>
                          <Shield className="w-3.5 h-3.5 text-[#0f9fdf] flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Mail className="w-3 h-3 text-[#6b7280]" />
                          <span className="text-xs text-[#8b92a9] truncate">
                            {user.email}
                          </span>
                          <span className="text-xs text-[#6b7280]">•</span>
                          <span className="text-xs text-[#6b7280]">
                            {new Date(user.createdAt).toLocaleDateString(
                              "pl-PL",
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(user)}
                      className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0"
                      title="Usuń użytkownika"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help */}
          <div className="flex items-start gap-3 px-4 py-3 bg-white/[3%] border border-white/[6%] rounded-xl">
            <span className="text-lg">💡</span>
            <p className="text-[#8b92a9] text-sm">
              Nowi użytkownicy otrzymają dostęp do panelu administracyjnego
              natychmiast po dodaniu. Mogą zalogować się na stronie /admin
              używając swoich danych.
            </p>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Usunąć użytkownika?"
        message={`Czy na pewno chcesz usunąć użytkownika „${deleteTarget?.name || deleteTarget?.email}"? To działanie jest nieodwracalne.`}
        confirmLabel="Usuń użytkownika"
        variant="danger"
        onConfirm={() => deleteTarget && handleDeleteUser(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function SendIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
    </svg>
  );
}
