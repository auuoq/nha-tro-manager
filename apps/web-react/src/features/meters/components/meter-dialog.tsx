import React, { useState } from "react";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { MeterType, CreateMeterInput } from "../types/meter.types";

export interface MeterFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMeterInput) => Promise<void>;
  rooms: { id: string; name: string }[];
  loading?: boolean;
  error?: string | null;
}

export const MeterFormDialog: React.FC<MeterFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  rooms,
  loading = false,
  error = null,
}) => {
  const [roomId, setRoomId] = useState(rooms[0]?.id || "");
  const [type, setType] = useState<MeterType>("ELECTRICITY");
  const [serialNumber, setSerialNumber] = useState("");
  const [initialReading, setInitialReading] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      roomId: roomId || rooms[0]?.id,
      type,
      serialNumber,
      initialReading: Number(initialReading),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title="Thêm Đồng Hồ Đo Điện / Nước Mới">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Chọn Phòng Trọ (*)</label>
          <Select value={roomId} onChange={(e) => setRoomId(e.target.value)} required>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Loại Đồng Hồ</label>
            <Select value={type} onChange={(e) => setType(e.target.value as MeterType)}>
              <option value="ELECTRICITY">Công tơ điện</option>
              <option value="WATER">Đồng hồ nước</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Mã Serial / Số Hiệu (*)</label>
            <Input placeholder="VD: E-101-2026" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Chỉ Số Ban Đầu (Initial Reading)</label>
          <Input type="number" min={0} value={initialReading} onChange={(e) => setInitialReading(Number(e.target.value))} required />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Đang tạo..." : "Thêm Đồng Hồ"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
