import React, { useState } from "react";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { CreateMeterReadingInput } from "../types/meter.types";
import { ShieldAlert } from "lucide-react";

export interface MeterReadingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMeterReadingInput) => Promise<void>;
  meterType?: string;
  loading?: boolean;
  error?: string | null;
}

export const MeterReadingDialog: React.FC<MeterReadingDialogProps> = ({
  open,
  onClose,
  onSubmit,
  meterType = "ELECTRICITY",
  loading = false,
  error = null,
}) => {
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (currentValue < 0) {
      setValidationError("Chỉ số mới phải >= 0");
      return;
    }

    await onSubmit({
      period,
      currentValue: Number(currentValue),
      note: note || undefined,
      imageUrl: imageUrl || undefined,
    });
  };

  const displayError = validationError || error;

  return (
    <Dialog open={open} onClose={onClose} title="Chốt Chỉ Số Đồng Hồ (Meter Reading)">
      <form onSubmit={handleSubmit} className="space-y-4">
        {displayError && (
          <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Kỳ Chốt Sổ (YYYY-MM) (*)</label>
            <Input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">
              Chỉ Số Mới Chốt ({meterType === "ELECTRICITY" ? "kWh" : "m³"}) (*)
            </label>
            <Input
              type="number"
              min={0}
              step="any"
              value={currentValue}
              onChange={(e) => setCurrentValue(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Ghi Chú</label>
          <Input placeholder="Ghi chú chốt chỉ số..." value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Đường Dẫn Ảnh Bằng Chứng (URL)</label>
          <Input placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu Chỉ Số"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
