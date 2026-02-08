import React from "react";
import { Fuel, Crosshair, MapPin, Clock } from "lucide-react";
import { Feature } from "../types";

const features: Feature[] = [
  {
    id: "1",
    title: "Niskie spalanie",
    description:
      "Zoptymalizowane silniki Kubota zapewniające maksymalną wydajność przy minimalnym zużyciu paliwa.",
    icon: Fuel,
  },
  {
    id: "2",
    title: "Precyzyjna praca",
    description:
      "Zaawansowana hydraulika pozwala na milimetrową dokładność nawet przy najtrudniejszych zadaniach.",
    icon: Crosshair,
  },
  {
    id: "3",
    title: "Serwis w Polsce",
    description:
      "Autoryzowane punkty serwisowe i magazyn części zamiennych dostępny od ręki w kraju.",
    icon: MapPin,
  },
  {
    id: "4",
    title: "Szybka dostępność",
    description:
      "Większość modeli dostępna od ręki z naszego placu. Nie czekaj miesiącami na maszynę.",
    icon: Clock,
  },
];

export const Features: React.FC = () => {
  return (
    <section
      id="features"
      className="w-full py-28 bg-[#0f1419] relative scroll-mt-20"
    >
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1b3caf]/30 to-transparent" />

      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-[0.15em] text-[#0f9fdf] border border-[#1b3caf]/20 rounded-full uppercase bg-[#1b3caf]/5">
            Dlaczego Rippa?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Dlaczego warto nas wybrać?
          </h2>
          <p className="text-[#8b92a9] max-w-xl mx-auto">
            Łączymy chińską innowacyjność z polskim wsparciem serwisowym
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="group relative p-7 bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 hover:border-[#1b3caf]/40 transition-all duration-500 rounded-2xl hover:-translate-y-2 hover:shadow-xl hover:shadow-[#1b3caf]/10"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1b3caf]/0 to-[#0f9fdf]/0 group-hover:from-[#1b3caf]/5 group-hover:to-[#0f9fdf]/5 transition-all duration-500" />

              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#1b3caf]/20 to-[#0f9fdf]/10 rounded-xl flex items-center justify-center mb-5 group-hover:from-[#1b3caf] group-hover:to-[#0f9fdf] group-hover:shadow-lg group-hover:shadow-[#1b3caf]/30 transition-all duration-500">
                  <feature.icon className="w-6 h-6 text-[#0f9fdf] group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-[#0f9fdf] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[#8b92a9] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
