"use client";

import React, { useEffect, useRef, useState } from "react";

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent tabular-nums">
      {count}{suffix}
    </div>
  );
}

const stats = [
  { value: 250, suffix: "+", label: "Sprzedanych Maszyn" },
  { value: 15, suffix: "", label: "Lat Doświadczenia" },
  { value: 24, suffix: "h", label: "Czas Reakcji Serwisu" },
];

export const Stats: React.FC = () => {
  return (
    <section className="w-full py-16 bg-[#080c11] relative overflow-hidden scroll-mt-20">
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0 md:divide-x md:divide-white/10">
          {stats.map((stat, i) => (
            <div key={i} className="text-center px-12 md:px-16 space-y-1.5">
              <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              <p className="text-[#8b92a9] text-xs font-medium uppercase tracking-[0.15em]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
