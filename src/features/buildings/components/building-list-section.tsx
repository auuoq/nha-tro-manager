"use client";

import React from "react";
import { BuildingItemDTO } from "../types/building.types";
import { BuildingCard } from "./building-card";
import { Building2 } from "lucide-react";

export interface BuildingListSectionProps {
  buildings: BuildingItemDTO[];
  onArchive: (buildingId: string) => void;
}

export const BuildingListSection: React.FC<BuildingListSectionProps> = ({ buildings, onArchive }) => {
  if (buildings.length === 0) {
    return (
      <div className="bg-white border border-[#E8E5DF] rounded-2xl p-12 text-center text-[#73766F] shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#F8F7F4] text-[#3F594F] flex items-center justify-center mx-auto border border-[#E8E5DF]">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-base font-semibold text-[#252724]">Chưa có tòa nhà nào</p>
          <p className="text-xs text-[#A3A69F] mt-1">Nhấn vào nút "+ Thêm Tòa Nhà" ở trên để khởi tạo cơ sở đầu tiên.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {buildings.map((b) => (
        <BuildingCard key={b.id} building={b} onArchive={onArchive} />
      ))}
    </div>
  );
};
