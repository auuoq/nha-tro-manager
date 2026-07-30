"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addManualInvoiceItemAction } from "../actions/add-manual-invoice-item.action";

export interface ManualInvoiceItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoiceId: string;
}

export const ManualInvoiceItemDialog: React.FC<ManualInvoiceItemDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  invoiceId,
}) => {
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("khoản");
  const [unitPrice, setUnitPrice] = useState(100000);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await addManualInvoiceItemAction({
      invoiceId,
      description,
      quantity: Number(quantity),
      unit,
      unitPrice: Number(unitPrice),
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Thêm khoản thu thất bại");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Thêm Khoản Phụ Thu Thủ Công (Hóa Đơn DRAFT)" maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

        <Input label="Mô Tả Khoản Phụ Thu (*)" placeholder="Tiền vệ sinh máy lạnh / Sửa vòi nước..." value={description} onChange={(e) => setDescription(e.target.value)} required />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Số Lượng (*)" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
          <Input label="Đơn Vị Tính" placeholder="lần / khoản" value={unit} onChange={(e) => setUnit(e.target.value)} />
        </div>

        <Input label="Đơn Giá (VNĐ) (*)" type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} required />

        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Thêm Khoản Thu
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
