"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

export function StagingBanner() {
  // Display only when NEXT_PUBLIC_STAGING is true or process.env.NODE_ENV is not production
  const isStaging = process.env.NEXT_PUBLIC_STAGING === "true" || process.env.NODE_ENV !== "production";

  if (!isStaging) return null;

  return (
    <div className="bg-[#FBF3E8] border-b border-[#F0E0C9] text-[#A36E35] px-4 py-2 text-xs font-medium flex items-center justify-center gap-2 select-none relative z-50 shadow-2xs">
      <AlertTriangle className="w-4 h-4 shrink-0 text-[#A36E35]" />
      <span>
        <strong>MÔI TRƯỜNG THỬ NGHIỆM (STAGING):</strong> Không nhập thông tin cá nhân hoặc tài liệu CCCD thật trong giai đoạn trải nghiệm.
      </span>
      <span className="ml-2 px-2 py-0.5 rounded-full bg-[#A36E35]/15 text-[#825424] font-semibold text-[10px] uppercase tracking-wider">
        Staging Mode
      </span>
    </div>
  );
}
