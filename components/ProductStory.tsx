"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, ArrowDownToLine, Minimize2 } from "lucide-react";

const steps = [
  {
    icon: Zap,
    title: "Moc Silnika",
    description:
      "Wydajne jednostki diesla spełniające normy Euro 5, gotowe do ciężkiej pracy bez przerw.",
  },
  {
    icon: ArrowDownToLine,
    title: "Głębokość Kopania",
    description:
      "Zoptymalizowane ramię kopiące pozwala osiągnąć imponujące zasięgi przy zachowaniu stabilności.",
  },
  {
    icon: Minimize2,
    title: "Kompaktowe Wymiary",
    description:
      "Rozsuwane gąsienice pozwalają na wjazd przez standardowe drzwi (70-80cm), a po rozłożeniu dają pełną stabilność.",
  },
];

export const ProductStory: React.FC = () => {
  return (
    <section className="w-full py-28 bg-[#080c11] border-y border-white/5 overflow-hidden scroll-mt-20">
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 relative flex items-center justify-center">
            {/* Rotating outer gear ring */}
            <motion.div
              className="absolute w-[340px] h-[340px] md:w-[420px] md:h-[420px]"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              <svg viewBox="0 0 420 420" fill="none" className="w-full h-full">
                <circle cx="210" cy="210" r="195" stroke="rgba(27,60,175,0.12)" strokeWidth="1.5" strokeDasharray="8 6" />
                {/* Gear teeth */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 15 * Math.PI) / 180;
                  const x = Math.round((210 + 195 * Math.cos(angle)) * 100) / 100;
                  const y = Math.round((210 + 195 * Math.sin(angle)) * 100) / 100;
                  return (
                    <circle key={i} cx={x} cy={y} r="3" fill="rgba(15,159,223,0.2)" />
                  );
                })}
              </svg>
            </motion.div>

            {/* Counter-rotating inner gear ring */}
            <motion.div
              className="absolute w-[260px] h-[260px] md:w-[320px] md:h-[320px]"
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            >
              <svg viewBox="0 0 320 320" fill="none" className="w-full h-full">
                <circle cx="160" cy="160" r="150" stroke="rgba(27,60,175,0.08)" strokeWidth="1" strokeDasharray="4 8" />
                {Array.from({ length: 16 }).map((_, i) => {
                  const angle = (i * 22.5 * Math.PI) / 180;
                  const x = Math.round((160 + 150 * Math.cos(angle)) * 100) / 100;
                  const y = Math.round((160 + 150 * Math.sin(angle)) * 100) / 100;
                  return (
                    <rect key={i} x={x - 2} y={y - 2} width="4" height="4" rx="1" fill="rgba(15,159,223,0.15)" transform={`rotate(${i * 22.5} ${x} ${y})`} />
                  );
                })}
              </svg>
            </motion.div>

            {/* Pulsing glow behind image */}
            <motion.div
              className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-[#1b3caf]/10 blur-3xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Engine image */}
            <motion.img
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              src="/silnik.png"
              alt="Silnik - Rippa"
              className="relative z-10 w-full max-w-[280px] md:max-w-[340px] h-auto drop-shadow-[0_0_40px_rgba(27,60,175,0.15)] object-contain"
            />
          </div>

          <div className="w-full lg:w-1/2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-[0.15em] text-[#0f9fdf] border border-[#1b3caf]/20 rounded-full uppercase bg-[#1b3caf]/5">
                Technologia
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Moc, która napędza{" "}
                <span className="bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] bg-clip-text text-transparent">
                  Twój sukces
                </span>
              </h2>
              <p className="text-[#8b92a9] leading-relaxed mb-8">
                Każda mini-koparka Rippa została zaprojektowana z myślą o
                maksymalnej wydajności w trudnych warunkach. Serce maszyny to
                legendarna jednostka napędowa, która łączy kulturę pracy
                z potężnym momentem obrotowym.
              </p>

              <div className="space-y-5">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    viewport={{ once: true }}
                    className="group flex items-start gap-4 p-4 rounded-xl bg-white/[3%] border border-white/[6%] hover:border-[#1b3caf]/30 hover:bg-white/[5%] transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#1b3caf]/20 to-[#0f9fdf]/10 flex items-center justify-center text-[#0f9fdf] group-hover:from-[#1b3caf] group-hover:to-[#0f9fdf] group-hover:text-white transition-all duration-300">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        {step.title}
                      </h4>
                      <p className="text-[#8b92a9] text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
