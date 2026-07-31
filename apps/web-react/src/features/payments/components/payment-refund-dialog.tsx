import React, { useState } from "react";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { formatCurrency } from "@/shared/lib/formatters";
import { RefundPaymentInput } from "../types/payment.types";
import { ShieldAlert } from "lucide-react";

export interface PaymentRefundDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RefundPaymentInput) => Promise<void>;
  paymentAmount: number;
  alreadyRefundedAmount: number;
  loading?: boolean;
  error?: string | null;
}

export const PaymentRefundDialog: React.FC<PaymentRefundDialogProps> = ({
  open,
  onClose,
  onSubmit,
  paymentAmount,
  alreadyRefundedAmount,
  loading = false,
  error = null,
}) => {
  const maxRefundable = Math.max(0, paymentAmount - alreadyRefundedAmount);
  const [amount, setAmount] = useState<number>(maxRefundable);
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (amount <= 0) {
      setValidationError("Số tiền hoàn trả phải lớn hơn 0");
      return;
    }
    if (amount > maxRefundable) {
      setValidationError(`Số tiền hoàn trả không được vượt quá số tiền khả dụng (${formatCurrency(maxRefundable)})`);
      return;
    }

    await onSubmit({
      amount: Number(amount),
      reason: reason || undefined,
    });
    onClose();
  };

  const displayError = validationError || error;
  const netAfterRefund = paymentAmount - alreadyRefundedAmount - (Number(amount) || 0);

  return (
    <Dialog open={open} onClose={onClose} title="Hoàn Tiền Cho Khách Thuê (Refund Payment)">
      <form onSubmit={handleSubmit} className="space-y-4">
        {displayError && (
          <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        <div className="bg-[#F8F7F4] p-3.5 rounded-xl border border-[#E8E5DF] text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#73766F]">Tổng tiền thanh toán:</span>
            <span className="font-mono font-bold text-[#252724]">{formatCurrency(paymentAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#73766F]">Đã hoàn trước đây:</span>
            <span className="font-mono font-bold text-[#A84646]">-{formatCurrency(alreadyRefundedAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-[#E8E5DF] pt-1 text-[#3F594F] font-semibold">
            <span>Khả dụng hoàn tiền:</span>
            <span className="font-mono font-bold">{formatCurrency(maxRefundable)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Số Tiền Hoàn Trả (VNĐ) (*)</label>
          <Input
            type="number"
            min={1}
            max={maxRefundable}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
          <p className="text-[11px] text-[#73766F] mt-1">
            Số tiền thực nhận còn lại sau hoàn: <strong className="text-[#252724]">{formatCurrency(netAfterRefund)}</strong>
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Lý Do Hoàn Tiền</label>
          <Input placeholder="VD: Khách trả phòng sớm, hoàn cọc..." value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Đang xử lý..." : "Xác Nhận Hoàn Tiền"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
