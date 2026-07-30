"use client";

import React, { useState } from "react";
import { TenantDetailDTO } from "../types/tenant.types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateOwnTenantProfileAction } from "../actions/update-own-tenant-profile.action";

export interface TenantProfileFormProps {
  tenant: TenantDetailDTO;
  onSuccess: () => void;
}

export const TenantProfileForm: React.FC<TenantProfileFormProps> = ({ tenant, onSuccess }) => {
  const [phone, setPhone] = useState(tenant.phone || "");
  const [permanentAddress, setPermanentAddress] = useState(tenant.permanentAddress || "");
  const [vehicleNumber, setVehicleNumber] = useState(tenant.vehicleNumber || "");
  const [emergencyContactName, setEmergencyContactName] = useState(tenant.emergencyContactName || "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(tenant.emergencyContactPhone || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const res = await updateOwnTenantProfileAction({
      phone,
      permanentAddress,
      vehicleNumber,
      emergencyContactName,
      emergencyContactPhone,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Cập nhật hồ sơ thất bại");
      return;
    }

    setSuccessMsg("✅ Hồ sơ của bạn đã được cập nhật thành công!");
    onSuccess();
  };

  return (
    <Card title="Hồ Sơ Cá Nhân Của Tôi (Tenant Self-Service Portal)">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg">{error}</div>}
        {successMsg && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg">{successMsg}</div>}

        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg text-xs text-slate-600">
          <div>
            <span className="font-semibold text-slate-800 block">Họ và Tên Khách Thuê:</span>
            <span>{tenant.fullName}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-800 block">Số CCCD / CMND:</span>
            <span>{tenant.idCardNumber || "—"}</span>
          </div>
        </div>

        <Input label="Số Điện Thoại Liên Hệ" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="Địa Chỉ Thường Trú Hộ Khẩu" value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} />
        <Input label="Biển Số Xe Máy / Ô Tô" placeholder="29A-12345" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />

        <div className="border-t border-slate-100 pt-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Người Liên Hệ Khẩn Cấp</span>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tên Người Thân" placeholder="Nguyễn Văn A (Bố)" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} />
            <Input label="SĐT Người Thân" placeholder="0988888888" type="tel" value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button type="submit" variant="primary" isLoading={loading}>
            Lưu Thay Đổi Hồ Sơ
          </Button>
        </div>
      </form>
    </Card>
  );
};
