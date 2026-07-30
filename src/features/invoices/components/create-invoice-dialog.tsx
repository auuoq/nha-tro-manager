"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createDraftInvoiceAction } from "../actions/create-draft-invoice.action";

export interface OptionItem {
  id: string;
  name: string;
}

export interface CreateInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contracts: OptionItem[];
}

export const CreateInvoiceDialog: React.FC<CreateInvoiceDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  contracts,
}) => {
  const defaultPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [contractId, setContractId] = useState(contracts[0]?.id || "");
  const [billingPeriod, setBillingPeriod] = useState(defaultPeriod);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await createDraftInvoiceAction({ contractId, billingPeriod });
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Tạo hóa đơn DRAFT thất bại");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Khởi Tạo Hóa Đơn DRAFT Kỳ Mới" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

        <Select
          label="Chọn Hợp Đồng Thuê Trọ ACTIVE (*)"
          value={contractId}
          onChange={(e) => setContractId(e.target.value)}
          options={contracts.map((c) => ({ label: c.name, value: c.id }))}
        />

        <Input label="Kỳ Hóa Đơn (YYYY-MM) (*)" placeholder="2026-07" value={billingPeriod} onChange={(e) => setBillingPeriod(e.target.value)} required />

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">ℹ️ Cơ chế tự động tính tiền:</p>
          <p>- Hệ thống tự động snapshot tiền phòng, điện, nước, wifi, rác, gửi xe theo thứ tự ưu tiên: Hợp đồng ➔ Phòng ➔ Tòa nhà.</p>
          <p>- Chỉ số điện nước tự động tính tổng sản lượng chốt trong kỳ YYYY-MM.</p>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Khởi Tạo Hóa Đơn DRAFT
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
