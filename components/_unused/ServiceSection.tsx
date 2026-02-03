"use client";

import { useInView } from "react-intersection-observer";
import { Button } from "../Button";

export default function ServiceSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const services = [
    {
      title: "Gwarancja",
      description: "Gwarancja 2 lata od daty zakupu na wszystkie maszyny",
      features: [
        "Pełna ochrona",
        "Bez ukrytych kosztów",
        "Możliwość przedłużenia",
      ],
      icon: "🛡️",
    },
    {
      title: "Części zamienne",
      description: "Szybka dostępność oryginalnych części w Polsce",
      features: [
        "Dostawa 24-48h",
        "Autentyczne części",
        "Rabaty dla stałych klientów",
      ],
      icon: "⚙️",
    },
    {
      title: "Serwis techniczny",
      description: "Profesjonalne wsparcie techniczne dostępne zawsze",
      features: [
        "Konsultacje bezpłatne",
        "Serwis mobilny",
        "Naprawy awaryjne 24/7",
      ],
      icon: "🔧",
    },
  ];

  return (
    <section
      id="service"
      ref={ref}
      className="py-32 bg-gradient-to-b from-[#0f1419] to-[#1a1f2e] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#1b3caf] rounded-full blur-3xl opacity-5"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1b3caf] rounded-full blur-3xl opacity-5"></div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div
          className={`text-center mb-24 ${inView ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Wsparcie i serwis
          </h2>
          <p className="text-xl text-[#b0b0b0] max-w-3xl mx-auto">
            Pełne wsparcie przed, podczas i po zakupie
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group p-10 bg-[#1a1f2e] rounded-xl border border-[#1b3caf]/20 hover:border-[#1b3caf]/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(27,60,175,0.2)] ${
                inView ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{
                animationDelay: inView ? `${index * 150}ms` : "0ms",
              }}
            >
              {/* Icon */}
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-bold text-white mb-2">
                {service.title}
              </h3>
              <p className="text-[#b0b0b0] mb-6">{service.description}</p>

              {/* Features list */}
              <ul className="space-y-3">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <span className="mt-1 w-1.5 h-1.5 bg-[#1b3caf] rounded-full flex-shrink-0"></span>
                    <span className="text-[#b0b0b0] text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Hover accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1b3caf]/0 to-[#1b3caf]/0 group-hover:from-[#1b3caf]/5 group-hover:to-transparent rounded-xl transition-all duration-300 -z-10"></div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div
          className={`p-12 md:p-16 bg-gradient-to-r from-[#1b3caf]/15 to-[#242d3d] rounded-xl border border-[#1b3caf]/30 text-center ${
            inView ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Gotowy na współpracę?
          </h3>
          <p className="text-lg text-[#b0b0b0] mb-8 max-w-2xl mx-auto">
            Skontaktuj się z naszym zespołem, aby wybrać idealny model dla
            Twojego projektu
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary">Zapytaj o ofertę</Button>
            <Button variant="outline">Pobierz katalog</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
