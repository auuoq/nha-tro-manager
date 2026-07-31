import React, { useState, useEffect } from "react";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Room, RoomCreateInput } from "../types/room.types";

export interface RoomFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RoomCreateInput) => Promise<void>;
  editRoom?: Room | null;
  buildings: { id: string; name: string }[];
  loading?: boolean;
  error?: string | null;
}

export const RoomFormDialog: React.FC<RoomFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editRoom,
  buildings,
  loading = false,
  error = null,
}) => {
  const [buildingId, setBuildingId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState<number>(1);
  const [area, setArea] = useState<number>(25);
  const [basePrice, setBasePrice] = useState<number>(3000000);
  const [maxTenants, setMaxTenants] = useState<number>(2);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editRoom) {
      setBuildingId(editRoom.buildingId || "");
      setRoomNumber(editRoom.roomNumber || "");
      setFloor(editRoom.floor || 1);
      setArea(editRoom.area || 25);
      setBasePrice(editRoom.basePrice || 3000000);
      setMaxTenants(editRoom.maxTenants || 2);
      setDescription(editRoom.description || "");
    } else {
      if (buildings.length > 0 && !buildingId) {
        setBuildingId(buildings[0].id);
      }
      setRoomNumber("");
      setFloor(1);
      setArea(25);
      setBasePrice(3000000);
      setMaxTenants(2);
      setDescription("");
    }
  }, [editRoom, open, buildings, buildingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      buildingId,
      roomNumber,
      floor: Number(floor),
      area: Number(area),
      basePrice: Number(basePrice),
      maxTenants: Number(maxTenants),
      description,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editRoom ? `Cập Nhật Phòng — P.${editRoom.roomNumber}` : "Thêm Phòng Trọ Mới"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Tòa Nhà Trọ (*)</label>
          <Select value={buildingId} onChange={(e) => setBuildingId(e.target.value)} required>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Mã Số Phòng (*)</label>
            <Input placeholder="VD: 101" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Tầng Số (*)</label>
            <Input type="number" min={1} value={floor} onChange={(e) => setFloor(Number(e.target.value))} required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Diện Tích (m²)</label>
            <Input type="number" min={1} value={area} onChange={(e) => setArea(Number(e.target.value))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Giá Thuê (VNĐ)</label>
            <Input type="number" min={0} value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Tối Đa (Người)</label>
            <Input type="number" min={1} value={maxTenants} onChange={(e) => setMaxTenants(Number(e.target.value))} required />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Đang lưu..." : editRoom ? "Lưu Thay Đổi" : "Tạo Phòng Mới"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
