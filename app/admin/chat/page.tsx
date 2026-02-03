import React from "react";

export default function AdminChatPageDisabled() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-[#1a1f2e] p-8 rounded-lg border border-[#1b3caf]/30 text-center">
        <h2 className="text-white text-xl font-semibold mb-4">
          Czat tymczasowo wyłączony
        </h2>
        <p className="text-[#b0b0b0]">
          Funkcja czatu została wyłączona. Jeśli chcesz ją przywrócić,
          skontaktuj się z zespołem developerskim.
        </p>
      </div>
    </div>
  );
}
