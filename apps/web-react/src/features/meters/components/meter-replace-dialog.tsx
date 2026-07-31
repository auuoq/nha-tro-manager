import React, { useState } from "react";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { ReplaceMeterInput } from "../types/meter.types";
import { AlertTriangle } from "lucide-react";

export interface MeterReplaceDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ReplaceMeterInput) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const MeterReplaceDialog: React.FC<MeterReplaceDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  error = null,
}) => {
  const [newSerialNumber, setNewSerialNumber] = useState("");
  const [newInitialReading, setNewInitialReading] = useState(0);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      newSerialNumber,
      newInitialReading: Number(newInitialReading),
      reason,
      note,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title="Thay Thế Đồng Hồ Mới">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Warning Alert Banner */}
        <div className="p-3.5 bg-[#FBF3E8] border border-[#F4E3CD] text-[#A36E35] text-xs rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Cảnh Báo Thay Thế Đồng Hồ</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90 pl-1">
            <li>Đồng hồ cũ sẽ bị vô hiệu hóa (dỡ bỏ).</li>
            <li>Lịch sử chỉ số của đồng hồ cũ vẫn được bảo lưu hoàn toàn.</li>
            <li>Đồng hồ mới sẽ bắt đầu tính từ chỉ số ban đầu mới nhập.</li>
          </ul>
        </div>

        {error && (
          <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Mã Serial Đồng Hồ Mới (*)</label>
          <Input placeholder="VD: E-101-NEW-2026" value={newSerialNumber} onChange={(e) => setNewSerialNumber(e.target.value)} required />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Chỉ Số Ban Đầu Đồng Hồ Mới (*)</label>
          <Input type="number" min={0} value={newInitialReading} onChange={(e) => setNewInitialReading(Number(e.target.value))} required />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Lý Do Thay Thế</label>
          <Input placeholder="VD: Hỏng hóc, sai lệch chỉ số..." value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Ghi Chú Chi Tiết</label>
          <Input placeholder="Ghi chú thêm..." value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Đang thay thế..." : "Xác Nhận Thay Thế"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
