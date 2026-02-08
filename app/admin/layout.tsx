"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { LogOut, ChevronLeft } from "lucide-react";
import Toasts from "@/components/Toast";
import LoadingScreen from "@/components/LoadingScreen";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Nie przekierowuj na stronie logowania
    if (
      status === "unauthenticated" &&
      pathname !== "/admin" &&
      !pathname.includes("/admin/")
    ) {
      router.push("/admin");
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return <LoadingScreen />;
  }

  // Pokaż stronę logowania nawet jeśli nie zalogowany
  const isLoginPage = pathname === "/admin";
  if (!session && !isLoginPage) {
    return null;
  }

  // Na stronie logowania nie pokazuj headera
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Nie pokazuj przycisku "Wróć" na stronie głównej dashboardu
  const showBackButton = pathname !== "/admin/dashboard";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e]">
      {/* Header */}
      <header className="bg-[#1a1f2e] border-b border-[#1b3caf]/30 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="flex items-center gap-2 p-2 text-sm text-[#b0b0b0] hover:text-white bg-[#242d3d] hover:bg-[#2a3348] rounded-md transition shadow-sm border border-[#1b3caf]/10"
                title="Wróć do dashboardu"
              >
                <div className="bg-transparent p-1 rounded-md flex items-center justify-center">
                  <ChevronLeft className="w-5 h-5" />
                </div>
              </button>
            )}
            <img
              src="/logo.png"
              alt="Rippa"
              className="w-28 h-28 object-contain"
            />
            <div>
              <p className="text-sm text-[#b0b0b0]">
                Zalogowany jako: {session?.user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin" })}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#b0b0b0] hover:text-white border border-[#1b3caf]/30 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Wyloguj się
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-12">{children}</main>
      <Toasts />
    </div>
  );
}
