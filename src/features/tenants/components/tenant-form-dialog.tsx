"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createTenantAction } from "../actions/create-tenant.action";
import { updateTenantAction } from "../actions/update-tenant.action";
import { TenantItemDTO } from "../types/tenant.types";

export interface TenantFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTenant?: TenantItemDTO | null;
}

export const TenantFormDialog: React.FC<TenantFormDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editTenant,
}) => {
  const [fullName, setFullName] = useState(editTenant?.fullName || "");
  const [phone, setPhone] = useState(editTenant?.phone || "");
  const [gender, setGender] = useState(editTenant?.gender || "Nam");
  const [idCardNumber, setIdCardNumber] = useState(editTenant?.idCardNumber || "");
  const [hometown, setHometown] = useState(editTenant?.hometown || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (editTenant) {
      const res = await updateTenantAction({
        tenantId: editTenant.id,
        fullName,
        phone,
        gender,
        idCardNumber,
        hometown,
      });
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Cập nhật hồ sơ thất bại");
        return;
      }
    } else {
      const res = await createTenantAction({
        fullName,
        phone,
        gender,
        idCardNumber,
        hometown,
      });
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Tạo hồ sơ thất bại");
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
      title={editTenant ? "Cập Nhật Hồ Sơ Khách Thuê" : "Thêm Hồ Sơ Khách Thuê Mới"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

        <Input label="Họ và Tên Khách Thuê (*)" placeholder="Nguyễn Văn B" value={fullName} onChange={(e) => setFullName(e.target.value)} required />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Số Điện Thoại Liên Hệ" placeholder="0977777777" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Select
            label="Giới Tính"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={[
              { label: "Nam", value: "Nam" },
              { label: "Nữ", value: "Nữ" },
              { label: "Khác", value: "Khác" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Số CCCD / CMND" placeholder="001200123456" value={idCardNumber} onChange={(e) => setIdCardNumber(e.target.value)} />
          <Input label="Quê Quán" placeholder="Thái Bình" value={hometown} onChange={(e) => setHometown(e.target.value)} />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {editTenant ? "Lưu Thay Đổi" : "Tạo Hồ Sơ"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
