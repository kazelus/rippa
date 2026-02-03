"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "../Button";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0f1419]/95 backdrop-blur-md border-b border-[#1a1f2e]">
      <nav className="w-full px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/rippa.svg"
            alt="Rippa Polska"
            width={140}
            height={52}
            className="h-12 w-auto"
          />
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-[#b0b0b0] hover:text-white transition-colors"
          >
            Dlaczego my
          </a>
          <a
            href="#models"
            className="text-sm text-[#b0b0b0] hover:text-white transition-colors"
          >
            Modele
          </a>
          <a
            href="#applications"
            className="text-sm text-[#b0b0b0] hover:text-white transition-colors"
          >
            Zastosowania
          </a>
          <a
            href="#service"
            className="text-sm text-[#b0b0b0] hover:text-white transition-colors"
          >
            Serwis
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="hidden md:inline-flex text-sm px-6 py-2"
          >
            Kontakt
          </Button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-[#b0b0b0] hover:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="md:hidden border-t border-[#1a1f2e] bg-[#0f1419]">
          <div className="px-6 py-4 space-y-4">
            <a
              href="#features"
              className="block text-sm text-[#b0b0b0] hover:text-white"
            >
              Dlaczego my
            </a>
            <a
              href="#models"
              className="block text-sm text-[#b0b0b0] hover:text-white"
            >
              Modele
            </a>
            <a
              href="#applications"
              className="block text-sm text-[#b0b0b0] hover:text-white"
            >
              Zastosowania
            </a>
            <a
              href="#service"
              className="block text-sm text-[#b0b0b0] hover:text-white"
            >
              Serwis
            </a>
            <Button variant="outline" className="w-full mt-4 text-sm px-6 py-2">
              Kontakt
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
