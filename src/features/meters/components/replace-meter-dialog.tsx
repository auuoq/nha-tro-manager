"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { replaceMeterAction } from "../actions/replace-meter.action";
import { MeterDTO } from "../types/meter.types";

export interface ReplaceMeterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  meter: MeterDTO;
}

export const ReplaceMeterDialog: React.FC<ReplaceMeterDialogProps> = ({ isOpen, onClose, onSuccess, meter }) => {
  const [newSerialNumber, setNewSerialNumber] = useState("");
  const [newInitialReading, setNewInitialReading] = useState(0);
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await replaceMeterAction({
      oldMeterId: meter.id,
      newSerialNumber,
      newInitialReading: Number(newInitialReading),
      reason,
      replacedAt: new Date(),
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Thay đồng hồ thất bại");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Thay Mới Đồng Hồ (${meter.type === "ELECTRICITY" ? "Điện" : "Nước"}) - Phòng ${meter.roomNumber}`} maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg space-y-1">
          <p className="font-bold">⚠️ Chú ý Thay Đồng Hồ:</p>
          <p>Đồng hồ cũ ({meter.serialNumber}) sẽ bị ngừng hoạt động và gán ngày tháo dỡ. Đồng hồ mới sẽ lập tức được kích hoạt.</p>
        </div>

        <Input label="Số Serial Đồng Hồ Mới (*)" placeholder="DH-2026-NEW" value={newSerialNumber} onChange={(e) => setNewSerialNumber(e.target.value)} required />
        <Input label="Chỉ Số Ban Đầu Của Đồng Hồ Mới (*)" type="number" value={newInitialReading} onChange={(e) => setNewInitialReading(Number(e.target.value))} required />
        <Input label="Lý Do Thay Đồng Hồ (*)" placeholder="Đồng hồ cũ hỏng / Cháy cuộn dây / Kiểm định định kỳ..." value={reason} onChange={(e) => setReason(e.target.value)} required />

        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Xác Nhận Thay Đồng Hồ
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
