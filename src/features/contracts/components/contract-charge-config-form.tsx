"use client";

import React, { useState } from "react";
import { ContractChargeConfigDTO } from "../types/contract.types";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createContractChargeConfigAction } from "../actions/create-contract-charge-config.action";
import { ChargeType, ChargeMethod } from "@prisma/client";

export interface ContractChargeConfigFormProps {
  contractId: string;
  contractChargeConfigs: ContractChargeConfigDTO[];
  roomOverrideChargeConfigs: ContractChargeConfigDTO[];
  buildingDefaultChargeConfigs: ContractChargeConfigDTO[];
  onSuccess: () => void;
}

export const ContractChargeConfigForm: React.FC<ContractChargeConfigFormProps> = ({
  contractId,
  contractChargeConfigs,
  roomOverrideChargeConfigs,
  buildingDefaultChargeConfigs,
  onSuccess,
}) => {
  const [chargeType, setChargeType] = useState<ChargeType>(ChargeType.ELECTRICITY);
  const [chargeMethod, setChargeMethod] = useState<ChargeMethod>(ChargeMethod.METERED);
  const [unitPrice, setUnitPrice] = useState<number>(3800);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await createContractChargeConfigAction(contractId, {
      chargeType,
      chargeMethod,
      unitPrice: Number(unitPrice),
      effectiveFrom: new Date(),
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Thêm đơn giá ghi đè thất bại");
      return;
    }

    onSuccess();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Bảng Đơn Giá Phí Dịch Vụ Cấp Hợp Đồng (Contract Override)</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Đơn giá tại hợp đồng có ưu tiên cao nhất: Hợp đồng ➔ Phòng ➔ Tòa nhà mặc định.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Cấu Hình Đơn Giá Ghi Đè Hợp Đồng Mới</span>
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Loại Phí (*)"
            value={chargeType}
            onChange={(e) => setChargeType(e.target.value as ChargeType)}
            options={[
              { label: "Điện (ELECTRICITY)", value: "ELECTRICITY" },
              { label: "Nước (WATER)", value: "WATER" },
              { label: "Internet / Wifi (WIFI)", value: "WIFI" },
              { label: "Rác Thải (GARBAGE)", value: "GARBAGE" },
              { label: "Gửi Xe (PARKING)", value: "PARKING" },
              { label: "Khác (OTHER)", value: "OTHER" },
            ]}
          />
          <Select
            label="Phương Thức Tính (*)"
            value={chargeMethod}
            onChange={(e) => setChargeMethod(e.target.value as ChargeMethod)}
            options={[
              { label: "Số Đồng Hồ (METERED)", value: "METERED" },
              { label: "Theo Đầu Người (PER_PERSON)", value: "PER_PERSON" },
              { label: "Cố Định / Phòng (PER_ROOM)", value: "PER_ROOM" },
              { label: "Miễn Phí (FREE)", value: "FREE" },
            ]}
          />
          <Input
            label="Đơn Giá Ghi Đè (VNĐ) (*)"
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            required
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="sm" isLoading={loading}>
            + Lưu Đơn Giá Hợp Đồng
          </Button>
        </div>
      </form>

      {/* Đơn giá Hợp đồng */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Đơn Giá Riêng Theo Hợp Đồng Này ({contractChargeConfigs.length})</span>
        {contractChargeConfigs.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Hợp đồng này chưa có đơn giá ghi đè riêng.</p>
        ) : (
          <div className="divide-y divide-slate-100 border rounded-lg overflow-hidden">
            {contractChargeConfigs.map((c) => (
              <div key={c.id} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                <div className="flex items-center gap-3">
                  <Badge variant="warning">{c.chargeType} (Ưu tiên Hợp đồng)</Badge>
                  <span className="font-semibold text-slate-800">{c.unitPrice.toLocaleString("vi-VN")} VNĐ</span>
                  <span className="text-slate-500">({c.chargeMethod})</span>
                </div>
                <span className="text-slate-400">Hiệu lực từ: {new Date(c.effectiveFrom).toLocaleDateString("vi-VN")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Đơn giá Phòng & Tòa nhà */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        <span className="font-bold text-slate-500 uppercase tracking-wider block">Đơn Giá Cấp Phòng & Tòa Nhà Chi Thừa Kế</span>
        <div className="flex flex-wrap gap-1.5">
          {roomOverrideChargeConfigs.map((c) => (
            <Badge key={c.id} variant="neutral">
              Phòng: {c.chargeType} - {c.unitPrice.toLocaleString("vi-VN")}đ ({c.chargeMethod})
            </Badge>
          ))}
          {buildingDefaultChargeConfigs.map((c) => (
            <Badge key={c.id} variant="neutral">
              Tòa nhà: {c.chargeType} - {c.unitPrice.toLocaleString("vi-VN")}đ ({c.chargeMethod})
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
