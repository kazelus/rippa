import React from "react";
import { Logo } from "./Logo";
import {
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer
      id="footer"
      className="w-full bg-[#050505] border-t border-white/5 pt-20 pb-8 mt-8"
    >
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <Logo className="h-8 mb-6" />
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Rippa Polska to oficjalny dystrybutor mini-koparek klasy premium.
              Dostarczamy niezawodny sprzęt dla budownictwa, ogrodnictwa i
              przemysłu.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-gray-400 hover:bg-rippa-blue hover:text-white transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-gray-400 hover:bg-rippa-blue hover:text-white transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-gray-400 hover:bg-rippa-blue hover:text-white transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6">Oferta</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-rippa-blue transition-colors">
                  Mini-koparki
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-rippa-blue transition-colors">
                  Koparki kołowe
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-rippa-blue transition-colors">
                  Osprzęt dodatkowy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-rippa-blue transition-colors">
                  Części zamienne
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-rippa-blue transition-colors">
                  Finansowanie
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6">Firma</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-rippa-blue transition-colors">
                  O nas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-rippa-blue transition-colors">
                  Kariera
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-rippa-blue transition-colors">
                  Aktualności
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-rippa-blue transition-colors">
                  Polityka prywatności
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-rippa-blue transition-colors">
                  Kontakt
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6">Kontakt</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rippa-blue flex-shrink-0" />
                <span>
                  Mostowa 4
                  <br />
                  34-120 Sułkowice
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-rippa-blue flex-shrink-0" />
                <span>+48 787 148 016</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-rippa-blue flex-shrink-0" />
                <span>biuro@rippapolska.pl</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p>
            &copy; {new Date().getFullYear()} Rippa Polska. Wszelkie prawa
            zastrzeżone.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-400">
              Regulamin
            </a>
            <a href="#" className="hover:text-gray-400">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
