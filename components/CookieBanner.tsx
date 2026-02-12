"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const COOKIE_CONSENT_KEY = "rippa-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on load
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "dismissed");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto">
        <div className="relative bg-[#0f1319]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl shadow-black/40">
          {/* Dismiss X */}
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 text-[#636b82] hover:text-white transition-colors p-1"
            aria-label="Zamknij"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#1b3caf]/15 flex items-center justify-center text-[#0f9fdf]">
              <Cookie className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#b0b8cc] text-sm leading-relaxed mb-3">
                Używamy plików cookies w celu zapewnienia prawidłowego działania
                strony.{" "}
                <Link
                  href="/privacy"
                  className="text-[#0f9fdf] hover:underline"
                >
                  Dowiedz się więcej
                </Link>
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={accept}
                  className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#1b3caf] to-[#0f4fdf] rounded-lg hover:shadow-lg hover:shadow-[#1b3caf]/25 transition-all duration-300"
                >
                  Akceptuję
                </button>
                <button
                  onClick={dismiss}
                  className="px-5 py-2 text-xs font-semibold text-[#8b92a9] hover:text-white border border-white/[0.08] rounded-lg hover:border-white/15 transition-all duration-300"
                >
                  Odrzuć
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
