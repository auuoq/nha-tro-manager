"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { recordMeterReadingAction } from "../actions/record-meter-reading.action";
import { MeterDTO } from "../types/meter.types";

export interface MeterReadingFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  meter: MeterDTO;
}

export const MeterReadingFormDialog: React.FC<MeterReadingFormDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  meter,
}) => {
  const defaultPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
  const defaultPrev = meter.lastReadingValue !== null ? meter.lastReadingValue : meter.initialReading;

  const [period, setPeriod] = useState(defaultPeriod);
  const [previousValue, setPreviousValue] = useState(defaultPrev);
  const [currentValue, setCurrentValue] = useState(defaultPrev);
  const [note, setNote] = useState("");
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [filename, setFilename] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await recordMeterReadingAction({
      meterId: meter.id,
      period,
      previousValue: Number(previousValue),
      currentValue: Number(currentValue),
      note,
      imageBase64,
      originalFilename: filename,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Ghi nhận chỉ số thất bại");
      return;
    }

    onSuccess();
    onClose();
  };

  const consumption = Number(currentValue) - Number(previousValue);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Chốt Chỉ Số ${meter.type === "ELECTRICITY" ? "Điện" : "Nước"} Kỳ ${period} - Phòng ${meter.roomNumber}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

        <div className="grid grid-cols-2 gap-3">
          <Input label="Kỳ Chốt (YYYY-MM) (*)" placeholder="2026-07" value={period} onChange={(e) => setPeriod(e.target.value)} required />
          <Input label="Chỉ Số Kỳ Trước (*)" type="number" value={previousValue} onChange={(e) => setPreviousValue(Number(e.target.value))} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Chỉ Số Kỳ Mới (*)" type="number" value={currentValue} onChange={(e) => setCurrentValue(Number(e.target.value))} required />
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-center">
            <span className="text-xs text-slate-500 block">Lượng Tiêu Thụ Tính Được:</span>
            <span className={`text-base font-bold font-mono ${consumption < 0 ? "text-red-600" : "text-emerald-600"}`}>
              {consumption >= 0 ? `+${consumption}` : consumption} {meter.type === "ELECTRICITY" ? "kWh" : "m³"}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Ảnh Bằng Chứng Chốt Đồng Hồ (Tùy chọn)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="text-xs text-slate-500 block w-full" />
        </div>

        <Input label="Ghi Chú Chốt Số" placeholder="Khách báo chụp ngày..." value={note} onChange={(e) => setNote(e.target.value)} />

        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={loading} disabled={consumption < 0}>
            Lưu Chỉ Số Kỳ Này
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
