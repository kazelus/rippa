import React from "react";

export const Stats: React.FC = () => {
  return (
    <section className="w-full py-32 bg-rippa-blue relative overflow-hidden scroll-mt-20 mt-8">
      {/* Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-display font-bold text-white mb-2">
              250+
            </div>
            <div className="h-1 w-12 bg-white/30 mx-auto rounded-full mb-4"></div>
            <p className="text-white/80 font-medium uppercase tracking-wide">
              Sprzedanych Maszyn
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-display font-bold text-white mb-2">
              15
            </div>
            <div className="h-1 w-12 bg-white/30 mx-auto rounded-full mb-4"></div>
            <p className="text-white/80 font-medium uppercase tracking-wide">
              Lat Doświadczenia
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-display font-bold text-white mb-2">
              24h
            </div>
            <div className="h-1 w-12 bg-white/30 mx-auto rounded-full mb-4"></div>
            <p className="text-white/80 font-medium uppercase tracking-wide">
              Czas Reakcji Serwisu
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
