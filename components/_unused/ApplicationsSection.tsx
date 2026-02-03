"use client";

import { useInView } from "react-intersection-observer";

export default function ApplicationsSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const applications = [
    {
      title: "Ogród",
      description: "Prace ziemne w ogrodzie, wyrównanie terenu",
      icon: "🌱",
    },
    {
      title: "Plac budowy",
      description: "Kopanie, załadunek, rozgrabnianie materiałów",
      icon: "🏗️",
    },
    {
      title: "Instalacje",
      description: "Kopanie rowów pod media, kanalizację, kable",
      icon: "🔌",
    },
    {
      title: "Fundamenty",
      description: "Przygotowanie fundamentów pod budownictwo",
      icon: "🏢",
    },
  ];

  return (
    <section
      id="applications"
      ref={ref}
      className="py-32 bg-gradient-to-b from-[#0f1419] to-[#1a1f2e] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1b3caf] rounded-full blur-3xl opacity-5"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1b3caf] rounded-full blur-3xl opacity-5"></div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div
          className={`text-center mb-24 ${inView ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Zastosowania
          </h2>
          <p className="text-xl text-[#b0b0b0] max-w-3xl mx-auto">
            Uniwersalne rozwiązania dla różnych rodzajów prac
          </p>
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {applications.map((app, index) => (
            <div
              key={index}
              className={`group p-10 bg-[#1a1f2e] rounded-xl border border-[#1b3caf]/20 hover:border-[#1b3caf]/50 transition-all duration-300 cursor-pointer ${
                inView ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{
                animationDelay: inView ? `${index * 100}ms` : "0ms",
              }}
            >
              <div className="relative overflow-hidden">
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1b3caf]/0 to-[#1b3caf]/0 group-hover:from-[#1b3caf]/10 group-hover:to-[#1b3caf]/5 rounded-lg transition-all duration-300"></div>

                <div className="relative z-10">
                  {/* Large icon */}
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {app.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {app.title}
                  </h3>
                  <p className="text-[#b0b0b0] text-sm leading-relaxed">
                    {app.description}
                  </p>

                  {/* Accent */}
                  <div className="mt-4 h-1 w-0 bg-[#1b3caf] rounded-full group-hover:w-12 transition-all duration-300"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Visual showcase */}
        <div
          className={`mt-20 p-12 bg-gradient-to-br from-[#1a1f2e] to-[#242d3d] rounded-2xl border border-[#1b3caf]/20 ${
            inView ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Gotowy do każdego wyzwania
              </h3>
              <p className="text-[#b0b0b0] leading-relaxed mb-6">
                Mini-koparki Rippa Polska sprawdzają się w każdych warunkach -
                od prac w ciasnych przestrzeniach do dużych projektów
                budowlanych. Dzięki kompaktowym wymiarom bez problemu zmieszczą
                się na każdym terenie, a zaawansowana hydraulika zapewnia
                precyzję pracy.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-white">
                  <span className="w-2 h-2 bg-[#1b3caf] rounded-full"></span>
                  Praca 24/7 bez problemu
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="w-2 h-2 bg-[#1b3caf] rounded-full"></span>
                  Różne rodzaje łyżek dostępne
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="w-2 h-2 bg-[#1b3caf] rounded-full"></span>
                  Ekonomiczne w eksploatacji
                </li>
              </ul>
            </div>

            {/* Visual representation */}
            <div className="relative h-64 lg:h-96">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                {/* Multiple machines in different scenarios */}
                <g opacity="0.8">
                  {/* Machine 1 - Garden */}
                  <ellipse
                    cx="100"
                    cy="200"
                    rx="30"
                    ry="15"
                    fill="#1b3caf"
                    opacity="0.4"
                  />
                  <circle
                    cx="100"
                    cy="140"
                    r="25"
                    fill="#2a3a5a"
                    opacity="0.6"
                  />
                  <text x="60" y="250" fontSize="12" fill="#1b3caf">
                    Ogród
                  </text>
                </g>

                <g opacity="0.8">
                  {/* Machine 2 - Construction */}
                  <ellipse
                    cx="200"
                    cy="180"
                    rx="35"
                    ry="18"
                    fill="#1b3caf"
                    opacity="0.4"
                  />
                  <rect
                    x="185"
                    y="100"
                    width="30"
                    height="40"
                    fill="#3a4a6a"
                    opacity="0.6"
                  />
                  <text x="170" y="250" fontSize="12" fill="#1b3caf">
                    Budowa
                  </text>
                </g>

                <g opacity="0.8">
                  {/* Machine 3 - Installation */}
                  <ellipse
                    cx="300"
                    cy="190"
                    rx="32"
                    ry="16"
                    fill="#1b3caf"
                    opacity="0.4"
                  />
                  <path
                    d="M 300 110 L 300 180 M 280 140 L 320 140"
                    stroke="#3a4a6a"
                    strokeWidth="4"
                    opacity="0.6"
                  />
                  <text x="260" y="250" fontSize="12" fill="#1b3caf">
                    Instalacje
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
