"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";
import Link from "next/link";
import CompareBar from "./CompareBar";
import Toasts from "./Toast";

export const UnifiedNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-gradient-to-r from-[#1a1f2e]/90 via-[#242d3d]/80 to-[#1a1f2e]/90 backdrop-blur-xl border-b border-white/10 py-4 shadow-lg shadow-[#1b3caf]/10"
          : "bg-gradient-to-r from-[#1a1f2e]/40 via-[#242d3d]/30 to-[#1a1f2e]/40 backdrop-blur-md py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="Rippa Polska"
            className="h-14 w-auto md:h-16"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-base font-medium text-[#b0b0b0] hover:text-white transition duration-300 relative group"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}

          {/* Phone CTA */}
          <a
            href="tel:+48787148016"
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] hover:from-[#1b3caf]/80 hover:to-[#0f9fdf]/80 text-white font-bold rounded-lg transition duration-300 shadow-lg hover:shadow-blue-500/50"
          >
            <Phone className="w-4 h-4" />
            +48 787 148 016
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-gradient-to-b from-[#1a1f2e]/95 to-[#0f1419]/95 backdrop-blur-xl border-b border-white/10 md:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-base font-medium text-[#b0b0b0] hover:text-white py-3 px-4 rounded-lg hover:bg-white/5 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <a
              href="tel:+48787148016"
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white font-bold rounded-lg transition mt-2"
            >
              <Phone className="w-4 h-4" />
              +48 787 148 016
            </a>
          </div>
        </div>
      )}
      <CompareBar />
      <Toasts />
    </nav>
  );
};
