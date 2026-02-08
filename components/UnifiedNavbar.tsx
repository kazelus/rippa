"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, Phone, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CompareBar from "./CompareBar";
import Toasts from "./Toast";

export const UnifiedNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "O nas", href: "/about" },
    { name: "Katalog", href: "/products" },
    { name: "Finansowanie", href: "/financing" },
    { name: "Kontakt", href: "/contact" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#0a0e17]/85 backdrop-blur-2xl border-b border-white/[0.06] py-3 shadow-xl shadow-black/20"
          : "bg-transparent backdrop-blur-none py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <img
            src="/logo.png"
            alt="Rippa Polska"
            className="h-12 w-auto md:h-14 transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  active
                    ? "text-white"
                    : "text-[#8b92a9] hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute inset-0 rounded-lg bg-white/[0.06]" />
                )}
                <span className="relative">{link.name}</span>
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Separator */}
          <div className="w-px h-6 bg-white/10 mx-3" />

          {/* Phone CTA */}
          <a
            href="tel:+48787148016"
            className="group flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold text-white rounded-xl border border-[#1b3caf]/40 bg-[#1b3caf]/10 hover:bg-[#1b3caf]/20 hover:border-[#1b3caf]/60 transition-all duration-300"
          >
            <Phone className="w-3.5 h-3.5 text-[#0f9fdf]" />
            +48 787 148 016
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white p-2.5 hover:bg-white/[0.06] rounded-xl transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`absolute top-full left-0 right-0 bg-[#0a0e17]/95 backdrop-blur-2xl border-b border-white/[0.06] md:hidden transition-all duration-300 origin-top ${
          isMobileMenuOpen
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-95 pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center justify-between text-sm font-medium py-3 px-4 rounded-xl transition-all duration-200 ${
                  active
                    ? "text-white bg-white/[0.06]"
                    : "text-[#8b92a9] hover:text-white hover:bg-white/[0.04]"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
                <ChevronRight className={`w-4 h-4 transition-colors ${active ? "text-[#0f9fdf]" : "text-white/20"}`} />
              </Link>
            );
          })}

          <div className="h-px bg-white/[0.06] my-2" />

          <a
            href="tel:+48787148016"
            className="flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-semibold text-white rounded-xl border border-[#1b3caf]/40 bg-[#1b3caf]/10 transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-[#0f9fdf]" />
            +48 787 148 016
          </a>
        </div>
      </div>
      <CompareBar />
      <Toasts />
    </nav>
  );
};
