import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#52554E] tracking-wide mb-1.5">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full h-10.5 px-3.5 border rounded-xl text-sm bg-white text-[#252724] placeholder-[#A3A69F] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3F594F]/20 focus:border-[#3F594F]",
            error ? "border-[#A84646] text-[#A84646] focus:ring-[#A84646]/20 focus:border-[#A84646]" : "border-[#E8E5DF]",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[#A84646] font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-[#73766F]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
