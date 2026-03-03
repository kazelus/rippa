"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./Button";
import { ArrowRight, ChevronDown, Shield, Truck, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const trustBadges = [
  { icon: Shield, text: "Gwarancja w PL" },
  { icon: Truck, text: "Dostawa w 48h" },
  { icon: Wrench, text: "Serwis 24/7" },
];

export function Hero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative h-screen min-h-[700px] w-full flex items-center overflow-hidden scroll-mt-20">

      {/* Background image – oversized container (-inset-[22%]) creates zoom-out effect:
          object-cover fills the larger area, so the visible portion
          of the image appears more "distant/zoomed-out" */}
      <div className="absolute z-0" style={{ inset: "-22%" }}>
        <img
          src="https://sc04.alicdn.com/kf/Hc0e6572a674548598fa83a7056d97fd4J.jpg"
          alt="Construction Excavator"
          className="w-full h-full object-cover object-center opacity-70"
          style={{ transform: `translateY(${scrollY * 0.08}px)` }}
        />
      </div>

      {/* Gradient overlays – normal section size */}
      <div className="absolute inset-0 z-[1]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f14]/92 via-[#0b0f14]/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f14]/85 via-transparent to-[#0b0f14]/20" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#1b3caf]/40 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-[#0f9fdf]/25 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white/15 rounded-full animate-pulse delay-500" />
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-[#1b3caf]/30 rounded-full animate-pulse delay-700" />
      </div>

      <div className="container mx-auto px-6 lg:px-10 relative z-10 pt-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-bold tracking-[0.18em] text-[#0f9fdf] border border-[#1b3caf]/40 rounded-full uppercase bg-[#1b3caf]/10 backdrop-blur-sm shadow-lg shadow-[#1b3caf]/10">
              <span className="w-1.5 h-1.5 bg-[#0f9fdf] rounded-full animate-pulse" />
              Autoryzowany dealer w Polsce
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.06] mb-6 tracking-tight">
              Mini-koparki klasy{" "}
              <span className="bg-gradient-to-r from-[#3b64e0] to-[#0f9fdf] bg-clip-text text-transparent">
                Premium
              </span>{" "}
              <br className="hidden md:block" />
              do profesjonalnych zastosowań
            </h1>

            <p className="text-lg md:text-xl text-[#9aafc7] mb-10 leading-relaxed max-w-xl font-light">
              Niezawodność, precyzja i pełny serwis w Polsce. Odkryj maszyny,
              które zmienią Twój biznes.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <Link href="/products">
              <Button variant="primary" className="group">
                Zobacz Modele{" "}
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">Zapytaj o ofertę</Button>
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {trustBadges.map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.12] backdrop-blur-md text-white/70 text-sm hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-300 cursor-default"
              >
                <badge.icon className="w-3.5 h-3.5 text-[#0f9fdf] shrink-0" />
                <span className="font-medium tracking-wide">{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <span className="text-[9px] uppercase tracking-[0.25em] text-white/25 font-semibold">
          Przewiń
        </span>
        <ChevronDown className="w-5 h-5 text-white/25 animate-bounce" />
      </motion.div>
    </section>
  );
}
