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
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://sc04.alicdn.com/kf/Hc0e6572a674548598fa83a7056d97fd4J.jpg"
          alt="Construction Excavator"
          className="w-full h-full object-cover opacity-50"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1419] via-[#0f1419]/85 to-[#1b3caf]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] via-transparent to-[#0f1419]/30" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#1b3caf]/30 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-[#0f9fdf]/20 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white/10 rounded-full animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.15em] text-[#0f9fdf] border border-[#1b3caf]/30 rounded-full uppercase bg-[#1b3caf]/10 backdrop-blur-sm">
              <span className="w-2 h-2 bg-[#0f9fdf] rounded-full animate-pulse" />
              Autoryzowany importer w Polsce
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] mb-6">
              Mini-koparki klasy{" "}
              <span className="bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] bg-clip-text text-transparent">
                Premium
              </span>{" "}
              do profesjonalnych zastosowań
            </h1>
            <p className="text-lg md:text-xl text-[#b0b0b0] mb-10 leading-relaxed max-w-2xl font-light">
              Niezawodność, precyzja i pełny serwis w Polsce. Odkryj maszyny,
              które zmienią Twój biznes.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 mb-12"
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
            className="flex flex-wrap gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {trustBadges.map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-white/60 text-sm"
              >
                <badge.icon className="w-4 h-4 text-[#0f9fdf]" />
                <span>{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">
          Przewiń
        </span>
        <ChevronDown className="w-6 h-6 text-white/30 animate-bounce" />
      </motion.div>
    </section>
  );
}
