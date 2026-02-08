"use client";

import React, { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

interface Model {
  id: string;
  name: string;
  description: string;
  power?: number;
  depth?: number;
  weight?: number;
  bucket?: number;
  price: number;
  featured: boolean;
  images: Array<{ id: string; url: string; alt: string }>;
  quickSpecs?: Array<{
    label: string;
    value: any;
    unit: string;
    paramLabel: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const Models: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("/api/models");
        if (response.ok) {
          const data = await response.json();
          setModels(data);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const displayedModels = models.slice(0, 3);

  if (loading) {
      return (
        <section
          id="models"
          className="w-full py-32 bg-rippa-dark relative scroll-mt-20 mt-8"
        >
          <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto">
            <div className="text-center">
              <LoadingScreen message="Ładowanie modeli..." fullScreen={false} />
            </div>
          </div>
        </section>
      );
  }

  return (
    <section
      id="models"
      className="w-full py-24 bg-[#0f1419] relative scroll-mt-20 border-t border-white/5"
    >
      <div className="w-full max-w-[1600px] px-6 sm:px-10 lg:px-20 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Poznaj Nasze Maszyny
          </h2>
          <p className="text-[#b0b0b0] text-lg max-w-2xl mx-auto">
            Niezawodne, wydajne i precyzyjne. Zaprojektowane, by sprostać
            każdemu wyzwaniu w terenie.
          </p>
        </div>

        {displayedModels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#b0b0b0]">Brak dostępnych modeli</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {displayedModels.map((model, index) => (
                <Link
                  href={`/products/${model.id}`}
                  key={model.id}
                  className="block h-full group"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="h-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#1b3caf]/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-lg shadow-black/20 hover:shadow-[#1b3caf]/10"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#1a1f2e]">
                      {model.images && model.images.length > 0 ? (
                        <img
                          src={model.images[0].url}
                          alt={model.images[0].alt || model.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          Brak zdjęcia
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] via-transparent to-transparent opacity-80" />

                      {model.featured && (
                        <div className="absolute top-4 right-4 bg-[#1b3caf] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-black/30 backdrop-blur-md bg-opacity-90">
                          Bestseller
                        </div>
                      )}

                      {/* Floating Name */}
                      <div className="absolute bottom-4 left-4 right-4 z-10">
                        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[#1b3caf] transition-colors drop-shadow-lg">
                          {model.name}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow bg-white/[0.02]">
                      <p className="text-[#b0b0b0] text-sm line-clamp-2 mb-6 h-10">
                        {model.description}
                      </p>

                      {/* Specs Compact Grid - Dynamic Quick Specs */}
                      {(() => {
                        const specs =
                          model.quickSpecs && model.quickSpecs.length > 0
                            ? model.quickSpecs.slice(0, 3)
                            : null;
                        if (!specs) return null;
                        return (
                          <div
                            className={`grid grid-cols-${Math.min(specs.length, 3)} gap-2 mb-6 mt-auto`}
                          >
                            {specs.map((qs, i) => {
                              let displayVal = qs.value;
                              if (typeof displayVal === "string") {
                                try {
                                  displayVal = JSON.parse(displayVal);
                                } catch {}
                              }
                              return (
                                <div
                                  key={i}
                                  className="bg-[#0f1419]/50 p-3 rounded-xl text-center border border-white/5 group-hover:border-white/10 transition-colors"
                                >
                                  <div className="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1 font-bold">
                                    {qs.label}
                                  </div>
                                  <div className="text-sm font-bold text-white group-hover:text-[#1b3caf] transition-colors">
                                    {displayVal}
                                    {qs.unit ? ` ${qs.unit}` : ""}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#6b7280] uppercase tracking-wider font-bold">
                            Cena od
                          </span>
                          <span className="text-[#1b3caf] font-bold text-lg">
                            {model.price.toLocaleString("en-US")} PLN
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#1b3caf] group-hover:border-[#1b3caf] transition-all duration-300">
                          <span className="text-white transform group-hover:translate-x-0.5 transition-transform">
                            →
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link href="/products">
                <button className="px-8 py-4 bg-transparent hover:bg-[#1b3caf]/10 border border-[#1b3caf] text-white hover:text-[#1b3caf] font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-1">
                  Zobacz wszystkie modele
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
