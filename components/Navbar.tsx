"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "./Button";

export const Navbar: React.FC = () => {
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
    { name: "O nas", href: "#features" },
    { name: "Produkty", href: "/products" },
    { name: "Modele", href: "#models" },
    { name: "Zastosowanie", href: "#applications" },
    { name: "Kontakt", href: "#footer" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-rippa-dark/90 backdrop-blur-md py-4 border-b border-white/5"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-rippa-blue">Rippa</div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-300 hover:text-rippa-blue transition-colors uppercase tracking-wider"
            >
              {link.name}
            </a>
          ))}
          <a
            href="tel:+48787148016"
            aria-label="Zadzwoń"
            className="inline-block"
          >
            <Button variant="primary" className="!py-2 !px-4">
              <Phone className="w-4 h-4 mr-2" />
              +48 787 148 016
            </Button>
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-rippa-dark border-b border-white/10 md:hidden p-6 flex flex-col gap-4 shadow-2xl animate-fade-in">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-base font-medium text-gray-300 hover:text-rippa-blue py-2 border-b border-white/5"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <a
            href="tel:+48787148016"
            aria-label="Zadzwoń"
            className="w-full block"
          >
            <Button variant="primary" className="w-full mt-4">
              <Phone className="w-4 h-4 mr-2" />
              Zadzwoń
            </Button>
          </a>
        </div>
      )}
    </nav>
  );
};
