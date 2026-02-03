"use client";

import React from "react";
import { motion } from "framer-motion";

export const ProductStory: React.FC = () => {
  return (
    <section className="w-full py-32 bg-[#080808] border-y border-white/5 overflow-hidden scroll-mt-20 mt-8">
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute -inset-4 bg-rippa-blue/20 blur-3xl rounded-full opacity-20"></div>
            <motion.img
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              src="/silnik.png"
              alt="Silnik - Rippa"
              className="relative w-full max-w-md h-auto rounded shadow-lg shadow-black block mx-auto object-contain"
            />
          </div>

          <div className="w-full lg:w-1/2 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-rippa-blue font-bold tracking-wider uppercase text-sm mb-2">
                Technologia
              </h3>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
                Moc, która napędza Twój sukces
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Każda mini-koparka Rippa została zaprojektowana z myślą o
                maksymalnej wydajności w trudnych warunkach. Serce maszyny to
                legendarna jednostka napędowa, która łączy w sobie kulturę pracy
                z potężnym momentem obrotowym.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl font-bold text-white/20">01</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">
                      Moc Silnika
                    </h4>
                    <p className="text-gray-500 text-sm">
                      Wydajne jednostki diesla spełniające normy Euro 5, gotowe
                      do ciężkiej pracy bez przerw.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-4xl font-bold text-white/20">02</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">
                      Głębokość Kopania
                    </h4>
                    <p className="text-gray-500 text-sm">
                      Zoptymalizowane ramię kopiące pozwala osiągnąć imponujące
                      zasięgi przy zachowaniu stabilności.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-4xl font-bold text-white/20">03</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">
                      Kompaktowe Wymiary
                    </h4>
                    <p className="text-gray-500 text-sm">
                      Rozsuwane gąsienice pozwalają na wjazd przez standardowe
                      drzwi (70-80cm), a po rozłożeniu dają pełną stabilność.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
