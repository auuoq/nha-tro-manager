import React, { useState } from "react";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { CreateManualPaymentInput } from "../types/payment.types";
import { ShieldAlert } from "lucide-react";

export interface ManualPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateManualPaymentInput) => Promise<void>;
  invoices: { id: string; name: string }[];
  loading?: boolean;
  error?: string | null;
}

export const ManualPaymentDialog: React.FC<ManualPaymentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  invoices,
  loading = false,
  error = null,
}) => {
  const [invoiceId, setInvoiceId] = useState(invoices[0]?.id || "");
  const [amount, setAmount] = useState<number>(1000000);
  const [method, setMethod] = useState<"CASH" | "BANK_TRANSFER" | "OTHER">("BANK_TRANSFER");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [transactionRef, setTransactionRef] = useState("");
  const [note, setNote] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (amount <= 0) {
      setValidationError("Số tiền thanh toán phải lớn hơn 0");
      return;
    }

    await onSubmit({
      invoiceId: invoiceId || invoices[0]?.id,
      amount: Number(amount),
      method,
      paidAt,
      transactionRef: transactionRef || undefined,
      note: note || undefined,
    });
  };

  const displayError = validationError || error;

  return (
    <Dialog open={open} onClose={onClose} title="Ghi Nhận Thanh Toán Thủ Công (Manual Payment)">
      <form onSubmit={handleSubmit} className="space-y-4">
        {displayError && (
          <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Chọn Hóa Đơn Thanh Toán (*)</label>
          <Select value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} required>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Số Tiền Đã Thu (VNĐ) (*)</label>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Phương Thức Thanh Toán</label>
            <Select value={method} onChange={(e) => setMethod(e.target.value as any)}>
              <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
              <option value="CASH">Tiền mặt</option>
              <option value="OTHER">Phương thức khác</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Ngày Thu Tiền (*)</label>
            <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Mã Giao Dịch / Tra Cứu</label>
            <Input placeholder="VD: FT260100123" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Ghi Chú Giao Dịch</label>
          <Input placeholder="Ghi chú thêm..." value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Đang ghi nhận..." : "Tạo Thanh Toán"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
