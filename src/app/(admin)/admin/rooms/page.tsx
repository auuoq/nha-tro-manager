"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RoomGrid, RoomFormDialog, RoomItemDTO, getRoomsAction, archiveRoomAction, changeRoomMaintenanceStatusAction } from "@/features/rooms";
import { getBuildingsAction } from "@/features/buildings";

export default function OwnerRoomsPage() {
  const [rooms, setRooms] = useState<RoomItemDTO[]>([]);
  const [buildings, setBuildings] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    const res = await getRoomsAction();
    if (res.success && res.data) setRooms(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
    getBuildingsAction().then((res) => {
      if (res.success && res.data) {
        setBuildings(res.data.map((b) => ({ id: b.id, name: b.name })));
      }
    });
  }, []);

  const handleArchive = async (roomId: string) => {
    if (confirm("Bạn có chắc chắn muốn lưu trữ phòng trọ này?")) {
      const res = await archiveRoomAction(roomId);
      if (res.success) fetchRooms();
      else alert(res.error);
    }
  };

  const handleToggleMaintenance = async (roomId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "MAINTENANCE" ? "VACANT" : "MAINTENANCE";
    const res = await changeRoomMaintenanceStatusAction(roomId, nextStatus as any);
    if (res.success) fetchRooms();
    else alert(res.error);
  };

  return (
    <div>
      <PageHeader
        title="Quản Lý Danh Sách Phòng Trọ"
        description="Toàn bộ danh sách các phòng trọ thuộc các cơ sở nhà trọ của bạn"
        action={<Button variant="primary" onClick={() => setIsDialogOpen(true)}>+ Thêm Phòng Mới</Button>}
      />

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">Đang tải danh sách phòng...</div>
      ) : (
        <RoomGrid rooms={rooms} onArchive={handleArchive} onToggleMaintenance={handleToggleMaintenance} />
      )}

      <RoomFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchRooms}
        buildings={buildings}
      />
    </div>
  );
}
