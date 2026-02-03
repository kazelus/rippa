"use client";

import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import Link from "next/link";
import { CheckCircle, Award, Users, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419]">
      <UnifiedNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            O nas
          </h1>
          <p className="text-xl text-[#b0b0b0] mb-8">
            Rippa Polska - Twój zaufany partner w branży maszyn budowlanych
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] mx-auto" />
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 border-y border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Nasza historia
              </h2>
              <p className="text-[#b0b0b0] text-lg leading-relaxed mb-4">
                Rippa Polska została założona z pasją do inżynierii i
                zaangażowaniem do świadczenia najwyższej jakości maszyn
                budowlanych. Od ponad dekady dostarczamy niezawodne kopiarki,
                łyżki i kopary naszym klientom na terenie całej Polski.
              </p>
              <p className="text-[#b0b0b0] text-lg leading-relaxed">
                Naszą misją jest dostarczenie produktów, które nie tylko
                spełniają oczekiwania, ale je przekraczają, oferując wydajność,
                niezawodność i wyjątkową wartość.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1b3caf]/20 to-[#0f9fdf]/20 rounded-xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-[#1b3caf]/10 to-[#0f9fdf]/10 p-8 rounded-xl border border-white/10">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Award className="w-6 h-6 text-[#1b3caf] flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-semibold">
                        Certyfikowana jakość
                      </p>
                      <p className="text-[#8b92a9] text-sm">
                        Wszystkie produkty spełniają międzynarodowe normy
                        bezpieczeństwa
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Zap className="w-6 h-6 text-[#1b3caf] flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-semibold">
                        Nowoczesna technologia
                      </p>
                      <p className="text-[#8b92a9] text-sm">
                        Silniki Kubota o najwyższej efektywności paliwowej
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Users className="w-6 h-6 text-[#1b3caf] flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-semibold">
                        Serwis w Polsce
                      </p>
                      <p className="text-[#8b92a9] text-sm">
                        Szybki dostęp do serwisu i części zamiennych
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Dlaczego wybrać Rippę?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Doświadczenie",
                desc: "Ponad 10 lat doświadczenia w dystrybucji maszyn budowlanych najwyższej klasy",
                icon: Award,
              },
              {
                title: "Gwarancja",
                desc: "Kompleksowa gwarancja na wszystkie produkty z profesjonalnym wsparciem",
                icon: CheckCircle,
              },
              {
                title: "Zespół ekspertów",
                desc: "Doświadczeni specjaliści gotowi udzielić profesjonalnych porad",
                icon: Users,
              },
              {
                title: "Szybka dostawa",
                desc: "Większość modeli dostępna od ręki z naszego placu w Polsce",
                icon: Zap,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="p-8 bg-gradient-to-br from-white/5 to-white/[2%] border border-white/10 rounded-xl hover:border-[#1b3caf]/50 transition duration-300 group"
                >
                  <Icon className="w-8 h-8 text-[#1b3caf] mb-4 group-hover:scale-110 transition" />
                  <h3 className="text-xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[#b0b0b0]">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section removed per request */}

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Nasze wartości
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Jakość",
                desc: "Każda maszyna przechodzi rygorystyczną kontrolę przed dostawą",
              },
              {
                title: "Niezawodność",
                desc: "Produkty marki Rippa są znane z długotrwałości i wydajności",
              },
              {
                title: "Obsługa klienta",
                desc: "Zawsze gotowi pomóc naszym klientom w każdej sytuacji",
              },
            ].map((value, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-[#b0b0b0]">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#1b3caf]/20 to-[#0f9fdf]/20 border border-[#1b3caf]/30 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Chcesz dowiedzieć się więcej?
            </h2>
            <p className="text-[#b0b0b0] text-lg mb-8">
              Odwiedź nasz katalog produktów lub skontaktuj się z naszym
              zespołem
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="px-8 py-3 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition duration-300"
              >
                Przeglądaj katalog
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-white/10 text-white font-bold rounded-lg border border-white/20 hover:bg-white/20 transition duration-300"
              >
                Skontaktuj się
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f1419]/80 border-t border-white/10 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#b0b0b0] text-sm">
          <div className="mb-2">
            <Link href="/contact" className="text-white font-semibold hover:underline">
              Skontaktuj się z nami
            </Link>
          </div>
          <p>&copy; 2025 Rippa Polska. Wszystkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
}
