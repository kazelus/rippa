"use client";

import React from "react";
import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import { Footer } from "@/components/Footer";
import { Shield, Cookie, Mail } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#080c11] text-white">
      <UnifiedNavbar />

      <div className="pt-32 pb-20 px-4 sm:px-6 md:px-12 lg:px-20 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-[0.15em] text-[#0f9fdf] border border-[#1b3caf]/20 rounded-full uppercase bg-[#1b3caf]/5">
            Informacje prawne
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Polityka Prywatności i Cookies
          </h1>
          <p className="text-[#8b92a9]">Ostatnia aktualizacja: 8 lutego 2026</p>
        </div>

        <div className="space-y-16">
          {/* POLITYKA PRYWATNOŚCI */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1b3caf]/20 to-[#0f9fdf]/10 flex items-center justify-center text-[#0f9fdf]">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold">Polityka Prywatności</h2>
            </div>

            <div className="space-y-8 text-[#b0b8cc] text-sm leading-relaxed">
              <div>
                <h3 className="text-white font-semibold text-base mb-3">
                  1. Administrator Danych
                </h3>
                <p>
                  Administratorem Twoich danych osobowych jest Rippa Polska z
                  siedzibą przy ul. Sadowa 1, 34-120 Sułkowice. Kontakt z
                  administratorem: e-mail{" "}
                  <a
                    href="mailto:biuro@rippapolska.pl"
                    className="text-[#0f9fdf] hover:underline"
                  >
                    biuro@rippapolska.pl
                  </a>
                  , tel.{" "}
                  <a
                    href="tel:+48787148016"
                    className="text-[#0f9fdf] hover:underline"
                  >
                    +48 787 148 016
                  </a>
                  .
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-3">
                  2. Jakie dane zbieramy
                </h3>
                <p className="mb-3">
                  Zbieramy dane osobowe wyłącznie w zakresie niezbędnym do
                  realizacji usług. Dotyczy to danych podanych dobrowolnie w:
                </p>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>
                    <strong className="text-white/80">
                      Formularz kontaktowy
                    </strong>{" "}
                    — imię i nazwisko, adres e-mail, numer telefonu
                    (opcjonalnie), treść wiadomości
                  </li>
                  <li>
                    <strong className="text-white/80">Formularz wyceny</strong>{" "}
                    — imię i nazwisko, adres e-mail, numer telefonu, nazwa
                    produktu, treść zapytania
                  </li>
                  <li>
                    <strong className="text-white/80">Chat na stronie</strong> —
                    treść rozmowy i podane dane kontaktowe
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-3">
                  3. Cel przetwarzania danych
                </h3>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>
                    Odpowiedź na zapytania przesłane formularzem kontaktowym lub
                    wyceny
                  </li>
                  <li>Przygotowanie oferty handlowej</li>
                  <li>Obsługa rozmów przez chat</li>
                  <li>
                    Realizacja prawnie uzasadnionego interesu administratora
                    (art. 6 ust. 1 lit. f RODO)
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-3">
                  4. Podstawa prawna
                </h3>
                <p>
                  Dane przetwarzane są na podstawie art. 6 ust. 1 lit. a RODO
                  (zgoda — przesłanie formularza), lit. b (podjęcie działań na
                  żądanie osoby przed zawarciem umowy) oraz lit. f (prawnie
                  uzasadniony interes administratora — odpowiedź na zapytanie).
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-3">
                  5. Okres przechowywania
                </h3>
                <p>
                  Dane przechowujemy przez okres niezbędny do realizacji celu,
                  dla którego zostały zebrane, nie dłużej niż 2 lata od
                  ostatniego kontaktu, chyba że dłuższy okres wynika z
                  obowiązujących przepisów prawa.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-3">
                  6. Twoje prawa
                </h3>
                <p className="mb-3">Masz prawo do:</p>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>Dostępu do swoich danych</li>
                  <li>Sprostowania (poprawienia) danych</li>
                  <li>Usunięcia danych („prawo do bycia zapomnianym")</li>
                  <li>Ograniczenia przetwarzania</li>
                  <li>Przenoszenia danych</li>
                  <li>Wniesienia sprzeciwu wobec przetwarzania</li>
                  <li>Cofnięcia zgody w dowolnym momencie</li>
                  <li>Wniesienia skargi do Prezesa UODO</li>
                </ul>
                <p className="mt-3">
                  W celu realizacji swoich praw skontaktuj się z nami:{" "}
                  <a
                    href="mailto:biuro@rippapolska.pl"
                    className="text-[#0f9fdf] hover:underline"
                  >
                    biuro@rippapolska.pl
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-3">
                  7. Udostępnianie danych
                </h3>
                <p>
                  Dane nie są sprzedawane ani udostępniane podmiotom trzecim w
                  celach marketingowych. Mogą być przekazane dostawcom usług IT
                  (hosting, poczta e-mail) wyłącznie w zakresie niezbędnym do
                  świadczenia usług.
                </p>
              </div>
            </div>
          </section>

          {/* Separator */}
          <div className="h-px bg-white/[0.06]" />

          {/* POLITYKA COOKIES */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1b3caf]/20 to-[#0f9fdf]/10 flex items-center justify-center text-[#0f9fdf]">
                <Cookie className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold">Polityka Cookies</h2>
            </div>

            <div className="space-y-8 text-[#b0b8cc] text-sm leading-relaxed">
              <div>
                <h3 className="text-white font-semibold text-base mb-3">
                  1. Czym są cookies?
                </h3>
                <p>
                  Cookies (ciasteczka) to małe pliki tekstowe zapisywane na
                  Twoim urządzeniu przez przeglądarkę internetową. Służą do
                  prawidłowego funkcjonowania strony i poprawy komfortu
                  korzystania z niej.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-3">
                  2. Jakich cookies używamy
                </h3>
                <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/[0.03]">
                        <th className="px-4 py-3 text-white font-semibold text-xs uppercase tracking-wider">
                          Rodzaj
                        </th>
                        <th className="px-4 py-3 text-white font-semibold text-xs uppercase tracking-wider">
                          Cel
                        </th>
                        <th className="px-4 py-3 text-white font-semibold text-xs uppercase tracking-wider">
                          Wygaśnięcie
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      <tr>
                        <td className="px-4 py-3 text-white/80">Niezbędne</td>
                        <td className="px-4 py-3">
                          Sesja panelu administracyjnego (NextAuth)
                        </td>
                        <td className="px-4 py-3">8 godzin</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-white/80">
                          Funkcjonalne
                        </td>
                        <td className="px-4 py-3">
                          Zapamiętanie zgody na cookies
                        </td>
                        <td className="px-4 py-3">365 dni</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-white/80">Zewnętrzne</td>
                        <td className="px-4 py-3">
                          Google Maps — mapa na stronie kontakt
                        </td>
                        <td className="px-4 py-3">Wg polityki Google</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-3">
                  3. Zarządzanie cookies
                </h3>
                <p>
                  Możesz w każdej chwili zmienić ustawienia cookies w swojej
                  przeglądarce — zablokować ich zapisywanie lub usunąć
                  istniejące. Szczegółowe instrukcje znajdziesz w ustawieniach
                  Twojej przeglądarki. Zablokowanie cookies niezbędnych może
                  ograniczyć funkcjonalność niektórych elementów strony.
                </p>
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1b3caf]/20 to-[#0f9fdf]/10 flex items-center justify-center text-[#0f9fdf] flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-white font-semibold mb-1">
                Masz pytania dotyczące prywatności?
              </h3>
              <p className="text-[#8b92a9] text-sm">
                Skontaktuj się z nami:{" "}
                <a
                  href="mailto:biuro@rippapolska.pl"
                  className="text-[#0f9fdf] hover:underline"
                >
                  biuro@rippapolska.pl
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
