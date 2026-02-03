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
      className="w-full py-32 bg-rippa-dark relative scroll-mt-20 mt-8"
    >
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Dlaczego warto nas wybrać?
          </h2>
          <div className="w-20 h-1 bg-rippa-blue mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="group p-8 bg-rippa-card border border-rippa-border hover:border-rippa-blue/50 transition-all duration-300 rounded-sm hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <feature.icon className="w-24 h-24 text-rippa-blue" />
              </div>
              <div className="w-12 h-12 bg-rippa-blue/10 rounded flex items-center justify-center mb-6 group-hover:bg-rippa-blue transition-colors">
                <feature.icon className="w-6 h-6 text-rippa-blue group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
