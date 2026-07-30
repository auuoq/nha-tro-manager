"use client";

import React, { useEffect, useState, use } from "react";
import {
  RoomDetailHeader,
  RoomAssetList,
  RoomAssetDialog,
  RoomChargeConfigForm,
  RoomFormDialog,
  RoomDetailDTO,
  RoomAssetDTO,
  getRoomDetailAction,
  changeRoomMaintenanceStatusAction,
  archiveRoomAssetAction,
} from "@/features/rooms";
import { getBuildingsAction } from "@/features/buildings";

export default function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const [room, setRoom] = useState<RoomDetailDTO | null>(null);
  const [buildings, setBuildings] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssetOpen, setIsAssetOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<RoomAssetDTO | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    const res = await getRoomDetailAction(roomId);
    if (res.success && res.data) setRoom(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
    getBuildingsAction().then((res) => {
      if (res.success && res.data) setBuildings(res.data.map((b) => ({ id: b.id, name: b.name })));
    });
  }, [roomId]);

  const handleToggleMaintenance = async () => {
    if (!room) return;
    const nextStatus = room.status === "MAINTENANCE" ? "VACANT" : "MAINTENANCE";
    const res = await changeRoomMaintenanceStatusAction(room.id, nextStatus as any);
    if (res.success) fetchDetail();
    else alert(res.error);
  };

  const handleArchiveAsset = async (assetId: string) => {
    if (confirm("Xóa thiết bị này khỏi phòng?")) {
      const res = await archiveRoomAssetAction(assetId);
      if (res.success) fetchDetail();
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải chi tiết phòng trọ...</div>;
  if (!room) return <div className="p-8 text-center text-red-600 font-semibold">Phòng không tồn tại hoặc không có quyền truy cập.</div>;

  return (
    <div className="space-y-6">
      <RoomDetailHeader room={room} onEdit={() => setIsEditOpen(true)} onToggleMaintenance={handleToggleMaintenance} />
      <RoomAssetList
        assets={room.assets}
        onAdd={() => { setEditAsset(null); setIsAssetOpen(true); }}
        onEdit={(a) => { setEditAsset(a); setIsAssetOpen(true); }}
        onArchive={handleArchiveAsset}
      />
      <RoomChargeConfigForm
        roomId={room.id}
        roomChargeConfigs={room.chargeConfigs}
        buildingDefaultChargeConfigs={room.buildingDefaultChargeConfigs}
        onSuccess={fetchDetail}
      />
      <RoomFormDialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSuccess={fetchDetail} buildings={buildings} editRoom={room} />
      <RoomAssetDialog isOpen={isAssetOpen} onClose={() => setIsAssetOpen(false)} onSuccess={fetchDetail} roomId={room.id} editAsset={editAsset} />
    </div>
  );
}
