import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { X } from "lucide-react";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className={cn("relative w-full max-w-lg bg-white rounded-2xl border border-[#E8E5DF] shadow-lg overflow-hidden animate-slide-up", className)}>
        <div className="flex items-center justify-between p-6 border-b border-[#E8E5DF]">
          <div>
            {title && <h3 className="text-base font-semibold text-[#252724]">{title}</h3>}
            {description && <p className="text-xs text-[#73766F] mt-0.5">{description}</p>}
          </div>
          <button onClick={onClose} className="p-1 text-[#73766F] hover:text-[#252724] rounded-lg transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
