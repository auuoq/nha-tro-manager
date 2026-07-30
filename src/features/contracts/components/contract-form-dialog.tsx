"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createContractAction } from "../actions/create-contract.action";
import { updateContractAction } from "../actions/update-contract.action";
import { ContractDetailDTO } from "../types/contract.types";

export interface OptionItem {
  id: string;
  name: string;
}

export interface ContractFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rooms: OptionItem[];
  tenants: OptionItem[];
  editContract?: ContractDetailDTO | null;
  defaultRoomId?: string;
}

export const ContractFormDialog: React.FC<ContractFormDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  rooms,
  tenants,
  editContract,
  defaultRoomId,
}) => {
  const [roomId, setRoomId] = useState(editContract?.roomId || defaultRoomId || rooms[0]?.id || "");
  const [primaryTenantId, setPrimaryTenantId] = useState(tenants[0]?.id || "");
  const [startDateStr, setStartDateStr] = useState(
    editContract ? new Date(editContract.startDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [endDateStr, setEndDateStr] = useState(
    editContract
      ? new Date(editContract.endDate).toISOString().slice(0, 10)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [monthlyPrice, setMonthlyPrice] = useState(editContract?.monthlyPrice || 3500000);
  const [depositAmount, setDepositAmount] = useState(editContract?.depositAmount || 3500000);
  const [billingDay, setBillingDay] = useState(editContract?.billingDay || 5);
  const [notes, setNotes] = useState(editContract?.notes || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (editContract) {
      const res = await updateContractAction({
        contractId: editContract.id,
        startDate,
        endDate,
        monthlyPrice: Number(monthlyPrice),
        depositAmount: Number(depositAmount),
        billingDay: Number(billingDay),
        notes,
      });
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Cập nhật hợp đồng thất bại");
        return;
      }
    } else {
      const res = await createContractAction({
        roomId,
        primaryTenantId,
        startDate,
        endDate,
        monthlyPrice: Number(monthlyPrice),
        depositAmount: Number(depositAmount),
        billingDay: Number(billingDay),
        notes,
      });
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Tạo hợp đồng nháp thất bại");
        return;
      }
    }

    onSuccess();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={editContract ? `Sửa Hợp Đồng ${editContract.contractCode}` : "Tạo Hợp Đồng Thuê Trọ Mới (DRAFT)"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

        {!editContract && (
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Chọn Phòng Trọ (*)"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              options={rooms.map((r) => ({ label: r.name, value: r.id }))}
            />
            <Select
              label="Khách Đại Diện PRIMARY (*)"
              value={primaryTenantId}
              onChange={(e) => setPrimaryTenantId(e.target.value)}
              options={tenants.map((t) => ({ label: t.name, value: t.id }))}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input label="Ngày Bắt Đầu Thuê (*)" type="date" value={startDateStr} onChange={(e) => setStartDateStr(e.target.value)} required />
          <Input label="Ngày Kết Thúc Hợp Đồng (*)" type="date" value={endDateStr} onChange={(e) => setEndDateStr(e.target.value)} required />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input label="Giá Thuê / Tháng (VNĐ) (*)" type="number" value={monthlyPrice} onChange={(e) => setMonthlyPrice(Number(e.target.value))} required />
          <Input label="Tiền Đặt Cọc (VNĐ) (*)" type="number" value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))} required />
          <Input label="Ngày Chốt Tiền Phòng (*)" type="number" min={1} max={28} value={billingDay} onChange={(e) => setBillingDay(Number(e.target.value))} required />
        </div>

        <Input label="Ghi Chú Hợp Đồng" placeholder="Ví dụ: Đã nhận tiền cọc chuyển khoản ngày..." value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {editContract ? "Lưu Thay Đổi" : "Khởi Tạo Hợp Đồng DRAFT"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
