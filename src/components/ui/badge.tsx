import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className = "",
}) => {
  const variantStyles = {
    success: "bg-[#EBF3ED] text-[#3E6148] border-[#D1E3D5]",
    warning: "bg-[#FBF3E8] text-[#A36E35] border-[#F2E0C9]",
    danger: "bg-[#FDF0F0] text-[#A84646] border-[#F5D5D5]",
    info: "bg-[#EEF4F8] text-[#4D6779] border-[#D4E3ED]",
    neutral: "bg-[#F2EFE9] text-[#52554E] border-[#E2DDD5]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border tracking-wide whitespace-nowrap shrink-0",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
