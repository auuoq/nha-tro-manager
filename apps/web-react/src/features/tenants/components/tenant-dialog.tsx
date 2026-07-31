import React, { useState, useEffect } from "react";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Tenant, TenantCreateInput } from "../types/tenant.types";

export interface TenantFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TenantCreateInput) => Promise<void>;
  editTenant?: Tenant | null;
  loading?: boolean;
  error?: string | null;
}

export const TenantFormDialog: React.FC<TenantFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editTenant,
  loading = false,
  error = null,
}) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Nam");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [hometown, setHometown] = useState("");

  useEffect(() => {
    if (editTenant) {
      setFullName(editTenant.fullName || "");
      setPhone(editTenant.phone || "");
      setGender(editTenant.gender || "Nam");
      setIdCardNumber(editTenant.idCardNumber || "");
      setHometown(editTenant.hometown || "");
    } else {
      setFullName("");
      setPhone("");
      setGender("Nam");
      setIdCardNumber("");
      setHometown("");
    }
  }, [editTenant, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ fullName, phone, gender, idCardNumber, hometown });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editTenant ? `Cập Nhật Hồ Sơ — ${editTenant.fullName}` : "Thêm Hồ Sơ Khách Thuê Mới"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Họ và Tên Khách Thuê (*)</label>
          <Input placeholder="Nguyễn Văn B" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Số Điện Thoại</label>
            <Input type="tel" placeholder="0977777777" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Giới Tính</label>
            <Select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Số CCCD / CMND</label>
            <Input placeholder="001200123456" value={idCardNumber} onChange={(e) => setIdCardNumber(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Quê Quán</label>
            <Input placeholder="Thái Bình" value={hometown} onChange={(e) => setHometown(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Đang lưu..." : editTenant ? "Lưu Thay Đổi" : "Tạo Hồ Sơ"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
