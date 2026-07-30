"use client";

import React from "react";
import { RoomItemDTO } from "../types/room.types";
import { RoomCard } from "./room-card";

export interface RoomGridProps {
  rooms: RoomItemDTO[];
  onArchive: (roomId: string) => void;
  onToggleMaintenance: (roomId: string, currentStatus: string) => void;
}

export const RoomGrid: React.FC<RoomGridProps> = ({ rooms, onArchive, onToggleMaintenance }) => {
  if (rooms.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-sm">
        <p className="text-base font-medium">Chưa có phòng trọ nào được khởi tạo.</p>
        <p className="text-xs text-slate-400 mt-1">Nhấn vào nút "+ Thêm Phòng Mới" ở trên để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {rooms.map((r) => (
        <RoomCard key={r.id} room={r} onArchive={onArchive} onToggleMaintenance={onToggleMaintenance} />
      ))}
    </div>
  );
};
