"use client";

import React from "react";
import Link from "next/link";
import { RoomItemDTO } from "../types/room.types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, translateRoomStatus } from "@/lib/formatters";
import { Home, Wrench, CheckCircle2, Trash2, ArrowRight } from "lucide-react";

export interface RoomCardProps {
  room: RoomItemDTO;
  onArchive: (roomId: string) => void;
  onToggleMaintenance: (roomId: string, currentStatus: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onArchive, onToggleMaintenance }) => {
  const statusInfo = translateRoomStatus(room.status);

  return (
    <Card
      className="hover:border-[#C8B8A8] transition-all flex flex-col justify-between"
      title={
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F2EFE9] text-[#3F594F] flex items-center justify-center font-medium shrink-0">
            <Home className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#252724] tracking-tight">Phòng {room.roomNumber}</h3>
            <p className="text-xs text-[#73766F] font-normal">{room.buildingName} • Tầng {room.floor} • {room.roomType}</p>
          </div>
        </div>
      }
      action={
        <div className="flex gap-1.5">
          {room.status === "VACANT" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[#A36E35] hover:bg-[#FBF3E8] text-xs"
              onClick={() => onToggleMaintenance(room.id, room.status)}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Bảo Trì</span>
            </Button>
          )}
          {room.status === "MAINTENANCE" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[#3E6148] hover:bg-[#EBF3ED] text-xs"
              onClick={() => onToggleMaintenance(room.id, room.status)}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Hoàn Thành</span>
            </Button>
          )}
          {room.status !== "RENTED" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[#A84646] hover:bg-[#FDF0F0] p-2"
              title="Lưu trữ phòng"
              onClick={() => onArchive(room.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-3.5">
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <div className="bg-[#F8F7F4] p-2.5 rounded-xl border border-[#E8E5DF]">
            <span className="text-[#73766F] block text-[11px]">Giá thuê</span>
            <span className="text-xs font-semibold text-[#252724] mt-0.5 block">{formatCurrency(room.basePrice)}</span>
          </div>
          <div className="bg-[#F8F7F4] p-2.5 rounded-xl border border-[#E8E5DF]">
            <span className="text-[#73766F] block text-[11px]">Diện tích</span>
            <span className="text-xs font-semibold text-[#252724] mt-0.5 block">{room.areaSqM} m²</span>
          </div>
          <div className="bg-[#F8F7F4] p-2.5 rounded-xl border border-[#E8E5DF]">
            <span className="text-[#73766F] block text-[11px]">Trạng thái</span>
            <Badge variant={statusInfo.variant} className="mt-1">
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        <div className="pt-2 border-t border-[#F2EFE9] flex items-center justify-between text-xs text-[#73766F]">
          <span>{room.assetsCount} trang thiết bị trong phòng</span>
          <Link href={`/admin/rooms/${room.id}`}>
            <Button variant="outline" size="sm" className="text-xs py-1 h-7">
              <span>Chi Tiết</span>
              <ArrowRight className="w-3 h-3 text-[#73766F]" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
