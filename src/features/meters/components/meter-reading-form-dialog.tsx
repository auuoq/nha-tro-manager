"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUploadDropzone } from "@/components/ui/image-upload-dropzone";
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

  const handleFileSelect = (file: File | null, base64?: string) => {
    if (!file || !base64) {
      setFilename(undefined);
      setImageBase64(undefined);
      return;
    }
    setFilename(file.name);
    setImageBase64(base64);
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
        {error && <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium">{error}</div>}

        <div className="grid grid-cols-2 gap-3">
          <Input label="Kỳ Chốt (YYYY-MM) (*)" placeholder="2026-07" value={period} onChange={(e) => setPeriod(e.target.value)} required />
          <Input label="Chỉ Số Kỳ Trước (*)" type="number" value={previousValue} onChange={(e) => setPreviousValue(Number(e.target.value))} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Chỉ Số Kỳ Mới (*)" type="number" value={currentValue} onChange={(e) => setCurrentValue(Number(e.target.value))} required />
          <div className="bg-[#F8F7F4] p-3 rounded-2xl border border-[#E8E5DF] flex flex-col justify-center">
            <span className="text-[11px] text-[#73766F] font-medium block">Lượng Tiêu Thụ Tính Được:</span>
            <span className={`text-base font-bold font-mono ${consumption < 0 ? "text-[#A84646]" : "text-[#3E6148]"}`}>
              {consumption >= 0 ? `+${consumption}` : consumption} {meter.type === "ELECTRICITY" ? "kWh" : "m³"}
            </span>
          </div>
        </div>

        {/* High-End Boutique Image Upload Dropzone */}
        <ImageUploadDropzone
          label="Upload Ảnh Bằng Chứng Chốt Đồng Hồ (Tùy chọn)"
          onFileSelect={handleFileSelect}
        />

        <Input label="Ghi Chú Chốt Số" placeholder="Khách báo chụp ngày..." value={note} onChange={(e) => setNote(e.target.value)} />

        <div className="flex justify-end gap-3 mt-6 pt-3.5 border-t border-[#F2EFE9]">
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
