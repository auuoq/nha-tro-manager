import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3F594F]/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs";

  const variantStyles = {
    primary: "bg-[#3F594F] text-white hover:bg-[#344B42] active:bg-[#2A3D36]",
    secondary: "bg-[#F2EFE9] text-[#252724] hover:bg-[#E8E4DC] active:bg-[#DFDBD2]",
    danger: "bg-[#A84646] text-white hover:bg-[#933B3B] active:bg-[#7D3232]",
    ghost: "bg-transparent text-[#73766F] hover:bg-[#F2EFE9] hover:text-[#252724] shadow-none",
    outline: "border border-[#E8E5DF] bg-white text-[#252724] hover:bg-[#F8F7F4] active:bg-[#F2EFE9]",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5 h-8",
    md: "px-4 py-2 text-sm gap-2 h-10",
    lg: "px-5 py-2.5 text-sm font-semibold gap-2.5 h-11",
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
