"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentMethod } from "@prisma/client";
import { recordManualPaymentAction } from "../actions/record-manual-payment.action";

export interface ManualPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoiceId: string;
  invoiceCode: string;
  defaultAmount?: number;
}

export const ManualPaymentDialog: React.FC<ManualPaymentDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  invoiceId,
  invoiceCode,
  defaultAmount = 0,
}) => {
  const [amount, setAmount] = useState(defaultAmount.toString());
  const [method, setMethod] = useState<"CASH" | "BANK_TRANSFER" | "OTHER">(PaymentMethod.CASH as "CASH");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Số tiền phải lớn hơn 0");
      return;
    }

    setLoading(true);
    setError("");

    const res = await recordManualPaymentAction({
      invoiceId,
      amount: numericAmount,
      method,
      transactionRef: transactionRef.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Ghi nhận thanh toán thất bại");
      return;
    }

    if (res.data?.overpaymentAmount && res.data.overpaymentAmount > 0) {
      alert(`⚠️ Cảnh báo: Số tiền ghi nhận (${numericAmount.toLocaleString("vi-VN")}đ) vượt quá dư nợ hóa đơn. Tiền thừa: ${res.data.overpaymentAmount.toLocaleString("vi-VN")}đ.`);
    }

    onSuccess();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Ghi Nhận Thanh Toán Thủ Công - ${invoiceCode}`} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Phương Thức Thanh Toán (*)</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as "CASH" | "BANK_TRANSFER" | "OTHER")}
            className="w-full h-9 rounded-md border border-slate-300 px-3 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-950"
          >
            <option value={PaymentMethod.CASH}>💵 Tiền mặt (CASH)</option>
            <option value={PaymentMethod.BANK_TRANSFER}>🏦 Chuyển khoản ngân hàng thủ công (BANK_TRANSFER)</option>
            <option value={PaymentMethod.OTHER}>💳 Khác (OTHER)</option>
          </select>
        </div>

        <Input
          label="Số Tiền Thanh Toán (VNĐ) (*)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="1"
        />

        <Input
          label="Mã Giao Dịch / Mã Tham Chiếu Ngân Hàng"
          placeholder="FT12345678..."
          value={transactionRef}
          onChange={(e) => setTransactionRef(e.target.value)}
        />

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Ghi Chú</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Khách đưa tiền mặt trực tiếp..."
            className="w-full rounded-md border border-slate-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Hủy Bỏ</Button>
          <Button type="submit" variant="primary" isLoading={loading}>💰 Xác Nhận Ghi Nhận Thanh Toán</Button>
        </div>
      </form>
    </Dialog>
  );
};
