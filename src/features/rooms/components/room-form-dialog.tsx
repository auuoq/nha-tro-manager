"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createRoomAction } from "../actions/create-room.action";
import { updateRoomAction } from "../actions/update-room.action";
import { RoomItemDTO } from "../types/room.types";

export interface BuildingOption {
  id: string;
  name: string;
}

export interface RoomFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  buildings: BuildingOption[];
  editRoom?: RoomItemDTO | null;
  defaultBuildingId?: string;
}

export const RoomFormDialog: React.FC<RoomFormDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  buildings,
  editRoom,
  defaultBuildingId,
}) => {
  const [buildingId, setBuildingId] = useState(editRoom?.buildingId || defaultBuildingId || buildings[0]?.id || "");
  const [roomNumber, setRoomNumber] = useState(editRoom?.roomNumber || "");
  const [floor, setFloor] = useState(editRoom?.floor ?? 1);
  const [roomType, setRoomType] = useState(editRoom?.roomType || "Khép Kín");
  const [basePrice, setBasePrice] = useState(editRoom?.basePrice || 3000000);
  const [areaSqM, setAreaSqM] = useState(editRoom?.areaSqM || 25);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (editRoom) {
      const res = await updateRoomAction({
        roomId: editRoom.id,
        roomNumber,
        floor: Number(floor),
        roomType,
        basePrice: Number(basePrice),
        areaSqM: Number(areaSqM),
      });
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Cập nhật phòng thất bại");
        return;
      }
    } else {
      const res = await createRoomAction({
        buildingId,
        roomNumber,
        floor: Number(floor),
        roomType,
        basePrice: Number(basePrice),
        areaSqM: Number(areaSqM),
      });
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Tạo phòng thất bại");
        return;
      }
    }

    onSuccess();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={editRoom ? "Cập Nhật Thông Tin Phòng Trọ" : "Thêm Phòng Trọ Mới"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

        {!editRoom && (
          <Select
            label="Thuộc Tòa Nhà Trọ (*)"
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
            options={buildings.map((b) => ({ label: b.name, value: b.id }))}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input label="Số Phòng (*)" placeholder="P101 / 101" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required />
          <Input label="Tầng Số (*)" type="number" value={floor} onChange={(e) => setFloor(Number(e.target.value))} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Loại Phòng (*)" placeholder="Khép kín / Studio / Mezzanine" value={roomType} onChange={(e) => setRoomType(e.target.value)} required />
          <Input label="Diện Tích (m²) (*)" type="number" value={areaSqM} onChange={(e) => setAreaSqM(Number(e.target.value))} required />
        </div>

        <Input label="Giá Thuê Cố Định / Tháng (VNĐ) (*)" type="number" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} required />

        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {editRoom ? "Lưu Thay Đổi" : "Tạo Phòng Mới"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
