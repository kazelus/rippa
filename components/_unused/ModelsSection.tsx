"use client";

import { useInView } from "react-intersection-observer";
import { Button } from "../Button";

export default function ModelsSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const models = [
    {
      name: "Rippa RE18",
      power: "16 KM",
      depth: "2.5 m",
      weight: "1.8 t",
      bucket: "0.05 m³",
      price: "Od 45,000 PLN",
    },
    {
      name: "Rippa RE25",
      power: "25 KM",
      depth: "2.8 m",
      weight: "2.2 t",
      bucket: "0.06 m³",
      price: "Od 65,000 PLN",
      featured: true,
    },
    {
      name: "Rippa RE35",
      power: "35 KM",
      depth: "3.2 m",
      weight: "3.5 t",
      bucket: "0.08 m³",
      price: "Od 85,000 PLN",
    },
  ];

  return (
    <section
      id="models"
      ref={ref}
      className="py-32 bg-[#0f1419] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#1b3caf] rounded-full blur-3xl opacity-5"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1b3caf] rounded-full blur-3xl opacity-5"></div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div
          className={`text-center mb-24 ${inView ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Modele mini-koparek
          </h2>
          <p className="text-xl text-[#b0b0b0] max-w-3xl mx-auto">
            Wybierz model dostosowany do Twoich potrzeb
          </p>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {models.map((model, index) => (
            <div
              key={index}
              className={`group relative ${
                inView ? "animate-fade-in-up" : "opacity-0"
              } ${model.featured ? "md:scale-105" : ""}`}
              style={{
                animationDelay: inView ? `${index * 150}ms` : "0ms",
              }}
            >
              {/* Featured badge */}
              {model.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <span className="px-4 py-1 bg-[#1b3caf] text-white text-xs font-semibold rounded-full">
                    Najpopularniejszy
                  </span>
                </div>
              )}

              <div
                className={`relative p-10 rounded-xl border transition-all duration-300 h-full flex flex-col ${
                  model.featured
                    ? "border-[#1b3caf] bg-gradient-to-br from-[#1b3caf]/10 to-[#1a1f2e] shadow-[0_0_40px_rgba(27,60,175,0.3)]"
                    : "border-[#1b3caf]/20 bg-[#1a1f2e] hover:border-[#1b3caf]/50 hover:shadow-[0_0_20px_rgba(27,60,175,0.2)]"
                }`}
              >
                {/* Model info */}
                <div className="mb-10">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {model.name}
                  </h3>
                  <p className="text-[#1b3caf] font-semibold text-lg">
                    {model.price}
                  </p>
                </div>

                {/* Specs */}
                <div className="space-y-5 mb-10 flex-grow">
                  <div className="flex justify-between items-center pb-3 border-b border-[#1b3caf]/20">
                    <span className="text-[#b0b0b0] text-sm">Moc silnika</span>
                    <span className="text-white font-semibold">
                      {model.power}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-[#1b3caf]/20">
                    <span className="text-[#b0b0b0] text-sm">
                      Głębokość kopania
                    </span>
                    <span className="text-white font-semibold">
                      {model.depth}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-[#1b3caf]/20">
                    <span className="text-[#b0b0b0] text-sm">Masa</span>
                    <span className="text-white font-semibold">
                      {model.weight}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#b0b0b0] text-sm">
                      Pojemność łyżki
                    </span>
                    <span className="text-white font-semibold">
                      {model.bucket}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  variant={model.featured ? "primary" : "outline"}
                  className="w-full"
                >
                  Zapytaj o ten model
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
