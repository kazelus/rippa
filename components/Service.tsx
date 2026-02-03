import React from "react";
import Link from "next/link";
import { ShieldCheck, Wrench, HeadphonesIcon } from "lucide-react";
import { Button } from "./Button";

export const Service: React.FC = () => {
  return (
    <section
      id="service"
      className="w-full py-32 bg-rippa-dark relative scroll-mt-20 mt-8"
    >
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-1/2">
            <Link href="/contact" className="inline-block">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6 hover:underline">
                Profesjonalne wsparcie <br />
                na każdym etapie
              </h2>
            </Link>
            <p className="text-gray-400 mb-10 text-lg">
              Kupując maszynę Rippa, nie kupujesz tylko sprzętu. Zyskujesz
              partnera, który dba o ciągłość Twojej pracy. Nasz centralny serwis
              w Polsce gwarantuje spokój ducha.
            </p>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rippa-blue/10 flex items-center justify-center text-rippa-blue">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">
                    Gwarancja i Bezpieczeństwo
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Pełna ochrona gwarancyjna realizowana w Polsce. Jasne zasady
                    i brak ukrytych kruczków.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rippa-blue/10 flex items-center justify-center text-rippa-blue">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">
                    Części Zamienne
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Własny magazyn części zamiennych. Wysyłka w 24h lub odbiór
                    osobisty w naszej siedzibie.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rippa-blue/10 flex items-center justify-center text-rippa-blue">
                  <HeadphonesIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">
                    Wsparcie Techniczne
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Infolinia serwisowa dostępna dla naszych klientów. Pomoc w
                    diagnostyce i eksploatacji.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <Link href="/contact">
                <Button variant="primary">Skontaktuj się z serwisem</Button>
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-1/2 relative">
            <div className="absolute top-10 right-10 w-full h-full border-2 border-rippa-blue/20 rounded z-0"></div>
            <img
              src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop"
              alt="Service Mechanic"
              className="relative z-10 rounded shadow-2xl w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
