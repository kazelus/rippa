"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (session) {
      router.push("/admin/dashboard");
    }
  }, [session, router]);

  useEffect(() => {
    // Odczytaj zapisany email z localStorage
    const savedEmail = localStorage.getItem("adminEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Zapisz email jeśli wybrano "Zapamiętaj mnie"
      if (rememberMe) {
        localStorage.setItem("adminEmail", email);
      } else {
        localStorage.removeItem("adminEmail");
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email lub hasło są nieprawidłowe");
      } else if (result?.ok) {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Błąd. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e] flex items-center justify-center">
        <p className="text-white">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <img
            src="/logo.png"
            alt="Rippa"
            className="mx-auto w-48 h-48 mb-4 object-contain"
          />
          <h1 className="text-2xl md:text-3xl text-white font-semibold tracking-wide">
            Panel administracyjny
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Logowanie</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rippa.pl"
                className="w-full px-4 py-3 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Hasło
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] transition"
                required
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#1b3caf]/30 bg-[#242d3d] cursor-pointer accent-[#1b3caf]"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-[#b0b0b0] cursor-pointer"
              >
                Zapamiętaj mnie
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-8 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] hover:from-[#1b3caf]/80 hover:to-[#0f9fdf]/80 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logowanie..." : "Zaloguj się"}
            </button>
          </form>

          {/* Help text */}
          <p className="text-center text-sm text-[#8b92a9] mt-6">
            Domyślne dane: <br />
            <span className="text-white font-mono">admin@rippa.pl</span> /
            <span className="text-white font-mono"> admin123</span>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#6b7280] mt-8">
          Rippa Polska © 2026 - Wszystkie prawa zastrzeżone
        </p>
      </div>
    </div>
  );
}
