import React from "react";
import Link from "next/link";
import { ShieldCheck, Wrench, HeadphonesIcon, ArrowRight } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Gwarancja i Bezpieczeństwo",
    desc: "Pełna ochrona gwarancyjna realizowana w Polsce. Jasne zasady i brak ukrytych kruczków.",
  },
  {
    icon: Wrench,
    title: "Części Zamienne",
    desc: "Własny magazyn części zamiennych. Wysyłka w 24h lub odbiór osobisty w naszej siedzibie.",
  },
  {
    icon: HeadphonesIcon,
    title: "Wsparcie Techniczne",
    desc: "Infolinia serwisowa dostępna dla naszych klientów. Pomoc w diagnostyce i eksploatacji.",
  },
];

export const Service: React.FC = () => {
  return (
    <section
      id="service"
      className="w-full py-28 bg-[#080c11] relative scroll-mt-20 overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#1b3caf]/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left column */}
          <div className="w-full lg:w-1/2">
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-[0.15em] text-[#0f9fdf] border border-[#1b3caf]/20 rounded-full uppercase bg-[#1b3caf]/5">
              Serwis & Wsparcie
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Profesjonalne wsparcie{" "}
              <span className="bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] bg-clip-text text-transparent">
                na każdym etapie
              </span>
            </h2>
            <p className="text-[#8b92a9] mb-10 text-lg leading-relaxed">
              Kupując maszynę Rippa, nie kupujesz tylko sprzętu. Zyskujesz
              partnera, który dba o ciągłość Twojej pracy. Nasz centralny serwis
              w Polsce gwarantuje spokój ducha.
            </p>

            <div className="space-y-6">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="group flex gap-4 p-4 rounded-xl border border-white/5 hover:border-[#1b3caf]/20 hover:bg-white/[3%] transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#1b3caf]/20 to-[#0f9fdf]/10 flex items-center justify-center text-[#0f9fdf] group-hover:from-[#1b3caf]/30 group-hover:to-[#0f9fdf]/20 transition-all duration-300">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-base mb-1">
                      {f.title}
                    </h4>
                    <p className="text-[#8b92a9] text-sm leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#1b3caf] to-[#0f4fdf] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#1b3caf]/25 transition-all duration-300 hover:-translate-y-0.5 group"
              >
                Skontaktuj się z serwisem
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right column – image */}
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#1b3caf]/10 to-[#0f9fdf]/5 rounded-3xl blur-2xl pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
              <img
                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop"
                alt="Service Mechanic"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080c11]/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
