import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  const variantStyles = {
    success: "bg-[#EBF3ED] text-[#3E6148] border-[#D6E6DA]",
    warning: "bg-[#FBF3E8] text-[#A36E35] border-[#F4E3CD]",
    danger: "bg-[#FDF0F0] text-[#A84646] border-[#F7D4D4]",
    info: "bg-[#EEF4F8] text-[#4D6779] border-[#D9E6EF]",
    neutral: "bg-[#F2EFE9] text-[#73766F] border-[#E2DDD3]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border transition-colors shadow-2xs",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
