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
      className="w-full py-32 bg-[#080808] scroll-mt-20 mt-8"
    >
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-12 text-center">
          Wszechstronne Zastosowanie
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {applications.map((app, index) => (
            <div
              key={index}
              className="group relative h-80 rounded-lg overflow-hidden cursor-pointer"
            >
              <img
                src={encodeURI(app.image)}
                alt={app.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-xl font-bold text-white mb-2 border-l-4 border-rippa-blue pl-3">
                  {app.title}
                </h3>
                <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
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
