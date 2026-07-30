import React from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-[#52554E] tracking-wide mb-1.5">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full h-10.5 px-3.5 border rounded-xl text-sm bg-white text-[#252724] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3F594F]/20 focus:border-[#3F594F]",
            error ? "border-[#A84646]" : "border-[#E8E5DF]",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-[#A84646] font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
