import React, { useState, useEffect } from "react";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Building, BuildingCreateInput } from "../types/building.types";
import { Landmark, ChevronDown } from "lucide-react";
import { POPULAR_VIETNAM_BANKS } from "../constants/banks";

export interface BuildingFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BuildingCreateInput) => Promise<void>;
  editBuilding?: Building | null;
  loading?: boolean;
  error?: string | null;
}

export const BuildingFormDialog: React.FC<BuildingFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editBuilding,
  loading = false,
  error = null,
}) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [wifiName, setWifiName] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [rules, setRules] = useState("");

  useEffect(() => {
    if (editBuilding) {
      setName(editBuilding.name || "");
      setAddress(editBuilding.address || "");
      setBankName(editBuilding.bankName || "");
      setBankAccount(editBuilding.bankAccount || "");
      setAccountHolder(editBuilding.accountHolder || "");
      setWifiName(editBuilding.wifiName || "");
      setWifiPassword(editBuilding.wifiPassword || "");
      setRules(editBuilding.rules || "");
    } else {
      setName("");
      setAddress("");
      setBankName("");
      setBankAccount("");
      setAccountHolder("");
      setWifiName("");
      setWifiPassword("");
      setRules("");
    }
  }, [editBuilding, open]);

  const handleBankSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBin = e.target.value;
    const found = POPULAR_VIETNAM_BANKS.find((b) => b.bin === selectedBin);
    if (found) {
      setBankName(found.shortName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      address,
      bankName,
      bankAccount,
      accountHolder,
      wifiName,
      wifiPassword,
      rules,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editBuilding ? `Cập Nhật — ${editBuilding.name}` : "Thêm Tòa Nhà Trọ Mới"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <span className="text-xs font-semibold text-[#73766F] uppercase tracking-wider block">1. Thông Tin Tòa Nhà</span>
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-[#252724] mb-1">Tên Tòa Nhà (*)</label>
              <Input placeholder="VD: Tòa Yên Hòa 1" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#252724] mb-1">Địa Chỉ (*)</label>
              <Input placeholder="VD: Cầu Giấy, Hà Nội" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-[#F2EFE9]">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#3F594F]" />
            <span className="text-xs font-semibold text-[#252724] uppercase tracking-wider">2. Tài Khoản Ngân Hàng VietQR</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Ngân Hàng</label>
            <div className="relative">
              <select
                onChange={handleBankSelectChange}
                className="w-full h-10 px-3.5 bg-white border border-[#E8E5DF] rounded-xl text-xs text-[#252724] appearance-none pr-10 cursor-pointer"
              >
                <option value="">-- Chọn Ngân hàng --</option>
                {POPULAR_VIETNAM_BANKS.map((b) => (
                  <option key={b.bin} value={b.bin}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#73766F] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#252724] mb-1">Số Tài Khoản</label>
              <Input placeholder="123456789" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#252724] mb-1">Chủ Tài Khoản</label>
              <Input placeholder="NGUYEN VAN A" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-[#F2EFE9]">
          <span className="text-xs font-semibold text-[#73766F] uppercase tracking-wider block">3. Wifi & Nội Quy</span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#252724] mb-1">Tên Wifi</label>
              <Input placeholder="YenHoa_Wifi" value={wifiName} onChange={(e) => setWifiName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#252724] mb-1">Mật khẩu Wifi</label>
              <Input placeholder="12345678" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Nội Quy Tóm Tắt</label>
            <Textarea placeholder="Nội quy tòa nhà..." value={rules} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRules(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Đang lưu..." : editBuilding ? "Lưu Thay Đổi" : "Tạo Tòa Nhà"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
