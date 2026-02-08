import React from "react";

interface LoadingScreenProps {
  /** Text shown below the spinner */
  message?: string;
  /** Whether to render full-screen (min-h-screen) or inline */
  fullScreen?: boolean;
}

export default function LoadingScreen({
  message = "Ładowanie...",
  fullScreen = true,
}: LoadingScreenProps) {
  // Inline fallbacks should not draw a solid dark background so they blend
  // into the surrounding layout (prevent the 'czarny box' effect). Full
  // screen mode keeps the dark page background.
  const containerClass = fullScreen
    ? "min-h-screen bg-[#080c11] flex items-center justify-center"
    : "min-h-[40vh] bg-transparent flex items-center justify-center";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        {/* Dual-ring spinner */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[#1b3caf]/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0f9fdf] animate-spin" />
        </div>
        <p className="text-[#8b92a9] text-sm">{message}</p>
      </div>
    </div>
  );
}
