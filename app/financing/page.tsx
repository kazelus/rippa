"use client";

import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  CreditCard,
  Calculator,
  FileText,
  Clock,
  CheckCircle,
  ArrowRight,
  Phone,
  Shield,
  TrendingUp,
  Banknote,
  ChevronDown,
  Minus,
  Plus,
  Sparkles,
  MousePointer2,
} from "lucide-react";

/* ─── Scroll-triggered animation hook ─── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

/* ─── Animated counter hook ─── */
function useCounter(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

/* ─── Format PLN ─── */
function formatPLN(value: number) {
  return value.toLocaleString("pl-PL") + " zł";
}

export default function FinancingPage() {
  /* FAQ accordion */
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* Calculator state */
  const [calcAmount, setCalcAmount] = useState(150000);
  const [calcMonths, setCalcMonths] = useState(36);
  const [calcType, setCalcType] = useState<"leasing" | "raty" | "kredyt">(
    "raty",
  );

  const monthlyRate = useCallback(() => {
    const rates = { leasing: 0.035, raty: 0, kredyt: 0.049 };
    const r = rates[calcType] / 12;
    if (r === 0) return calcAmount / calcMonths;
    return (
      (calcAmount * r * Math.pow(1 + r, calcMonths)) /
      (Math.pow(1 + r, calcMonths) - 1)
    );
  }, [calcAmount, calcMonths, calcType]);

  /* Scroll reveals */
  const heroReveal = useScrollReveal(0.1);
  const cardsReveal = useScrollReveal(0.05);
  const calcReveal = useScrollReveal(0.1);
  const stepsReveal = useScrollReveal(0.1);
  const statsReveal = useScrollReveal(0.15);
  const benefitsReveal = useScrollReveal(0.1);
  const faqReveal = useScrollReveal(0.1);
  const ctaReveal = useScrollReveal(0.1);

  /* Animated stats counters */
  const stat1 = useCounter(98, 2000, statsReveal.isVisible);
  const stat2 = useCounter(15, 1500, statsReveal.isVisible);
  const stat3 = useCounter(500, 2500, statsReveal.isVisible);
  const stat4 = useCounter(24, 1800, statsReveal.isVisible);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419]">
      <UnifiedNavbar />

      {/* Hero Section — full viewport with cards */}
      <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1b3caf]/8 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#0f9fdf]/5 rounded-full blur-[100px]" />
        {/* Floating particles */}
        <div
          className="absolute top-20 left-[15%] w-2 h-2 bg-[#1b3caf]/30 rounded-full animate-bounce"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        />
        <div
          className="absolute top-40 right-[20%] w-1.5 h-1.5 bg-[#0f9fdf]/40 rounded-full animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-32 left-[30%] w-1 h-1 bg-[#1b3caf]/20 rounded-full animate-bounce"
          style={{ animationDelay: "0.5s", animationDuration: "3.5s" }}
        />

        {/* Hero text */}
        <div
          ref={heroReveal.ref}
          className={`max-w-4xl mx-auto text-center relative z-10 transition-all duration-1000 mb-14 ${
            heroReveal.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1b3caf]/10 border border-[#1b3caf]/30 mb-6 animate-pulse">
            <Banknote className="w-4 h-4 text-[#1b3caf]" />
            <span className="text-sm text-[#b0b0b0]">
              Elastyczne opcje finansowania
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-5">
            Finansowanie
          </h1>
          <p className="text-xl text-[#b0b0b0] mb-6 max-w-2xl mx-auto">
            Kup maszynę na raty lub w leasingu — dopasujemy finansowanie do
            Twoich potrzeb
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] mx-auto" />
        </div>

        {/* Financing option cards — inside hero */}
        <div
          ref={cardsReveal.ref}
          className={`max-w-6xl mx-auto w-full relative z-10 transition-all duration-1000 delay-300 ${
            cardsReveal.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Leasing",
                desc: "Idealne rozwiązanie dla firm. Leasing operacyjny lub finansowy z niską ratą miesięczną. Koszty leasingu wliczasz w koszty działalności.",
                items: [
                  "Okres leasingu: 24–60 miesięcy",
                  "Wpłata własna już od 10%",
                  "Rata dostosowana do budżetu",
                  "Korzyści podatkowe dla firm",
                  "Możliwość wykupu po zakończeniu",
                ],
                label: "Dla firm (NIP)",
                popular: false,
                delay: "0ms",
              },
              {
                icon: CreditCard,
                title: "Raty 0%",
                desc: "Rozłóż płatność na wygodne raty — dla osób prywatnych i firm. Szybka decyzja kredytowa, minimum formalności.",
                items: [
                  "Raty 0% na wybrane modele",
                  "Okres: 6–36 miesięcy",
                  "Decyzja w 15 minut",
                  "Bez ukrytych kosztów",
                  "Dostępne dla osób prywatnych",
                ],
                label: "Dla firm i osób prywatnych",
                popular: true,
                delay: "150ms",
              },
              {
                icon: FileText,
                title: "Kredyt na maszynę",
                desc: "Finansowanie kredytem na zakup maszyny budowlanej. Współpracujemy z bankami, aby zapewnić najlepsze warunki.",
                items: [
                  "Kredyt do 100% wartości",
                  "Okres: 12–72 miesiące",
                  "Konkurencyjne oprocentowanie",
                  "Stała lub malejąca rata",
                  "Współpraca z wieloma bankami",
                ],
                label: "Dla firm i osób prywatnych",
                popular: false,
                delay: "300ms",
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className={`relative group transition-all duration-700 ${
                    cardsReveal.isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: card.delay }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1b3caf]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                  <div
                    className={`relative p-8 bg-gradient-to-br from-white/[7%] to-white/[2%] backdrop-blur-sm rounded-2xl transition-all duration-300 h-full flex flex-col group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-[#1b3caf]/10 ${
                      card.popular
                        ? "border-2 border-[#1b3caf]/40 hover:border-[#1b3caf]/60"
                        : "border border-white/10 hover:border-[#1b3caf]/40"
                    }`}
                  >
                    {card.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-4 py-1 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Popularne
                        </span>
                      </div>
                    )}
                    <div className="w-14 h-14 bg-gradient-to-br from-[#1b3caf] to-[#0f9fdf] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {card.title}
                    </h3>
                    <p className="text-[#b0b0b0] mb-6 flex-1">{card.desc}</p>
                    <ul className="space-y-3 mb-6">
                      {card.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-[#d0d8e6] group-hover:translate-x-1 transition-transform duration-300"
                          style={{ transitionDelay: `${i * 50}ms` }}
                        >
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-4 border-t border-white/10">
                      <span className="text-xs text-[#8b92a9] uppercase tracking-wider font-semibold">
                        {card.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll indicator at bottom */}
        <div className="flex flex-col items-center gap-2 animate-bounce mt-10 relative z-10">
          <MousePointer2 className="w-5 h-5 text-[#1b3caf]/60 rotate-180" />
          <span className="text-xs text-[#b0b0b0]/50 uppercase tracking-widest">
            Przewiń w dół
          </span>
        </div>
      </section>

      {/* ─── Interactive Calculator ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 border-y border-white/10">
        <div
          ref={calcReveal.ref}
          className={`max-w-4xl mx-auto transition-all duration-1000 ${
            calcReveal.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b3caf]/10 border border-[#1b3caf]/30 mb-4">
              <Calculator className="w-3.5 h-3.5 text-[#1b3caf]" />
              <span className="text-xs text-[#b0b0b0] uppercase tracking-wider">
                Kalkulator
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Oblicz swoją ratę
            </h2>
            <p className="text-[#b0b0b0] text-lg">
              Sprawdź orientacyjną wysokość miesięcznej raty
            </p>
          </div>

          <div className="bg-gradient-to-br from-white/[7%] to-white/[2%] border border-white/10 rounded-2xl p-8 md:p-10">
            {/* Financing type tabs */}
            <div className="flex flex-wrap gap-2 mb-10 justify-center">
              {[
                { key: "leasing" as const, label: "Leasing", icon: TrendingUp },
                { key: "raty" as const, label: "Raty 0%", icon: CreditCard },
                { key: "kredyt" as const, label: "Kredyt", icon: FileText },
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setCalcType(tab.key)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      calcType === tab.key
                        ? "bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white shadow-lg shadow-[#1b3caf]/30 scale-105"
                        : "bg-white/5 text-[#b0b0b0] border border-white/10 hover:border-[#1b3caf]/30 hover:text-white"
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Sliders */}
              <div className="space-y-8">
                {/* Amount */}
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm text-[#b0b0b0] font-medium">
                      Kwota finansowania
                    </label>
                    <span className="text-sm font-bold text-white">
                      {formatPLN(calcAmount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setCalcAmount((v) => Math.max(50000, v - 10000))
                      }
                      className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition flex-shrink-0"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="relative flex-1">
                      <input
                        type="range"
                        min={50000}
                        max={500000}
                        step={10000}
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(Number(e.target.value))}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-white/10 accent-[#1b3caf]"
                        style={{
                          background: `linear-gradient(to right, #1b3caf ${
                            ((calcAmount - 50000) / 450000) * 100
                          }%, rgba(255,255,255,0.1) ${
                            ((calcAmount - 50000) / 450000) * 100
                          }%)`,
                        }}
                      />
                    </div>
                    <button
                      onClick={() =>
                        setCalcAmount((v) => Math.min(500000, v + 10000))
                      }
                      className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-[#8b92a9]">
                    <span>50 000 zł</span>
                    <span>500 000 zł</span>
                  </div>
                </div>

                {/* Months */}
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm text-[#b0b0b0] font-medium">
                      Okres finansowania
                    </label>
                    <span className="text-sm font-bold text-white">
                      {calcMonths} mies.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCalcMonths((v) => Math.max(6, v - 6))}
                      className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition flex-shrink-0"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="relative flex-1">
                      <input
                        type="range"
                        min={6}
                        max={72}
                        step={6}
                        value={calcMonths}
                        onChange={(e) => setCalcMonths(Number(e.target.value))}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-white/10 accent-[#1b3caf]"
                        style={{
                          background: `linear-gradient(to right, #1b3caf ${
                            ((calcMonths - 6) / 66) * 100
                          }%, rgba(255,255,255,0.1) ${
                            ((calcMonths - 6) / 66) * 100
                          }%)`,
                        }}
                      />
                    </div>
                    <button
                      onClick={() => setCalcMonths((v) => Math.min(72, v + 6))}
                      className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-[#8b92a9]">
                    <span>6 mies.</span>
                    <span>72 mies.</span>
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#1b3caf]/10 to-[#0f9fdf]/5 border border-[#1b3caf]/20 rounded-2xl p-8">
                <span className="text-sm text-[#b0b0b0] mb-2 uppercase tracking-wider">
                  Orientacyjna rata miesięczna
                </span>
                <div className="text-5xl font-bold text-white mb-1 tabular-nums">
                  {formatPLN(Math.round(monthlyRate()))}
                </div>
                <span className="text-xs text-[#8b92a9] mb-6">/ miesiąc</span>

                <div className="grid grid-cols-2 gap-4 w-full text-center text-sm">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="text-[#b0b0b0]">Łącznie</div>
                    <div className="font-bold text-white">
                      {formatPLN(Math.round(monthlyRate() * calcMonths))}
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="text-[#b0b0b0]">
                      {calcType === "raty" ? "Nadpłata" : "Koszt odsetek"}
                    </div>
                    <div className="font-bold text-white">
                      {formatPLN(
                        Math.max(
                          0,
                          Math.round(monthlyRate() * calcMonths - calcAmount),
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-[#8b92a9] mt-4 text-center">
                  * Kalkulacja ma charakter poglądowy i nie stanowi oferty
                  handlowej
                </p>
              </div>
            </div>

            {/* CTA inside calculator */}
            <div className="mt-8 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 text-sm"
              >
                Zapytaj o dokładną ofertę
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div
          ref={stepsReveal.ref}
          className={`max-w-5xl mx-auto transition-all duration-1000 ${
            stepsReveal.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Jak to działa?
            </h2>
            <p className="text-[#b0b0b0] text-lg">
              4 proste kroki do sfinansowania Twojej maszyny
            </p>
          </div>

          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#1b3caf]/0 via-[#1b3caf]/40 to-[#1b3caf]/0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  icon: Calculator,
                  title: "Wybierz maszynę",
                  desc: "Wybierz interesujący Cię model z naszego katalogu",
                },
                {
                  step: "02",
                  icon: FileText,
                  title: "Złóż wniosek",
                  desc: "Skontaktuj się z nami — pomożemy wypełnić dokumenty",
                },
                {
                  step: "03",
                  icon: Clock,
                  title: "Szybka decyzja",
                  desc: "Decyzja kredytowa nawet w ciągu 15 minut",
                },
                {
                  step: "04",
                  icon: CheckCircle,
                  title: "Odbierz maszynę",
                  desc: "Po akceptacji maszyna jest gotowa do odbioru",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className={`text-center group transition-all duration-700 ${
                      stepsReveal.isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-8"
                    }`}
                    style={{ transitionDelay: `${i * 200}ms` }}
                  >
                    <div className="relative mb-6">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#1b3caf]/20 to-[#0f9fdf]/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-[#1b3caf]/40 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 relative z-10">
                        <Icon className="w-8 h-8 text-[#1b3caf] group-hover:scale-110 transition" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] rounded-lg flex items-center justify-center text-white text-xs font-bold z-20 group-hover:scale-110 transition-transform">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[#b0b0b0] text-sm">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Animated Stats ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5 border-y border-white/10">
        <div
          ref={statsReveal.ref}
          className={`max-w-5xl mx-auto transition-all duration-1000 ${
            statsReveal.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                value: stat1,
                suffix: "%",
                label: "Pozytywnych decyzji",
                color: "from-green-400 to-emerald-500",
              },
              {
                value: stat2,
                suffix: " min",
                label: "Czas decyzji",
                color: "from-[#1b3caf] to-[#0f9fdf]",
              },
              {
                value: stat3,
                suffix: "+",
                label: "Zadowolonych klientów",
                color: "from-[#0f9fdf] to-cyan-400",
              },
              {
                value: stat4,
                suffix: "/7",
                label: "Wsparcie online",
                color: "from-purple-400 to-indigo-500",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-xl bg-white/[3%] hover:bg-white/[6%] transition-all duration-300 group cursor-default"
              >
                <div
                  className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent tabular-nums group-hover:scale-110 transition-transform duration-300`}
                >
                  {stat.value}
                  {stat.suffix}
                </div>
                <div className="text-sm text-[#b0b0b0] mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div
          ref={benefitsReveal.ref}
          className={`max-w-5xl mx-auto transition-all duration-1000 ${
            benefitsReveal.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Dlaczego finansowanie u nas?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Shield,
                title: "Bezpieczeństwo transakcji",
                desc: "Współpracujemy z renomowanymi instytucjami finansowymi. Wszystko jasne i przejrzyste, bez ukrytych opłat.",
                delay: "0ms",
              },
              {
                icon: Clock,
                title: "Szybki proces",
                desc: "Minimum biurokracji — pomagamy na każdym etapie. Decyzja kredytowa nawet w ciągu jednego dnia roboczego.",
                delay: "100ms",
              },
              {
                icon: Calculator,
                title: "Elastyczne warunki",
                desc: "Dopasowujemy wysokość rat i okres finansowania do Twoich możliwości. Indywidualne podejście do każdego klienta.",
                delay: "200ms",
              },
              {
                icon: CreditCard,
                title: "Bez wpłaty własnej",
                desc: "Na wybrane modele oferujemy finansowanie nawet bez wkładu własnego. Zapytaj o szczegóły dla konkretnego modelu.",
                delay: "300ms",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-5 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#1b3caf]/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1b3caf]/5 transition-all duration-300 cursor-default group ${
                    benefitsReveal.isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: item.delay }}
                >
                  <div className="w-12 h-12 bg-[#1b3caf]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#1b3caf]/20 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-[#1b3caf]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-[#b0b0b0] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ — Interactive Accordion */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 border-y border-white/10">
        <div
          ref={faqReveal.ref}
          className={`max-w-3xl mx-auto transition-all duration-1000 ${
            faqReveal.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Najczęściej zadawane pytania
            </h2>
            <p className="text-[#b0b0b0]">
              Kliknij pytanie, aby zobaczyć odpowiedź
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Jakie dokumenty potrzebuję do leasingu?",
                a: "Dla firm wystarczy NIP, dokumenty rejestrowe i wyciąg z konta firmowego. Pomagamy przygotować komplet dokumentów.",
              },
              {
                q: "Czy osoba prywatna może skorzystać z finansowania?",
                a: "Tak! Oferujemy raty i kredyt również dla osób prywatnych. Wystarczy dowód osobisty i zaświadczenie o dochodach.",
              },
              {
                q: "Jak szybko otrzymam decyzję?",
                a: "W większości przypadków decyzja zapada w ciągu 15 minut do jednego dnia roboczego, w zależności od formy finansowania.",
              },
              {
                q: "Czy mogę spłacić finansowanie wcześniej?",
                a: "Tak, wszystkie nasze opcje finansowania umożliwiają wcześniejszą spłatę bez dodatkowych opłat lub z minimalną prowizją.",
              },
              {
                q: "Czy maszyna jest ubezpieczona w trakcie leasingu?",
                a: "W ramach leasingu maszyna wymaga ubezpieczenia. Pomagamy dobrać najkorzystniejszą polisę od naszych partnerów ubezpieczeniowych.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                  openFaq === i
                    ? "bg-gradient-to-br from-[#1b3caf]/10 to-[#0f9fdf]/5 border-[#1b3caf]/30"
                    : "bg-gradient-to-br from-white/[5%] to-white/[2%] border-white/10 hover:border-white/20"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left gap-4 group"
                >
                  <h3 className="text-lg font-semibold text-white flex items-start gap-3">
                    <span
                      className={`text-sm font-bold mt-0.5 transition-colors duration-300 ${
                        openFaq === i ? "text-[#0f9fdf]" : "text-[#1b3caf]"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.q}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-[#1b3caf] flex-shrink-0 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-400 ${
                    openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-[#b0b0b0] leading-relaxed px-6 pb-6 pl-14">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div
          ref={ctaReveal.ref}
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            ctaReveal.isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <div className="bg-gradient-to-r from-[#1b3caf]/20 to-[#0f9fdf]/20 border border-[#1b3caf]/30 rounded-2xl p-12 relative overflow-hidden group hover:border-[#1b3caf]/50 transition-all duration-500">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#1b3caf]/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#0f9fdf]/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">
                Chcesz poznać szczegóły finansowania?
              </h2>
              <p className="text-[#b0b0b0] text-lg mb-8 max-w-2xl mx-auto">
                Skontaktuj się z nami, a przygotujemy indywidualną ofertę
                finansowania dopasowaną do Twoich potrzeb
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="px-8 py-3 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  Zapytaj o finansowanie
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="tel:+48787148016"
                  className="px-8 py-3 bg-white/10 text-white font-bold rounded-lg border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  +48 787 148 016
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f1419]/80 border-t border-white/10 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#b0b0b0] text-sm">
          <div className="mb-2">
            <Link
              href="/contact"
              className="text-white font-semibold hover:underline"
            >
              Skontaktuj się z nami
            </Link>
          </div>
          <p>&copy; 2025 Rippa Polska. Wszystkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
}
