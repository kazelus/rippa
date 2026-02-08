"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (session) {
      router.push("/admin/dashboard");
    }
  }, [session, router]);

  useEffect(() => {
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0f1419] to-[#111827] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1b3caf] border-t-transparent" />
          <p className="text-[#8b92a9] text-sm">Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0f1419] to-[#111827] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1b3caf]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#0f9fdf]/6 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1b3caf]/20 to-transparent" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo & Brand */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1b3caf]/20 to-[#0f9fdf]/10 rounded-full blur-2xl scale-150" />
            <img
              src="/logo.png"
              alt="Rippa"
              className="relative mx-auto w-44 h-44 object-contain drop-shadow-2xl"
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Panel administracyjny
          </h1>
          <p className="text-[#6b7280] text-sm mt-1.5">Rippa Polska</p>
        </div>

        {/* Login Card */}
        <div className="bg-gradient-to-br from-white/[7%] to-white/[3%] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1b3caf] to-[#0f9fdf] flex items-center justify-center shadow-lg shadow-[#1b3caf]/25">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Zaloguj się</h2>
              <p className="text-xs text-[#6b7280]">
                Wprowadź swoje dane dostępowe
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-red-400 text-sm font-bold">!</span>
              </div>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#b0b8c9] mb-2">
                Adres email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@rippa.pl"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[5%] border border-white/10 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#1b3caf]/60 focus:ring-1 focus:ring-[#1b3caf]/30 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#b0b8c9] mb-2">
                Hasło
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/[5%] border border-white/10 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#1b3caf]/60 focus:ring-1 focus:ring-[#1b3caf]/30 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#4b5563] hover:text-[#8b92a9] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 cursor-pointer accent-[#1b3caf]"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-[#8b92a9] cursor-pointer select-none"
              >
                Zapamiętaj mnie
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#1b3caf]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  Logowanie...
                </>
              ) : (
                "Zaloguj się"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#4b5563] mt-8">
          © 2026 Rippa Polska · Wszystkie prawa zastrzeżone
        </p>
      </div>
    </div>
  );
}
