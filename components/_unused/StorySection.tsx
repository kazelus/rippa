"use client";

import { useInView } from "react-intersection-observer";

export default function StorySection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const specs = [
    { label: "Moc silnika", value: "16 KM" },
    { label: "Głębokość kopania", value: "2.5 m" },
    { label: "Pojemność łyżki", value: "0.06 m³" },
    { label: "Masa", value: "2.2 t" },
  ];

  return (
    <section
      ref={ref}
      className="py-32 bg-gradient-to-b from-[#0f1419] to-[#1a1f2e] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1b3caf] rounded-full blur-3xl opacity-5"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1b3caf] rounded-full blur-3xl opacity-5"></div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
          {/* Left - Text content */}
          <div
            className={`space-y-8 ${inView ? "animate-slide-in-left" : "opacity-0"}`}
          >
            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
                Niezawodna technologia
              </h2>
              <p className="text-lg text-[#b0b0b0] leading-relaxed mb-8">
                Każda mini-koparka Rippa Polska jest zbudowana z najwyższej
                klasy komponentów importowanych z Europy. Nasz zespół inżynierów
                zapewnia, że każda maszyna przechodzi rygorystyczne testy
                kontroli jakości.
              </p>
              <p className="text-lg text-[#b0b0b0] leading-relaxed">
                Serwis i obsługa techniczna dostępne w Polsce 24/7 zapewniają
                bezpieczeństwo inwestycji oraz ciągłość pracy.
              </p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              {specs.map((spec, index) => (
                <div
                  key={index}
                  className="p-6 bg-[#1a1f2e] rounded-lg border border-[#1b3caf]/20"
                >
                  <p className="text-[#b0b0b0] text-sm mb-2">{spec.label}</p>
                  <p className="text-2xl font-bold text-[#1b3caf]">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Visual showcase */}
          <div
            className={`relative h-96 ${inView ? "animate-fade-in" : "opacity-0"}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#1b3caf]/15 to-transparent rounded-2xl"></div>

            {/* Machine details visualization */}
            <svg viewBox="0 0 400 400" className="w-full h-full relative z-10">
              {/* Main body - side view */}
              <g>
                {/* Chassis */}
                <rect
                  x="60"
                  y="200"
                  width="280"
                  height="100"
                  rx="15"
                  fill="#1a1f2e"
                  stroke="#1b3caf"
                  strokeWidth="2"
                  opacity="0.8"
                />

                {/* Wheels/Tracks detail */}
                <circle
                  cx="100"
                  cy="300"
                  r="20"
                  fill="#242d3d"
                  stroke="#6b7280"
                  strokeWidth="2"
                />
                <circle
                  cx="300"
                  cy="300"
                  r="20"
                  fill="#242d3d"
                  stroke="#6b7280"
                  strokeWidth="2"
                />
                <circle
                  cx="100"
                  cy="300"
                  r="12"
                  fill="none"
                  stroke="#1b3caf"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
                <circle
                  cx="300"
                  cy="300"
                  r="12"
                  fill="none"
                  stroke="#1b3caf"
                  strokeWidth="1.5"
                  opacity="0.6"
                />

                {/* Boom arm */}
                <g strokeWidth="12" stroke="#3a4a6a" strokeLinecap="round">
                  <line x1="200" y1="200" x2="280" y2="80" />
                </g>

                {/* Bucket/Attachment */}
                <ellipse
                  cx="295"
                  cy="65"
                  rx="30"
                  ry="35"
                  fill="#2a3a5a"
                  stroke="#1b3caf"
                  strokeWidth="2"
                  opacity="0.8"
                />

                {/* Cab */}
                <g>
                  <rect
                    x="220"
                    y="140"
                    width="60"
                    height="70"
                    rx="8"
                    fill="#1b3caf"
                    opacity="0.7"
                  />
                  <circle
                    cx="240"
                    cy="165"
                    r="12"
                    fill="#f5f5f5"
                    opacity="0.5"
                  />
                </g>

                {/* Hydraulic details */}
                <circle cx="160" cy="180" r="8" fill="#1b3caf" opacity="0.6" />
                <circle cx="340" cy="180" r="8" fill="#1b3caf" opacity="0.6" />
              </g>

              {/* Technical annotations */}
              <text
                x="50"
                y="130"
                fontSize="12"
                fill="#1b3caf"
                opacity="0.7"
                fontFamily="Poppins"
              >
                Moc: 16 KM
              </text>
              <text
                x="300"
                y="50"
                fontSize="12"
                fill="#1b3caf"
                opacity="0.7"
                fontFamily="Poppins"
              >
                Głęb: 2.5m
              </text>
            </svg>

            {/* Corner accent */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#1b3caf] rounded-full blur-2xl opacity-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
