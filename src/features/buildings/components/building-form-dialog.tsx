"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createBuildingAction } from "../actions/create-building.action";
import { updateBuildingAction } from "../actions/update-building.action";
import { BuildingItemDTO } from "../types/building.types";

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
      title={editBuilding ? "Cập Nhật Thông Tin Tòa Nhà" : "Thêm Tòa Nhà Trọ Mới"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium">{error}</div>}

        {/* Section 1: Thông tin cơ bản */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-[#73766F] uppercase tracking-wider block">1. Thông Tin Cơ Bản</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Tên Tòa Nhà (*)" placeholder="VD: Tòa UAT Yên Hòa" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Địa Chỉ Thực Tế (*)" placeholder="VD: Yên Hòa, Cầu Giấy, Hà Nội" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <Textarea label="Mô Tả / Ghi Chú" placeholder="Thông tin tổng quan về tòa nhà..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {/* Section 2: Ngân hàng */}
        <div className="space-y-3 pt-3 border-t border-[#F2EFE9]">
          <span className="text-xs font-semibold text-[#73766F] uppercase tracking-wider block">2. Tài Khoản Ngân Hàng Nhận Tiền (VietQR)</span>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tên Ngân Hàng" placeholder="Vietcombank / MBBank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            <Input label="Mã BIN Ngân Hàng" placeholder="970436 (VCB)" value={bankBin} onChange={(e) => setBankBin(e.target.value)} />
            <Input label="Số Tài Khoản" placeholder="123456789" value={bankAccountNo} onChange={(e) => setBankAccountNo(e.target.value)} />
            <Input label="Tên Chủ Tài Khoản" placeholder="OWNER UAT" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} />
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
            {editBuilding ? "Lưu Thay Đổi" : "Tạo Tòa Nhà"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
