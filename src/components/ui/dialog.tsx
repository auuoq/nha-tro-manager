import React from "react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}) => {
  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
      <div className={cn("bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full border border-[#E8E5DF] overflow-hidden my-8 transition-all", maxWidthStyles[maxWidth])}>
        <div className="px-6 py-4 border-b border-[#F2EFE9] flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#252724] tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#73766F] hover:text-[#252724] hover:bg-[#F2EFE9] transition-colors p-1.5 rounded-lg"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
