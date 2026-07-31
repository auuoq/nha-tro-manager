import React from "react";
import { cn } from "@/shared/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-[#52554E] tracking-wide mb-1.5">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white text-[#252724] placeholder-[#A3A69F] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3F594F]/20 focus:border-[#3F594F] resize-y min-h-[80px]",
            error ? "border-[#A84646]" : "border-[#E8E5DF]",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[#A84646] font-medium">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
