import React from "react";
import { MessageSquareOff } from "lucide-react";

export default function AdminChatPageDisabled() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="bg-gradient-to-br from-white/[6%] to-white/[2%] border border-white/10 rounded-2xl p-10 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 mx-auto">
          <MessageSquareOff className="w-7 h-7 text-[#8b92a9]" />
        </div>
        <h2 className="text-white text-xl font-semibold mb-3">
          Czat tymczasowo wyłączony
        </h2>
        <p className="text-[#8b92a9] text-sm">
          Funkcja czatu została wyłączona. Jeśli chcesz ją przywrócić,
          skontaktuj się z zespołem developerskim.
        </p>
      </div>
    </div>
  );
}
