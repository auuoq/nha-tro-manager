import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  subtitle,
  action,
}) => {
  return (
    <div className={cn("bg-white rounded-2xl border border-[#E8E5DF] shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-150", className)}>
      {(title || action) && (
        <div className="px-6 py-4.5 border-b border-[#F2EFE9] flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-[#252724] tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-[#73766F] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
