"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createBuildingAction } from "../actions/create-building.action";
import { updateBuildingAction } from "../actions/update-building.action";
import { BuildingItemDTO } from "../types/building.types";
import { Landmark, ChevronDown } from "lucide-react";

export const POPULAR_VIETNAM_BANKS = [
  { name: "Vietcombank (VCB)", bin: "970436", shortName: "Vietcombank" },
  { name: "MBBank (MB)", bin: "970422", shortName: "MBBank" },
  { name: "Techcombank (TCB)", bin: "970407", shortName: "Techcombank" },
  { name: "BIDV", bin: "970418", shortName: "BIDV" },
  { name: "Agribank", bin: "970405", shortName: "Agribank" },
  { name: "VPBank", bin: "970432", shortName: "VPBank" },
  { name: "TPBank", bin: "970423", shortName: "TPBank" },
  { name: "ACB", bin: "970416", shortName: "ACB" },
  { name: "VietinBank", bin: "970415", shortName: "VietinBank" },
  { name: "Sacombank", bin: "970403", shortName: "Sacombank" },
  { name: "HDBank", bin: "970437", shortName: "HDBank" },
  { name: "MSB (Hàng Hải)", bin: "970426", shortName: "MSB" },
  { name: "OCB (Phương Đông)", bin: "970448", shortName: "OCB" },
  { name: "SHB", bin: "970443", shortName: "SHB" },
  { name: "VIB (Quốc Tế)", bin: "970441", shortName: "VIB" },
  { name: "SeABank", bin: "970440", shortName: "SeABank" },
  { name: "Bac A Bank", bin: "970409", shortName: "Bac A Bank" },
  { name: "LPBank (Lộc Phát)", bin: "970449", shortName: "LPBank" },
];

export interface BuildingFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editBuilding?: BuildingItemDTO | null;
}

export const BuildingFormDialog: React.FC<BuildingFormDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editBuilding,
}) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankBin, setBankBin] = useState("");
  const [wifiInfo, setWifiInfo] = useState("");
  const [rules, setRules] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editBuilding) {
      setName(editBuilding.name || "");
      setAddress(editBuilding.address || "");
      setDescription(editBuilding.description || "");
      setBankName(editBuilding.bankName || "");
      setBankAccountNo(editBuilding.bankAccountNo || "");
      setBankAccountName(editBuilding.bankAccountName || "");
      setBankBin(editBuilding.bankBin || "");
      setWifiInfo(editBuilding.wifiInfo || "");
      setRules(editBuilding.rules || "");
    } else {
      setName("");
      setAddress("");
      setDescription("");
      setBankName("");
      setBankAccountNo("");
      setBankAccountName("");
      setBankBin("");
      setWifiInfo("");
      setRules("");
    }
  }, [editBuilding, isOpen]);

  const handleBankSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBin = e.target.value;
    const found = POPULAR_VIETNAM_BANKS.find((b) => b.bin === selectedBin);
    if (found) {
      setBankBin(found.bin);
      setBankName(found.shortName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (editBuilding) {
      const res = await updateBuildingAction({
        buildingId: editBuilding.id,
        name,
        address,
        description,
        bankName,
        bankAccountNo,
        bankAccountName,
        bankBin,
        wifiInfo,
        rules,
      });
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Cập nhật thất bại");
        return;
      }
    } else {
      const res = await createBuildingAction({
        name,
        address,
        description,
        bankName,
        bankAccountNo,
        bankAccountName,
        bankBin,
        wifiInfo,
        rules,
      });
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Tạo mới thất bại");
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
      title={editBuilding ? `Cập Nhật Thông Tin — ${editBuilding.name}` : "Thêm Tòa Nhà Trọ Mới"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium">{error}</div>}

        {/* Section 1: Thông tin cơ bản */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-[#73766F] uppercase tracking-wider block">1. Thông Tin Cơ Bản Tòa Nhà</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Tên Tòa Nhà (*)" placeholder="VD: Tòa UAT Yên Hòa" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Địa Chỉ Thực Tế (*)" placeholder="VD: Yên Hòa, Cầu Giấy, Hà Nội" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <Textarea label="Mô Tả / Ghi Chú" placeholder="Thông tin tổng quan về tòa nhà..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {/* Section 2: Ngân hàng với VietQR Selector */}
        <div className="space-y-3 pt-3 border-t border-[#F2EFE9]">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#3F594F]" />
            <span className="text-xs font-semibold text-[#252724] uppercase tracking-wider">2. Tài Khoản Ngân Hàng Nhận Tiền VietQR</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#252724] mb-1">
              Chọn Ngân Hàng Nhận Tiền (Tự động điền mã VietQR BIN)
            </label>
            <div className="relative">
              <select
                value={bankBin}
                onChange={handleBankSelectChange}
                className="w-full h-[42px] px-3.5 bg-white border border-[#E8E5DF] rounded-2xl text-xs text-[#252724] focus:outline-none focus:border-[#3F594F] focus:ring-4 focus:ring-[#3F594F]/10 transition-all appearance-none pr-10 cursor-pointer"
              >
                <option value="">-- Chọn Ngân hàng Việt Nam --</option>
                {POPULAR_VIETNAM_BANKS.map((b) => (
                  <option key={b.bin} value={b.bin}>
                    {b.name} — Mã BIN: {b.bin}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#73766F] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Số Tài Khoản Ngân Hàng (*)" placeholder="123456789" value={bankAccountNo} onChange={(e) => setBankAccountNo(e.target.value)} required />
            <Input label="Tên Chủ Tài Khoản (VIẾT HOA) (*)" placeholder="NGUYEN VAN A" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Tên Ngân Hàng Hẳn" placeholder="Vietcombank / MBBank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            <Input label="Mã BIN VietQR (Tự động)" placeholder="970436" value={bankBin} onChange={(e) => setBankBin(e.target.value)} />
          </div>
        </div>

        {/* Section 3: Tiện ích & Nội quy */}
        <div className="space-y-3 pt-3 border-t border-[#F2EFE9]">
          <span className="text-xs font-semibold text-[#73766F] uppercase tracking-wider block">3. Tiện Ích & Nội Quy</span>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Thông Tin Wifi" placeholder="Wifi: YenHoa_F2 / Pass: 12345678" value={wifiInfo} onChange={(e) => setWifiInfo(e.target.value)} />
            <Input label="Nội Quy Tóm Tắt" placeholder="Giữ yên tĩnh sau 23:00..." value={rules} onChange={(e) => setRules(e.target.value)} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E5DF]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {editBuilding ? "Lưu Thay Đổi Ngân Hàng" : "Tạo Tòa Nhà"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
