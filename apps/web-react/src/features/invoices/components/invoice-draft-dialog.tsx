import React, { useState } from "react";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { CreateDraftInvoiceInput } from "../types/invoice.types";
import { ShieldAlert } from "lucide-react";

export interface InvoiceDraftDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDraftInvoiceInput) => Promise<void>;
  contracts: { id: string; name: string }[];
  loading?: boolean;
  error?: string | null;
}

export const InvoiceDraftDialog: React.FC<InvoiceDraftDialogProps> = ({
  open,
  onClose,
  onSubmit,
  contracts,
  loading = false,
  error = null,
}) => {
  const [contractId, setContractId] = useState(contracts[0]?.id || "");
  const [billingPeriod, setBillingPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [cutoffDate, setCutoffDate] = useState(new Date().toISOString().slice(0, 10));
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    await onSubmit({
      contractId: contractId || contracts[0]?.id,
      billingPeriod,
      dueDate,
      cutoffDate,
    });
  };

  const displayError = validationError || error;

  return (
    <Dialog open={open} onClose={onClose} title="Tạo Hóa Đơn Nháp Mới (DRAFT)">
      <form onSubmit={handleSubmit} className="space-y-4">
        {displayError && (
          <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Chọn Hợp Đồng Thuê Trọ (*)</label>
          <Select value={contractId} onChange={(e) => setContractId(e.target.value)} required>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Kỳ Hóa Đơn (YYYY-MM) (*)</label>
          <Input type="month" value={billingPeriod} onChange={(e) => setBillingPeriod(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Hạn Thanh Toán (*)</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Ngày Chốt Số (*)</label>
            <Input type="date" value={cutoffDate} onChange={(e) => setCutoffDate(e.target.value)} required />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Đang tính toán..." : "Tạo Hóa Đơn DRAFT"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
