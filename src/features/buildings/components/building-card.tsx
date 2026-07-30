"use client";

import React from "react";
import Link from "next/link";
import { BuildingItemDTO } from "../types/building.types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, DoorOpen, CreditCard, ArrowRight, Trash2 } from "lucide-react";

export interface BuildingCardProps {
  building: BuildingItemDTO;
  onArchive: (buildingId: string) => void;
}

export const BuildingCard: React.FC<BuildingCardProps> = ({ building, onArchive }) => {
  return (
    <Card
      className="hover:border-[#C8B8A8] transition-all flex flex-col justify-between"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBF0ED] text-[#3F594F] flex items-center justify-center font-medium shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#252724] tracking-tight">{building.name}</h3>
            <p className="text-xs text-[#73766F] font-normal">{building.address}</p>
          </div>
        </div>
      }
      action={
        <Button
          variant="ghost"
          size="sm"
          className="text-[#A84646] hover:bg-[#FDF0F0] hover:text-[#A84646] p-2"
          title="Lưu trữ tòa nhà"
          onClick={() => onArchive(building.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-[#F8F7F4] p-3 rounded-xl border border-[#E8E5DF]">
            <div className="flex items-center gap-1.5 text-[#73766F] mb-1">
              <DoorOpen className="w-3.5 h-3.5" />
              <span>Tổng số phòng</span>
            </div>
            <span className="text-lg font-semibold text-[#252724]">{building.roomsCount} phòng</span>
          </div>
          <div className="bg-[#EBF3ED] p-3 rounded-xl border border-[#D1E3D5]">
            <div className="flex items-center gap-1.5 text-[#3E6148] mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Hợp đồng đang thuê</span>
            </div>
            <span className="text-lg font-semibold text-[#3E6148]">{building.activeContractsCount} hợp đồng</span>
          </div>
        </div>

        {/* Bank & Payment Info Preview */}
        {(building.bankAccountNo || building.bankName) && (
          <div className="flex items-center gap-2 text-xs text-[#73766F] bg-[#F2EFE9]/50 p-2.5 rounded-xl border border-[#E8E5DF]/60">
            <CreditCard className="w-4 h-4 text-[#3F594F] shrink-0" />
            <span className="truncate">
              {building.bankName || "Ngân hàng"}: <strong className="text-[#252724] font-medium">{building.bankAccountNo}</strong> ({building.bankAccountName})
            </span>
          </div>
        )}

        {/* Default Service Charge Config Badges */}
        <div className="pt-2 border-t border-[#F2EFE9]">
          <span className="text-[11px] font-semibold text-[#73766F] uppercase tracking-wider block mb-2">
            Phí dịch vụ mặc định ({building.chargeConfigs.length} khoản):
          </span>
          {building.chargeConfigs.length === 0 ? (
            <p className="text-xs text-[#A3A69F] italic">Chưa thiết lập đơn giá dịch vụ cấp Tòa nhà</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {building.chargeConfigs.map((c) => (
                <Badge key={c.id} variant="neutral" className="text-[11px]">
                  {c.chargeType}: {c.unitPrice.toLocaleString("vi-VN")}đ
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-[#F2EFE9] flex items-center justify-between">
          <Badge variant="success">Hoạt động tốt</Badge>
          <Link href={`/admin/buildings/${building.id}`}>
            <Button variant="outline" size="sm" className="text-xs">
              <span>Chi Tiết & Cấu Hình</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#73766F]" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
