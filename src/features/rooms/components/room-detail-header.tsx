"use client";

import React from "react";
import Link from "next/link";
import { RoomDetailDTO } from "../types/room.types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface RoomDetailHeaderProps {
  room: RoomDetailDTO;
  onEdit: () => void;
  onToggleMaintenance: () => void;
}

export const RoomDetailHeader: React.FC<RoomDetailHeaderProps> = ({ room, onEdit, onToggleMaintenance }) => {
  const statusBadgeVariant = {
    VACANT: "success" as const,
    RESERVED: "warning" as const,
    RENTED: "info" as const,
    MAINTENANCE: "danger" as const,
  };

  const statusLabel = {
    VACANT: "Còn Trống",
    RESERVED: "Đã Đặt Cọc",
    RENTED: "Đang Cho Thuê",
    MAINTENANCE: "Đang Bảo Trì",
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Link href="/admin/rooms" className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
          ← Quay lại Danh sách Phòng
        </Link>
        <Badge variant={statusBadgeVariant[room.status]}>{statusLabel[room.status]}</Badge>
      </div>

      <PageHeader
        title={`Chi Tiết Phòng ${room.roomNumber}`}
        description={`${room.buildingName} • Tầng ${room.floor} • ${room.roomType} • ${room.areaSqM}m² • ${room.basePrice.toLocaleString("vi-VN")}đ/tháng`}
        action={
          <div className="flex gap-2">
            {room.status === "VACANT" && (
              <Button variant="outline" size="sm" onClick={onToggleMaintenance}>
                🔧 Chuyển Bảo Trì
              </Button>
            )}
            {room.status === "MAINTENANCE" && (
              <Button variant="primary" size="sm" onClick={onToggleMaintenance}>
                ✅ Hoàn Thành Bảo Trì
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onEdit}>
              ✏️ Sửa Thông Tin
            </Button>
          </div>
        }
      />
    </div>
  );
};
