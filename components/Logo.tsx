import React from "react";

export const Logo: React.FC<{ className?: string }> = ({
  className = "h-10",
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto text-rippa-blue"
      >
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" />
        <path d="M50 15 L80 80 L50 65 L20 80 L50 15 Z" fill="currentColor" />
        <path d="M40 55 L60 55" stroke="#050505" strokeWidth="4" />
      </svg>
      <span className="font-display font-bold text-xl tracking-wide text-white">
        RIPPA <span className="text-rippa-blue">POLSKA</span>
      </span>
    </div>
  );
};
