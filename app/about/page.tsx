"use client";

import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Award,
  Users,
  Zap,
  Shield,
  Globe,
  Wrench,
  CheckCircle,
  ArrowRight,
  Phone,
  ChevronDown,
  Truck,
  Target,
  Heart,
  Star,
  MousePointer2,
  MapPin,
  Handshake,
  Factory,
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
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* Scroll reveals */
  const heroReveal = useScrollReveal(0.1);
  const storyReveal = useScrollReveal(0.1);
  const whyReveal = useScrollReveal(0.1);
  const statsReveal = useScrollReveal(0.15);
  const valuesReveal = useScrollReveal(0.1);
  const processReveal = useScrollReveal(0.1);
  const faqReveal = useScrollReveal(0.1);
  const ctaReveal = useScrollReveal(0.1);

  /* Animated stats counters */
  const stat1 = useCounter(10, 2000, statsReveal.isVisible);
  const stat2 = useCounter(500, 2500, statsReveal.isVisible);
  const stat3 = useCounter(100, 2000, statsReveal.isVisible);
  const stat4 = useCounter(48, 1800, statsReveal.isVisible);

  // Static breadcrumbs for About page
  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Strona główna',
        item: 'https://rippapolska.pl',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'O nas',
        item: 'https://rippapolska.pl/about',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <UnifiedNavbar />

      {/* ─── Hero Section — full viewport ─── */}
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
        <div
          className="absolute top-60 right-[10%] w-1.5 h-1.5 bg-[#1b3caf]/25 rounded-full animate-bounce"
          style={{ animationDelay: "1.5s", animationDuration: "5s" }}
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
            <Factory className="w-4 h-4 text-[#1b3caf]" />
            <span className="text-sm text-[#b0b0b0]">
              Oficjalny importer marki Rippa w Polsce
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-5">
            O nas
          </h1>
          <p className="text-xl text-[#b0b0b0] mb-6 max-w-2xl mx-auto">
            Rippa Polska — Twój zaufany partner w branży maszyn budowlanych.
            Sprowadzamy sprawdzone minikoparki bezpośrednio od producenta.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] mx-auto" />
        </div>

        {/* Key pillars — inside hero */}
        <div
          className={`max-w-6xl mx-auto w-full relative z-10 transition-all duration-1000 delay-300 ${
            heroReveal.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Globe,
                title: "Bezpośredni import",
                desc: "Współpracujemy bezpośrednio z fabryką Rippa w Chinach, eliminując pośredników i zapewniając najlepsze ceny na rynku polskim.",
                items: [
                  "Bezpośrednia współpraca z fabryką",
                  "Bez pośredników — najlepsze ceny",
                  "Regularne dostawy z Chin",
                  "Certyfikowane maszyny z CE",
                ],
                highlight: false,
                delay: "0ms",
              },
              {
                icon: Shield,
                title: "Gwarancja i serwis",
                desc: "Zapewniamy pełne wsparcie posprzedażowe — polski serwis gwarancyjny, części zamienne i doradztwo techniczne na miejscu.",
                items: [
                  "Polska gwarancja na maszyny",
                  "Lokalny serwis w Polsce",
                  "Magazyn części zamiennych",
                  "Wsparcie techniczne po polsku",
                ],
                highlight: true,
                delay: "150ms",
              },
              {
                icon: Handshake,
                title: "Partnerskie podejście",
                desc: "Każdego klienta traktujemy indywidualnie. Doradzamy w doborze maszyny, organizujemy finansowanie i zapewniamy szkolenie z obsługi.",
                items: [
                  "Indywidualne doradztwo",
                  "Pomoc w finansowaniu",
                  "Szkolenie z obsługi maszyny",
                  "Długoterminowa współpraca",
                ],
                highlight: false,
                delay: "300ms",
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className={`relative group transition-all duration-700 ${
                    heroReveal.isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: card.delay }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1b3caf]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                  <div
                    className={`relative p-8 bg-gradient-to-br from-white/[7%] to-white/[2%] backdrop-blur-sm rounded-2xl transition-all duration-300 h-full flex flex-col group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-[#1b3caf]/10 ${
                      card.highlight
                        ? "border-2 border-[#1b3caf]/40 hover:border-[#1b3caf]/60"
                        : "border border-white/10 hover:border-[#1b3caf]/40"
                    }`}
                  >
                    {card.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-4 py-1 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Kluczowe
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
                    <ul className="space-y-3 mb-2">
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex flex-col items-center gap-2 animate-bounce mt-10 relative z-10">
          <MousePointer2 className="w-5 h-5 text-[#1b3caf]/60 rotate-180" />
          <span className="text-xs text-[#b0b0b0]/50 uppercase tracking-widest">
            Przewiń w dół
          </span>
        </div>
      </section>

      {/* ─── Our Story — Timeline ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 border-y border-white/10">
        <div
          ref={storyReveal.ref}
          className={`max-w-5xl mx-auto transition-all duration-1000 ${
            storyReveal.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b3caf]/10 border border-[#1b3caf]/30 mb-4">
              <Award className="w-3.5 h-3.5 text-[#1b3caf]" />
              <span className="text-xs text-[#b0b0b0] uppercase tracking-wider">
                Nasza historia
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Jak zaczęliśmy
            </h2>
            <p className="text-[#b0b0b0] text-lg max-w-2xl mx-auto">
              Od pasji do maszyn budowlanych do oficjalnego importera Rippa w
              Polsce
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line (desktop) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#1b3caf]/60 via-[#0f9fdf]/40 to-transparent hidden md:block" />

            <div className="space-y-12 md:space-y-16">
              {[
                {
                  side: "left" as const,
                  badge: "Początki",
                  badgeColor: "text-[#1b3caf]",
                  dotColor: "bg-[#1b3caf]",
                  ringColor: "ring-[#1b3caf]/20",
                  title: "Oficjalny importer marki Rippa",
                  text: "Rippa Polska to oficjalny dystrybutor minikoparek i osprzętu budowlanego marki Rippa na terenie Polski. Sprowadzamy sprawdzone maszyny bezpośrednio od producenta z Chin, oferując je w konkurencyjnych cenach.",
                  cardIcon: Award,
                  cardTitle: "Certyfikowana jakość",
                  cardText:
                    "Wszystkie maszyny spełniają europejskie normy bezpieczeństwa i posiadają oznaczenie CE",
                },
                {
                  side: "right" as const,
                  badge: "Dlaczego Rippa",
                  badgeColor: "text-[#0f9fdf]",
                  dotColor: "bg-[#0f9fdf]",
                  ringColor: "ring-[#0f9fdf]/20",
                  title: "Sprawdzona marka z Chin",
                  text: "Marka Rippa to uznany chiński producent minikoparek, który zdobył zaufanie klientów na całym świecie. Dzięki bezpośredniej współpracy z fabryką oferujemy atrakcyjne ceny bez pośredników.",
                  cardIcon: Zap,
                  cardTitle: "Nowoczesna technologia",
                  cardText:
                    "Silniki Kubota i Yanmar o najwyższej efektywności paliwowej",
                },
                {
                  side: "left" as const,
                  badge: "Wsparcie",
                  badgeColor: "text-[#1b3caf]",
                  dotColor: "bg-[#1b3caf]",
                  ringColor: "ring-[#1b3caf]/20",
                  title: "Serwis i części w Polsce",
                  text: "Zapewniamy pełne wsparcie posprzedażowe — serwis gwarancyjny, dostęp do części zamiennych i fachowe doradztwo techniczne. Kupując u nas, masz pewność obsługi na miejscu, bez czekania na dostawy z zagranicy.",
                  cardIcon: Users,
                  cardTitle: "Lokalny partner",
                  cardText:
                    "Polski serwis, polska gwarancja, szybki kontakt bez barier językowych",
                },
              ].map((item, i) => {
                const CardIcon = item.cardIcon;
                const isLeft = item.side === "left";
                return (
                  <div
                    key={i}
                    className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative transition-all duration-700 ${
                      storyReveal.isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-8"
                    }`}
                    style={{ transitionDelay: `${i * 200}ms` }}
                  >
                    {/* Left column */}
                    <div
                      className={`${isLeft ? "md:text-right md:pr-12" : "md:pr-12 md:order-1 order-1"}`}
                    >
                      {isLeft ? (
                        <>
                          <span
                            className={`${item.badgeColor} font-bold text-sm tracking-widest uppercase`}
                          >
                            {item.badge}
                          </span>
                          <h3 className="text-2xl font-bold text-white mt-2 mb-3">
                            {item.title}
                          </h3>
                          <p className="text-[#b0b0b0] text-lg leading-relaxed">
                            {item.text}
                          </p>
                        </>
                      ) : (
                        <div className="p-6 rounded-xl bg-gradient-to-br from-[#1b3caf]/10 to-[#0f9fdf]/5 border border-white/10 hover:border-[#1b3caf]/30 transition-all duration-300 group">
                          <CardIcon className="w-10 h-10 text-[#1b3caf] mb-3 group-hover:scale-110 transition-transform" />
                          <p className="text-white font-semibold">
                            {item.cardTitle}
                          </p>
                          <p className="text-[#8b92a9] text-sm mt-1">
                            {item.cardText}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Center dot */}
                    <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                      <div
                        className={`w-4 h-4 rounded-full ${item.dotColor} ring-4 ${item.ringColor}`}
                      />
                    </div>

                    {/* Right column */}
                    <div
                      className={`${isLeft ? "md:pl-12" : "md:pl-12 md:order-2 order-2"}`}
                    >
                      {isLeft ? (
                        <div className="p-6 rounded-xl bg-gradient-to-br from-[#1b3caf]/10 to-[#0f9fdf]/5 border border-white/10 hover:border-[#1b3caf]/30 transition-all duration-300 group">
                          <CardIcon className="w-10 h-10 text-[#1b3caf] mb-3 group-hover:scale-110 transition-transform" />
                          <p className="text-white font-semibold">
                            {item.cardTitle}
                          </p>
                          <p className="text-[#8b92a9] text-sm mt-1">
                            {item.cardText}
                          </p>
                        </div>
                      ) : (
                        <>
                          <span
                            className={`${item.badgeColor} font-bold text-sm tracking-widest uppercase`}
                          >
                            {item.badge}
                          </span>
                          <h3 className="text-2xl font-bold text-white mt-2 mb-3">
                            {item.title}
                          </h3>
                          <p className="text-[#b0b0b0] text-lg leading-relaxed">
                            {item.text}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Animated Stats ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
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
                suffix: "+",
                label: "Lat doświadczenia",
                color: "from-[#1b3caf] to-[#0f9fdf]",
              },
              {
                value: stat2,
                suffix: "+",
                label: "Zadowolonych klientów",
                color: "from-[#0f9fdf] to-cyan-400",
              },
              {
                value: stat3,
                suffix: "%",
                label: "Oryginalnych części",
                color: "from-green-400 to-emerald-500",
              },
              {
                value: stat4,
                suffix: "h",
                label: "Czas dostawy części",
                color: "from-purple-400 to-indigo-500",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-xl bg-white/[3%] border border-white/[6%] hover:bg-white/[6%] hover:border-[#1b3caf]/20 transition-all duration-300 group cursor-default"
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

      {/* ─── Why Choose Us ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 border-y border-white/10">
        <div
          ref={whyReveal.ref}
          className={`max-w-5xl mx-auto transition-all duration-1000 ${
            whyReveal.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Dlaczego wybrać Rippę?
            </h2>
            <p className="text-[#b0b0b0] text-lg">
              6 powodów, dla których klienci nam ufają
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Award,
                title: "Doświadczenie",
                desc: "Ponad 10 lat doświadczenia w dystrybucji maszyn budowlanych najwyższej klasy na rynku polskim.",
                delay: "0ms",
              },
              {
                icon: Shield,
                title: "Gwarancja",
                desc: "Kompleksowa gwarancja na wszystkie produkty z profesjonalnym wsparciem technicznym.",
                delay: "100ms",
              },
              {
                icon: Users,
                title: "Zespół ekspertów",
                desc: "Doświadczeni specjaliści, którzy doradzą w wyborze maszyny idealnie dopasowanej do potrzeb.",
                delay: "200ms",
              },
              {
                icon: Truck,
                title: "Szybka dostawa",
                desc: "Większość modeli dostępna od ręki z naszego placu w Polsce — bez czekania tygodniami.",
                delay: "300ms",
              },
              {
                icon: Wrench,
                title: "Serwis na miejscu",
                desc: "Własny serwis i magazyn części zamiennych w Polsce — szybkie naprawy bez przestojów.",
                delay: "400ms",
              },
              {
                icon: MapPin,
                title: "Lokalna obecność",
                desc: "Jesteśmy polską firmą — rozmawiasz po polsku, faktura na polską firmę, serwis w Polsce.",
                delay: "500ms",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className={`p-6 rounded-xl bg-gradient-to-br from-white/[5%] to-white/[2%] border border-white/10 hover:border-[#1b3caf]/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1b3caf]/5 transition-all duration-300 cursor-default group ${
                    whyReveal.isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: item.delay }}
                >
                  <div className="w-12 h-12 bg-[#1b3caf]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1b3caf]/20 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-[#1b3caf]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[#b0b0b0] leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Our Values ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div
          ref={valuesReveal.ref}
          className={`max-w-5xl mx-auto transition-all duration-1000 ${
            valuesReveal.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b3caf]/10 border border-[#1b3caf]/30 mb-4">
              <Heart className="w-3.5 h-3.5 text-[#1b3caf]" />
              <span className="text-xs text-[#b0b0b0] uppercase tracking-wider">
                Wartości
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Nasze wartości
            </h2>
            <p className="text-[#b0b0b0] text-lg">
              Fundamenty na których budujemy naszą firmę
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Jakość",
                desc: "Każda maszyna przechodzi rygorystyczną kontrolę jakości przed dostawą do klienta. Nie idziemy na kompromisy.",
                color: "from-[#1b3caf] to-[#0f9fdf]",
                delay: "0ms",
              },
              {
                icon: Shield,
                title: "Niezawodność",
                desc: "Produkty marki Rippa są znane z trwałości i wydajności. Nasze maszyny pracują latami bez poważnych awarii.",
                color: "from-[#0f9fdf] to-cyan-400",
                delay: "150ms",
              },
              {
                icon: Heart,
                title: "Obsługa klienta",
                desc: "Zawsze gotowi pomóc — od doradztwa przy zakupie, przez serwis, po wsparcie techniczne i szkolenia.",
                color: "from-purple-400 to-indigo-500",
                delay: "300ms",
              },
            ].map((value, i) => {
              const Icon = value.icon;
              return (
                <div
                  key={i}
                  className={`text-center p-8 rounded-2xl bg-gradient-to-br from-white/[5%] to-white/[2%] border border-white/10 hover:border-[#1b3caf]/30 transition-all duration-500 group cursor-default hover:-translate-y-2 hover:shadow-xl hover:shadow-[#1b3caf]/5 ${
                    valuesReveal.isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: value.delay }}
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl mx-auto mb-5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-[#b0b0b0] leading-relaxed">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How We Work — Process ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 border-y border-white/10">
        <div
          ref={processReveal.ref}
          className={`max-w-5xl mx-auto transition-all duration-1000 ${
            processReveal.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Jak pracujemy?
            </h2>
            <p className="text-[#b0b0b0] text-lg">
              Od zapytania do dostawy maszyny — prosty proces w 4 krokach
            </p>
          </div>

          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#1b3caf]/0 via-[#1b3caf]/40 to-[#1b3caf]/0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  icon: Phone,
                  title: "Kontakt",
                  desc: "Zadzwoń lub napisz — doradzimy w wyborze odpowiedniej maszyny",
                },
                {
                  step: "02",
                  icon: Target,
                  title: "Dobór maszyny",
                  desc: "Wspólnie dobierzemy model idealny do Twoich potrzeb i budżetu",
                },
                {
                  step: "03",
                  icon: Handshake,
                  title: "Finansowanie",
                  desc: "Pomożemy z leasingiem, ratami lub kredytem — minimum formalności",
                },
                {
                  step: "04",
                  icon: Truck,
                  title: "Dostawa",
                  desc: "Dostarczymy maszynę pod wskazany adres wraz ze szkoleniem",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className={`text-center group transition-all duration-700 ${
                      processReveal.isVisible
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

      {/* ─── FAQ — Interactive Accordion ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
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
                q: "Czy maszyny Rippa posiadają certyfikat CE?",
                a: "Tak, wszystkie nasze maszyny spełniają europejskie normy bezpieczeństwa i posiadają oznaczenie CE. Są w pełni legalne do użytkowania na terenie Unii Europejskiej.",
              },
              {
                q: "Jakie silniki stosowane są w minikopark Rippa?",
                a: "Minikoparki Rippa wyposażone są w renomowane silniki marek Kubota i Yanmar, znane z niezawodności i efektywności paliwowej. To te same silniki, które stosują czołowi światowi producenci.",
              },
              {
                q: "Jak wygląda gwarancja na maszyny?",
                a: "Oferujemy polską gwarancję na wszystkie maszyny. Serwis gwarancyjny realizowany jest na terenie Polski — nie musisz wysyłać maszyny do Chin. Szczegóły gwarancji ustalamy indywidualnie.",
              },
              {
                q: "Czy oferujecie części zamienne?",
                a: "Tak, prowadzimy magazyn części zamiennych w Polsce. Większość kluczowych komponentów mamy na stanie — realizacja zamówień na części w ciągu 24–48 godzin.",
              },
              {
                q: "Czy mogę przetestować maszynę przed zakupem?",
                a: "Oczywiście! Zapraszamy na nasz plac, gdzie można zobaczyć maszyny na żywo i umówić się na pokaz. Skontaktuj się z nami, aby ustalić termin.",
              },
              {
                q: "Jakie formy finansowania oferujecie?",
                a: "Oferujemy leasing operacyjny i finansowy, raty 0% na wybrane modele oraz kredyt na maszynę. Współpracujemy z wieloma instytucjami finansowymi, aby zapewnić najlepsze warunki.",
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

      {/* ─── CTA Section ─── */}
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
                Chcesz dowiedzieć się więcej?
              </h2>
              <p className="text-[#b0b0b0] text-lg mb-8 max-w-2xl mx-auto">
                Odwiedź nasz katalog produktów lub skontaktuj się z naszym
                zespołem — pomożemy wybrać idealną maszynę
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products"
                  className="px-8 py-3 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  Przeglądaj katalog
                  <ArrowRight className="w-4 h-4" />
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

      <Footer />
    </div>
  );
}
