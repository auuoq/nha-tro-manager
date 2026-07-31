import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variantStyles = {
      primary: "bg-[#3F594F] text-white hover:bg-[#344B42] active:bg-[#2B3E37] shadow-xs border border-transparent",
      secondary: "bg-[#EBF0ED] text-[#3F594F] hover:bg-[#DEE7E2] active:bg-[#D1DDD6] border border-transparent",
      outline: "bg-white text-[#252724] border-[#E8E5DF] hover:bg-[#F8F7F4] active:bg-[#F2EFE9] shadow-2xs",
      danger: "bg-[#A84646] text-white hover:bg-[#8F3B3B] active:bg-[#783131] shadow-xs border border-transparent",
      ghost: "bg-transparent text-[#73766F] hover:bg-[#F2EFE9] hover:text-[#252724]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-4 text-xs font-semibold rounded-xl gap-2",
      lg: "h-12 px-6 text-sm font-semibold rounded-xl gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-hidden focus:ring-2 focus:ring-[#3F594F]/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shrink-0",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
