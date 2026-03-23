const fs = require('fs');
let code = fs.readFileSync('app/products/[id]/ProductClient.tsx', 'utf-8');
code = code.split('\r\n').join('\n');

// 0. Import useEmblaCarousel
if (!code.includes('import useEmblaCarousel')) {
  code = code.replace(
    'import { useState, useEffect, FormEvent } from "react";',
    'import { useState, useEffect, FormEvent } from "react";\nimport useEmblaCarousel from "embla-carousel-react";'
  );
}

// 1. Embla Carousel for accessories
const accessoriesOld = `        {/* Accessories Section */}
        {accessories.length > 0 && (
          <section className="py-16 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Polecane produkty
              </h2>
              <p className="text-[#b0b0b0] mb-8">
                Sprawdź kompatybilne produkty
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {accessories.map((acc: { id: string; name: string; slug?: string | null; description: string | null; price: number | null; imageUrl: string | null }) => (
                  <Link
                    key={acc.id}
                    href={\`/products/\${acc.slug || acc.id}\`}
                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#1b3caf]/40 transition-all duration-300 group block"
                  >
                    <div className="aspect-square bg-white/5 relative overflow-hidden">
                      {acc.imageUrl ? (
                        <Image
                          src={acc.imageUrl}
                          alt={acc.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-[#6b7280]" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {acc.name}
                      </h3>
                      {acc.description && (
                        <p className="text-[#b0b0b0] text-sm line-clamp-2 mb-3">
                          {acc.description}
                        </p>
                      )}
                      {acc.price && (
                        <p className="text-[#1b3caf] font-bold text-lg">
                          {formatPrice(Number(acc.price))} PLN
                        </p>
                      )}
                      <span className="text-[#0f9fdf] text-sm mt-2 inline-block group-hover:underline">
                        Zobacz szczegóły →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}`;

const accessoriesNew = `        {/* Accessories Section */}
        {accessories.length > 0 && (
          <AccessoriesCarousel accessories={accessories} />
        )}`;

if (code.includes('Sprawdź kompatybilne produkty')) {
  code = code.replace(accessoriesOld, accessoriesNew);
  
  const carouselComponent = `
function AccessoriesCarousel({ accessories }: { accessories: any[] }) {
  const [emblaRef] = useEmblaCarousel({ align: "start", dragFree: true });

  const formatPrice = (price: number) => {
    return Math.round(Number(price)).toLocaleString("pl-PL", { useGrouping: true }).replace(/,/g, "\\u00a0");
  };

  return (
    <section className="py-24 border-t border-white/10 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-white mb-4 text-center">
          Polecane produkty
        </h2>
        <p className="text-[#b0b0b0] mb-12 text-lg text-center">
          Sprawdź kompatybilne narzędzia i akcesoria operacyjne
        </p>
        
        <div className="overflow-hidden p-2" ref={emblaRef}>
          <div className="flex gap-6 pb-8">
            {accessories.map((acc: any) => (
              <div 
                key={acc.id}
                className="flex-[0_0_80%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] xl:flex-[0_0_22%] 2xl:flex-[0_0_18%] min-w-0"
              >
                <Link
                  href={\`/products/\${acc.slug || acc.id}\`}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#1b3caf]/40 hover:shadow-xl hover:shadow-[#1b3caf]/20 transition-all duration-300 group block h-full flex flex-col"
                >
                  <div className="aspect-[4/3] bg-[#0a0d14] relative overflow-hidden">
                    {acc.imageUrl ? (
                      <Image
                        src={acc.imageUrl}
                        alt={acc.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-[#6b7280]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] to-transparent opacity-80" />
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#1b3caf] transition-colors drop-shadow-lg">
                          {acc.name}
                        </h3>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow bg-white/[0.02]">
                    {acc.description && (
                      <p className="text-[#b0b0b0] text-sm line-clamp-2 mb-6 h-10">
                        {acc.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                      <div className="flex flex-col">
                         <span className="text-[10px] text-[#6b7280] uppercase tracking-wider font-bold">
                            Cena
                          </span>
                        <p className="text-[#1b3caf] font-bold text-lg">
                          {acc.price ? formatPrice(Number(acc.price)) + " PLN" : "Zapytaj o cenę"}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#1b3caf] group-hover:border-[#1b3caf] transition-all duration-300">
                        <span className="text-white transform group-hover:translate-x-0.5 transition-transform">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductClient({
  model: initialModel,
`;
  code = code.replace('export function ProductClient({', carouselComponent);
}

// 2. Hide parameters section completely if empty
let specsMatch = code.match(/\\{\\/\\* Specs Section with Tabs \\*\\/\\}([\\s\\S]*?)\\{\\/\\* Sections from Product Data \\*\\/\\}/);
if (specsMatch) {
  let specsStr = specsMatch[0];
  
  if (!specsStr.includes("return null;")) {
      const conditionOld = \`            {model.parameters && model.parameters.length > 0 ? (
              (() => {
                const overrides = getParameterOverrides();

                // Filter out parameters with empty values
                const filledParameters = model.parameters.filter((p: any) => {\`;
      
      const conditionNew = \`            {(() => {
                if (!model.parameters || model.parameters.length === 0) return null;
                const overrides = getParameterOverrides();

                // Filter out parameters with empty values
                const filledParameters = model.parameters.filter((p: any) => {\`;
      
      let newSpecsStr = specsStr.replace(conditionOld, conditionNew);
      
      const middleOld = \`                  return true;
                });

                if (filledParameters.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <p className="text-[#6b7280] text-lg">
                        Parametry techniczne nie zostały jeszcze zdefiniowane
                        dla tego modelu.
                      </p>
                    </div>
                  );
                }\`;
      const middleNew = \`                  return true;
                });

                if (filledParameters.length === 0) return null;

                return (
                  <section className="py-20 border-t border-white/10">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                      <h2 className="text-4xl font-bold text-white mb-12 text-center bg-gradient-to-r from-[#1b3caf] via-white to-[#0f9fdf] bg-clip-text text-transparent">
                        Specyfikacja techniczna
                      </h2>\`;
      newSpecsStr = newSpecsStr.replace(middleOld, middleNew);
      
      const wrapSectionOld = \`        <section className="py-20 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-12 text-center bg-gradient-to-r from-[#1b3caf] via-white to-[#0f9fdf] bg-clip-text text-transparent">
              Specyfikacja techniczna
            </h2>\`;
      const wrapSectionNew = \`\`;
      newSpecsStr = newSpecsStr.replace(wrapSectionOld, wrapSectionNew);
      
      const endBlockOld = \`              })()
            ) : (
              <div className="text-center py-12">
                <p className="text-[#6b7280] text-lg">
                  Parametry techniczne nie zostały jeszcze zdefiniowane dla tego
                  modelu.
                </p>
              </div>
            )}
          </div>
        </section>\`;
      const endBlockNew = \`                    </div>
                  </section>
                );
              })()}
        \`;
      newSpecsStr = newSpecsStr.replace(endBlockOld, endBlockNew);
      
      code = code.replace(specsStr, newSpecsStr);
  }
}

fs.writeFileSync('app/products/[id]/ProductClient.tsx', code);
console.log('SUCCESS!');
