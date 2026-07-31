import React from "react";
import { AlertTriangle } from "lucide-react";

export const StagingBanner: React.FC = () => {
  return (
    <div className="bg-[#A36E35] text-white px-4 py-1.5 text-xs font-medium flex items-center justify-center gap-2 z-50">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>Môi trường Staging (Chỉ sử dụng dữ liệu kiểm thử)</span>
    </div>
  );
};
