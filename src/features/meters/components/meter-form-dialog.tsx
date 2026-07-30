"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createMeterAction } from "../actions/create-meter.action";
import { MeterType } from "@prisma/client";

export interface OptionItem {
  id: string;
  name: string;
}

export interface MeterFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rooms: OptionItem[];
}

export const MeterFormDialog: React.FC<MeterFormDialogProps> = ({ isOpen, onClose, onSuccess, rooms }) => {
  const [roomId, setRoomId] = useState(rooms[0]?.id || "");
  const [type, setType] = useState<MeterType>(MeterType.ELECTRICITY);
  const [serialNumber, setSerialNumber] = useState("");
  const [initialReading, setInitialReading] = useState(0);
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await createMeterAction({
      roomId,
      type,
      serialNumber,
      initialReading: Number(initialReading),
      installedAt: new Date(),
      note,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Tạo đồng hồ thất bại");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Khởi Tạo Đồng Hồ Điện / Nước Mới" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

        <Select
          label="Chọn Phòng Trọ (*)"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          options={rooms.map((r) => ({ label: r.name, value: r.id }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Loại Đồng Hồ (*)"
            value={type}
            onChange={(e) => setType(e.target.value as MeterType)}
            options={[
              { label: "⚡ Công Tơ Điện (ELECTRICITY)", value: "ELECTRICITY" },
              { label: "💧 Đồng Hồ Nước (WATER)", value: "WATER" },
            ]}
          />
          <Input label="Số Serial / Mã Đồng Hồ (*)" placeholder="DH-2026-001" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} required />
        </div>

        <Input label="Chỉ Số Khởi Tạo Ban Đầu (*)" type="number" value={initialReading} onChange={(e) => setInitialReading(Number(e.target.value))} required />
        <Input label="Ghi Chú" placeholder="Đồng hồ điện tử 1 pha..." value={note} onChange={(e) => setNote(e.target.value)} />

        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Tạo Đồng Hồ
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
