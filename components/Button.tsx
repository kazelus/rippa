import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  icon,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 rounded-lg";

  const variants = {
    primary:
      "bg-[#1b3caf] hover:bg-[#2850d4] text-white shadow-lg shadow-[#1b3caf]/20 hover:shadow-[#1b3caf]/40",
    outline:
      "border-2 border-[#1b3caf] hover:border-[#2850d4] text-white hover:bg-[#1b3caf]/10",
    ghost: "text-[#b0b0b0] hover:text-white hover:bg-[#1b3caf]/10",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
      {icon && <span className="text-lg">{icon}</span>}
    </button>
  );
};
