import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

export const Footer: React.FC = () => {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "O nas", href: "/about" },
    { name: "Katalog", href: "/products" },
    { name: "Finansowanie", href: "/financing" },
    { name: "Kontakt", href: "/contact" },
  ];

  return (
    <footer
      id="footer"
      className="w-full bg-[#060911] border-t border-white/[0.06]"
    >
      {/* Main content */}
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-20">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <img src="/logo.png" alt="Rippa Polska" className="h-12 w-auto" />
            </Link>
            <p className="text-[#8b92a9] text-sm leading-relaxed max-w-xs">
              Oficjalny dystrybutor mini-koparek Rippa w Polsce. Sprzedaż, serwis
              i części zamienne.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#8b92a9] mb-5">
              Nawigacja
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#636b82] hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#8b92a9] mb-5">
              Kontakt
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://maps.google.com/?q=Sadowa+1+34-120+Sułkowice"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-[#636b82] hover:text-white transition-colors group"
                >
                  <MapPin className="w-4 h-4 text-[#1b3caf] mt-0.5 flex-shrink-0 group-hover:text-[#0f9fdf] transition-colors" />
                  <span>
                    Sadowa 1, 34-120 Sułkowice
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+48787148016"
                  className="flex items-center gap-3 text-sm text-[#636b82] hover:text-white transition-colors group"
                >
                  <Phone className="w-4 h-4 text-[#1b3caf] flex-shrink-0 group-hover:text-[#0f9fdf] transition-colors" />
                  +48 787 148 016
                </a>
              </li>
              <li>
                <a
                  href="mailto:biuro@rippapolska.pl"
                  className="flex items-center gap-3 text-sm text-[#636b82] hover:text-white transition-colors group"
                >
                  <Mail className="w-4 h-4 text-[#1b3caf] flex-shrink-0 group-hover:text-[#0f9fdf] transition-colors" />
                  biuro@rippapolska.pl
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06]">
        <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto py-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[#4a5068]">
          <p>
            &copy; {new Date().getFullYear()} Rippa Polska. Wszelkie prawa
            zastrzeżone.
          </p>
          <Link
            href="/privacy"
            className="hover:text-[#8b92a9] transition-colors"
          >
            Polityka prywatności i cookies
          </Link>
        </div>
      </div>
    </footer>
  );
};
