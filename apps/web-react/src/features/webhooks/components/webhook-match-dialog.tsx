import React, { useState } from "react";
import { Dialog } from "@/shared/components/ui/dialog";
import { Select } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { WebhookEvent } from "../types/webhook.types";
import { formatCurrency } from "@/shared/lib/formatters";
import { ShieldAlert, AlertTriangle } from "lucide-react";

export interface WebhookMatchDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (invoiceId: string) => Promise<void>;
  event: WebhookEvent | null;
  invoices: { id: string; name: string; remainingAmount: number }[];
  loading?: boolean;
  error?: string | null;
}

export const WebhookMatchDialog: React.FC<WebhookMatchDialogProps> = ({
  open,
  onClose,
  onSubmit,
  event,
  invoices,
  loading = false,
  error = null,
}) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0]?.id || "");
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!event) return null;

  const targetInvoice = invoices.find((i) => i.id === selectedInvoiceId) || invoices[0];
  const isOverpayment = targetInvoice && event.amount > targetInvoice.remainingAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const targetId = selectedInvoiceId || invoices[0]?.id;
    if (!targetId) return;

    await onSubmit(targetId);
  };

  const displayError = validationError || error;

  return (
    <Dialog open={open} onClose={onClose} title="Khớp Thủ Công Giao Dịch Webhook Với Hóa Đơn">
      <form onSubmit={handleSubmit} className="space-y-4">
        {displayError && (
          <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        <div className="bg-[#F8F7F4] p-3.5 rounded-xl border border-[#E8E5DF] text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#73766F]">Số tiền giao dịch Webhook:</span>
            <span className="font-mono font-bold text-[#3F594F]">{formatCurrency(event.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#73766F]">Nội dung CK:</span>
            <span className="font-mono font-semibold text-[#A36E35]">{event.content}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Chọn Hóa Đơn Cần Gán (*)</label>
          <Select
            value={selectedInvoiceId}
            onChange={(e) => setSelectedInvoiceId(e.target.value)}
            required
          >
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.name} — Còn nợ: {formatCurrency(inv.remainingAmount)}
              </option>
            ))}
          </Select>
        </div>

        {isOverpayment && (
          <div className="p-3 bg-[#FBF3E8] border border-[#F4E3CD] text-[#A36E35] text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Số tiền webhook ({formatCurrency(event.amount)}) lớn hơn dư nợ hóa đơn ({formatCurrency(targetInvoice.remainingAmount)}). Phần thừa sẽ ghi nhận Overpayment!</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Đang gán..." : "Xác Nhận Khớp Hóa Đơn"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
