"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { refundPaymentAction } from "../actions/refund-payment.action";

export interface RefundPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paymentId: string;
  paymentCode: string;
  maxRefundable: number;
}

export const RefundPaymentDialog: React.FC<RefundPaymentDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  paymentId,
  paymentCode,
  maxRefundable,
}) => {
  const [refundAmount, setRefundAmount] = useState(maxRefundable.toString());
  const [refundReason, setRefundReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Số tiền hoàn trả phải lớn hơn 0");
      return;
    }
    if (amount > maxRefundable) {
      setError(`Số tiền hoàn không được vượt quá ${maxRefundable.toLocaleString("vi-VN")}đ`);
      return;
    }

    setLoading(true);
    setError("");

    const res = await refundPaymentAction({
      paymentId,
      refundAmount: amount,
      refundReason: refundReason.trim(),
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Hoàn tiền thất bại");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Hoàn Tiền Giao Dịch - ${paymentCode}`} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

        <p className="text-xs text-slate-500">
          Số tiền thanh toán tối đa có thể hoàn: <span className="font-bold text-slate-900">{maxRefundable.toLocaleString("vi-VN")} VNĐ</span>.
        </p>

        <Input
          label="Số Tiền Hoàn Trả (VNĐ) (*)"
          type="number"
          value={refundAmount}
          onChange={(e) => setRefundAmount(e.target.value)}
          required
          max={maxRefundable}
          min="1"
        />

        <Input
          label="Lý Do Hoàn Tiền (*)"
          placeholder="Chuyển nhầm / tính thừa tiền nước..."
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
          required
        />

        <div className="flex justify-end gap-3 pt-3 border-t">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Hủy Bỏ</Button>
          <Button type="submit" variant="danger" isLoading={loading}>🔄 Xác Nhận Hoàn Tiền</Button>
        </div>
      </form>
    </Dialog>
  );
};
