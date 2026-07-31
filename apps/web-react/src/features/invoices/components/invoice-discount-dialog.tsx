import React, { useState } from "react";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { ApplyDiscountInput } from "../types/invoice.types";

export interface InvoiceDiscountDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ApplyDiscountInput) => Promise<void>;
  currentDiscount?: number;
  loading?: boolean;
}

export const InvoiceDiscountDialog: React.FC<InvoiceDiscountDialogProps> = ({
  open,
  onClose,
  onSubmit,
  currentDiscount = 0,
  loading = false,
}) => {
  const [discountAmount, setDiscountAmount] = useState(currentDiscount);
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      discountAmount: Number(discountAmount),
      reason,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Áp Dụng Giảm Giá Hóa Đơn">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Số Tiền Giảm Giá (VNĐ) (*)</label>
          <Input
            type="number"
            min={0}
            value={discountAmount}
            onChange={(e) => setDiscountAmount(Number(e.target.value))}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Lý Do Giảm Giá</label>
          <Input placeholder="VD: Chiết khấu hỗ trợ dãn cách..." value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Đang lưu..." : "Áp Dụng Giảm Giá"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
