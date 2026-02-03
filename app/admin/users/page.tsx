"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Mail, ChevronLeft } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export default function UsersManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Błąd pobierania użytkowników");
      const data = await response.json();
      setUsers(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Błąd pobierania użytkowników");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword) {
      setError("Email i hasło są wymagane");
      return;
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          name: newUserName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Błąd dodawania użytkownika");
      }

      setSuccess("Użytkownik dodany pomyślnie");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      setShowAddForm(false);
      setError("");
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || "Błąd dodawania użytkownika");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Błąd usuwania użytkownika");

      setSuccess("Użytkownik usunięty");
      setError("");
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || "Błąd usuwania użytkownika");
    }
  };

  if (isLoading) {
    return <p className="text-white">Ładowanie użytkowników...</p>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Zarządzanie użytkownikami
          </h1>
          <p className="text-[#b0b0b0]">
            Dodaj nowych administratorów lub usuń istniejących
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] px-6 py-3 rounded-lg text-white font-semibold hover:shadow-lg transition"
        >
          <Plus className="w-5 h-5" />
          Dodaj użytkownika
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {/* Add User Form */}
      {showAddForm && (
        <div className="mb-8 bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Nowy użytkownik</h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@rippa.pl"
                  className="w-full px-4 py-2 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Imię i nazwisko
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Jan Kowalski"
                  className="w-full px-4 py-2 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Hasło
                </label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf]"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
              >
                Dodaj użytkownika
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-[#242d3d] hover:bg-[#2a3348] text-white font-semibold rounded-lg transition"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl overflow-hidden">
        {users.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#b0b0b0]">Brak użytkowników</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f1419] border-b border-[#1b3caf]/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Imię i nazwisko
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Data utworzenia
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b3caf]/20">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#242d3d] transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#1b3caf]" />
                        <span className="text-white font-mono text-sm">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#b0b0b0]">{user.name || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#8b92a9] text-sm">
                        {new Date(user.createdAt).toLocaleDateString("pl-PL")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-400 hover:text-red-300 transition"
                        title="Usuń użytkownika"
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

      {/* Help text */}
      <p className="text-[#8b92a9] text-sm mt-8">
        💡 Nowi użytkownicy otrzymają dostęp do panelu administracyjnego
        natychmiast po dodaniu. Mogą zalogować się na stronie /admin używając
        swoich danych.
      </p>
    </div>
  );
}
