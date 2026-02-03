"use client";

import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";

export default function StatsSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [counts, setCounts] = useState({
    machines: 0,
    years: 0,
    clients: 0,
  });

  useEffect(() => {
    if (!inView) return;

    const targets = { machines: 250, years: 15, clients: 95 };
    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      setCounts({
        machines: Math.floor(targets.machines * progress),
        years: Math.floor(targets.years * progress),
        clients: Math.floor(targets.clients * progress),
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [inView]);

  const stats = [
    {
      number: `${counts.machines}+`,
      label: "Sprzedanych maszyn",
      suffix: "",
    },
    {
      number: `${counts.years}`,
      label: "Lat doświadczenia",
      suffix: "",
    },
    {
      number: `${counts.clients}%`,
      label: "Zadowolonych klientów",
      suffix: "",
    },
  ];

  return (
    <section ref={ref} className="py-32 bg-[#0f1419] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1b3caf] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div
          className={`text-center mb-24 ${inView ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Zaufanie naszych klientów
          </h2>
          <p className="text-xl text-[#b0b0b0] max-w-3xl mx-auto">
            Liczby, które mówią same za siebie
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-7xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`relative p-12 bg-gradient-to-br from-[#1a1f2e] to-[#242d3d] rounded-xl border border-[#1b3caf]/30 text-center group hover:border-[#1b3caf] transition-all duration-300 ${
                inView ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{
                animationDelay: inView ? `${index * 100}ms` : "0ms",
              }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1b3caf]/0 to-[#1b3caf]/0 group-hover:from-[#1b3caf]/10 group-hover:to-[#1b3caf]/5 rounded-xl transition-all duration-300"></div>

              <div className="relative z-10">
                {/* Large number */}
                <div className="text-6xl md:text-7xl font-bold text-[#1b3caf] mb-4 font-poppins">
                  {stat.number}
                </div>

                {/* Label */}
                <p className="text-lg text-[#b0b0b0]">{stat.label}</p>

                {/* Decorative line */}
                <div className="mt-6 h-1 w-12 bg-gradient-to-r from-[#1b3caf] to-transparent mx-auto group-hover:w-20 transition-all duration-300"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature highlight */}
        <div
          className={`p-12 bg-gradient-to-r from-[#1b3caf]/10 to-[#242d3d] rounded-xl border border-[#1b3caf]/30 ${
            inView ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-[#1b3caf]">
                <svg
                  className="h-8 w-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>

            {/* Text */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Serwis w Polsce 24/7
              </h3>
              <p className="text-[#b0b0b0] text-lg">
                Nasze wsparcie techniczne zawsze dostępne dla Ciebie. Części
                zamienne, naprawa, konsultacje - wszystko w jednym miejscu w
                Polsce.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
