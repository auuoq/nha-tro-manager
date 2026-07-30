import React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white border border-[#E8E5DF] rounded-2xl p-12 text-center text-[#73766F] shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4 animate-fade-in",
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#F8F7F4] text-[#3F594F] flex items-center justify-center mx-auto border border-[#E8E5DF]">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="space-y-1">
        <h4 className="text-base font-semibold text-[#252724] tracking-tight">{title}</h4>
        {description && <p className="text-xs text-[#73766F] max-w-sm mx-auto">{description}</p>}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
