import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full h-10 px-3.5 bg-white border border-[#E8E5DF] rounded-xl text-xs text-[#252724] placeholder:text-[#9EA29A] transition-all duration-150 shadow-2xs focus:outline-hidden focus:border-[#3F594F] focus:ring-2 focus:ring-[#3F594F]/15 disabled:bg-[#F8F7F4] disabled:text-[#9EA29A] disabled:cursor-not-allowed",
          error && "border-[#A84646] focus:border-[#A84646] focus:ring-[#A84646]/15",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
