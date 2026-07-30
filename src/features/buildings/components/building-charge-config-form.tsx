"use client";

import React, { useState } from "react";
import { BuildingChargeConfigDTO } from "../types/building.types";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createBuildingChargeConfigAction } from "../actions/create-building-charge-config.action";
import { ChargeType, ChargeMethod } from "@prisma/client";
import { Plus, Zap, DollarSign } from "lucide-react";

export interface BuildingChargeConfigFormProps {
  buildingId: string;
  chargeConfigs: BuildingChargeConfigDTO[];
  onSuccess: () => void;
}

export const BuildingChargeConfigForm: React.FC<BuildingChargeConfigFormProps> = ({
  buildingId,
  chargeConfigs,
  onSuccess,
}) => {
  const [chargeType, setChargeType] = useState<ChargeType>(ChargeType.ELECTRICITY);
  const [chargeMethod, setChargeMethod] = useState<ChargeMethod>(ChargeMethod.METERED);
  const [unitPrice, setUnitPrice] = useState<number>(3500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await createBuildingChargeConfigAction(buildingId, {
      chargeType,
      chargeMethod,
      unitPrice: Number(unitPrice),
      effectiveFrom: new Date(),
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Thêm cấu hình phí thất bại");
      return;
    }

    onSuccess();
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#3F594F]" />
          <span>Bảng Đơn Giá Phí Dịch Vụ Mặc Định</span>
        </div>
      }
      subtitle="Đơn giá thiết lập tại đây sẽ làm giá mặc định cho toàn bộ các phòng trong tòa nhà (khi không ghi đè giá riêng)"
    >
      <div className="space-y-6">
        {/* Form tạo mới */}
        <form onSubmit={handleSubmit} className="bg-[#F8F7F4] p-4.5 rounded-2xl border border-[#E8E5DF] space-y-4">
          <span className="text-xs font-semibold text-[#252724] uppercase tracking-wider block">
            Thiết Lập / Cập Nhật Đơn Giá Mới
          </span>
          {error && <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium">{error}</div>}
          
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
              label="Đơn Giá (VNĐ) (*)"
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm" isLoading={loading}>
              <Plus className="w-3.5 h-3.5" />
              <span>Lưu Đơn Giá Dịch Vụ</span>
            </Button>
          </div>
        </form>

        {/* Danh sách đơn giá hiện tại */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-[#73766F] uppercase tracking-wider block">
            Đơn Giá Đang Hiệu Lực ({chargeConfigs.length} khoản)
          </span>
          {chargeConfigs.length === 0 ? (
            <p className="text-xs text-[#A3A69F] italic p-4 bg-[#F8F7F4] rounded-xl border border-[#E8E5DF] text-center">
              Chưa có đơn giá dịch vụ nào được thiết lập.
            </p>
          ) : (
            <div className="divide-y divide-[#F2EFE9] border border-[#E8E5DF] rounded-2xl overflow-hidden bg-white">
              {chargeConfigs.map((c) => (
                <div key={c.id} className="p-3.5 flex items-center justify-between hover:bg-[#F8F7F4] transition-colors text-xs">
                  <div className="flex items-center gap-3">
                    <Badge variant="info">{c.chargeType}</Badge>
                    <span className="font-semibold text-[#252724] text-sm">{c.unitPrice.toLocaleString("vi-VN")} VNĐ</span>
                    <span className="text-[#73766F]">({c.chargeMethod})</span>
                  </div>
                  <span className="text-[#A3A69F]">
                    Hiệu lực từ: {new Date(c.effectiveFrom).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
