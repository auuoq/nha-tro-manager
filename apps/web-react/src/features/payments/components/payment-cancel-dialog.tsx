import React, { useState } from "react";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { AlertTriangle } from "lucide-react";

export interface PaymentCancelDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  loading?: boolean;
}

export const PaymentCancelDialog: React.FC<PaymentCancelDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    await onSubmit(reason);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Hủy Giao Dịch Thanh Toán">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-[#FBF3E8] border border-[#F4E3CD] text-[#A36E35] text-xs rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Xác Nhận Hủy Thanh Toán</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90 pl-1">
            <li>Giao dịch không bị xóa mà chuyển sang trạng thái CANCELLED.</li>
            <li>Hóa đơn liên quan sẽ được tính toán lại dư nợ tự động.</li>
          </ul>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Lý Do Hủy Giao Dịch (*)</label>
          <Input
            placeholder="VD: Nhập nhầm số tiền, giao dịch lỗi..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Quay Lại
          </Button>
          <Button type="submit" variant="danger" disabled={loading}>
            {loading ? "Đang hủy..." : "Xác Nhận Hủy"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
