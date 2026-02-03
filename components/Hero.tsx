"use client";

import React from "react";
import { Button } from "./Button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative h-screen min-h-[700px] w-full flex items-center overflow-hidden scroll-mt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://sc04.alicdn.com/kf/Hc0e6572a674548598fa83a7056d97fd4J.jpg"
          alt="Construction Excavator"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1419] via-[#0f1419]/80 to-[#1b3caf]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-[0.2em] text-[#1b3caf] border border-[#1b3caf]/30 rounded uppercase bg-[#1b3caf]/10">
              Rippa Polska
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
              Mini-koparki klasy <span className="text-[#1b3caf]">Premium</span>{" "}
              do profesjonalnych zastosowań
            </h1>
            <p className="text-lg md:text-xl text-[#b0b0b0] mb-10 leading-relaxed max-w-2xl font-light">
              Niezawodność, precyzja i pełny serwis w Polsce. Odkryj maszyny,
              które zmienią Twój biznes.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/products">
              <Button variant="primary">
                Zobacz Modele <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">Zapytaj o ofertę</Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/50 animate-bounce"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <ChevronDown className="w-8 h-8" />
      </motion.div>
    </section>
  );
}
