import React, { useState, useEffect } from "react";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Contract, ContractCreateInput, ContractUpdateInput } from "../types/contract.types";

export interface OptionItem {
  id: string;
  name: string;
}

export interface ContractFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmitCreate?: (data: ContractCreateInput) => Promise<void>;
  onSubmitUpdate?: (data: ContractUpdateInput) => Promise<void>;
  rooms: OptionItem[];
  tenants: OptionItem[];
  editContract?: Contract | null;
  defaultRoomId?: string;
  loading?: boolean;
  error?: string | null;
}

export const ContractFormDialog: React.FC<ContractFormDialogProps> = ({
  open,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  rooms,
  tenants,
  editContract,
  defaultRoomId,
  loading = false,
  error = null,
}) => {
  const [roomId, setRoomId] = useState("");
  const [primaryTenantId, setPrimaryTenantId] = useState("");
  const [startDateStr, setStartDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [endDateStr, setEndDateStr] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [monthlyPrice, setMonthlyPrice] = useState(3500000);
  const [depositAmount, setDepositAmount] = useState(3500000);
  const [billingDay, setBillingDay] = useState(5);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editContract) {
      setStartDateStr(new Date(editContract.startDate).toISOString().slice(0, 10));
      setEndDateStr(new Date(editContract.endDate).toISOString().slice(0, 10));
      setMonthlyPrice(editContract.monthlyPrice || 3500000);
      setDepositAmount(editContract.depositAmount || 3500000);
      setBillingDay(editContract.billingDay || 5);
      setNotes(editContract.notes || "");
    } else {
      if (rooms.length > 0) setRoomId(defaultRoomId || rooms[0].id);
      if (tenants.length > 0) setPrimaryTenantId(tenants[0].id);
      setStartDateStr(new Date().toISOString().slice(0, 10));
      setEndDateStr(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
      setMonthlyPrice(3500000);
      setDepositAmount(3500000);
      setBillingDay(5);
      setNotes("");
    }
  }, [editContract, open, rooms, tenants, defaultRoomId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editContract && onSubmitUpdate) {
      await onSubmitUpdate({
        startDate: startDateStr,
        endDate: endDateStr,
        monthlyPrice: Number(monthlyPrice),
        depositAmount: Number(depositAmount),
        billingDay: Number(billingDay),
        notes,
      });
    } else if (onSubmitCreate) {
      await onSubmitCreate({
        roomId,
        primaryTenantId,
        startDate: startDateStr,
        endDate: endDateStr,
        monthlyPrice: Number(monthlyPrice),
        depositAmount: Number(depositAmount),
        billingDay: Number(billingDay),
        notes,
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editContract ? `Sửa Hợp Đồng ${editContract.contractCode}` : "Tạo Hợp Đồng Thuê Trọ Mới (DRAFT)"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {!editContract && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#252724] mb-1">Chọn Phòng Trọ (*)</label>
              <Select value={roomId} onChange={(e) => setRoomId(e.target.value)} required>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#252724] mb-1">Khách Đại Diện PRIMARY (*)</label>
              <Select value={primaryTenantId} onChange={(e) => setPrimaryTenantId(e.target.value)} required>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Ngày Bắt Đầu Thuê (*)</label>
            <Input type="date" value={startDateStr} onChange={(e) => setStartDateStr(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Ngày Kết Thúc Hợp Đồng (*)</label>
            <Input type="date" value={endDateStr} onChange={(e) => setEndDateStr(e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Giá Thuê / Tháng (VNĐ)</label>
            <Input type="number" min={0} value={monthlyPrice} onChange={(e) => setMonthlyPrice(Number(e.target.value))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Tiền Đặt Cọc (VNĐ)</label>
            <Input type="number" min={0} value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Ngày Chốt Tiền Phòng</label>
            <Input type="number" min={1} max={28} value={billingDay} onChange={(e) => setBillingDay(Number(e.target.value))} required />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Ghi Chú Hợp Đồng</label>
          <Input placeholder="Ví dụ: Đã nhận tiền cọc chuyển khoản ngày..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Đang lưu..." : editContract ? "Lưu Thay Đổi" : "Khởi Tạo Hợp Đồng DRAFT"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
