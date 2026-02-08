import React from "react";

const applications = [
  {
    title: "Ogród i Zieleń",
    description:
      "Idealne do nasadzeń, niwelacji terenu i systemów nawadniania.",
    image: "/Ogród i Zieleń.png",
  },
  {
    title: "Plac Budowy",
    description: "Wsparcie przy wykopach pod fundamenty i przyłączach.",
    image: "/Plac Budowy.png",
  },
  {
    title: "Instalacje",
    description: "Precyzyjne wykopy pod kable, rury i światłowody.",
    image: "/Instalacje.png",
  },
  {
    title: "Prace Brukarskie",
    description: "Korytowanie i przygotowanie podłoża pod kostkę.",
    image: "/Prace Brukarskie.png",
  },
];

export const Applications: React.FC = () => {
  return (
    <section
      id="applications"
      className="w-full py-28 bg-[#080c11] scroll-mt-20"
    >
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-[0.15em] text-[#0f9fdf] border border-[#1b3caf]/20 rounded-full uppercase bg-[#1b3caf]/5">
            Zastosowania
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Wszechstronne Zastosowanie
          </h2>
          <p className="text-[#8b92a9] max-w-xl mx-auto">
            Od ogrodów po place budowy — nasze maszyny sprawdzają się wszędzie
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {applications.map((app, index) => (
            <div
              key={index}
              className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-[#1b3caf]/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1b3caf]/10"
            >
              <img
                src={encodeURI(app.image)}
                alt={app.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#1b3caf] to-[#0f9fdf] rounded-full" />
                  <h3 className="text-xl font-bold text-white">
                    {app.title}
                  </h3>
                </div>
                <p className="text-gray-300/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 pl-3">
                  {app.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
