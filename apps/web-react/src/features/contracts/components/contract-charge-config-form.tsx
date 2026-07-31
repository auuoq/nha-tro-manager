import React, { useState } from "react";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { ChargeConfig, ChargeType, ChargeMethod, ChargeConfigCreateInput } from "@/shared/types/charge-config.types";
import { ShieldAlert } from "lucide-react";

export interface ContractChargeConfigFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: ChargeConfigCreateInput) => Promise<void>;
  editConfig?: ChargeConfig | null;
  loading?: boolean;
}

export const ContractChargeConfigForm: React.FC<ContractChargeConfigFormProps> = ({
  open,
  onClose,
  onSubmit,
  editConfig,
  loading = false,
}) => {
  const [chargeType, setChargeType] = useState<ChargeType>(editConfig?.chargeType || "ELECTRICITY");
  const [chargeMethod, setChargeMethod] = useState<ChargeMethod>(editConfig?.chargeMethod || "METERED");
  const [unitPrice, setUnitPrice] = useState<number>(editConfig?.unitPrice || 3500);
  const [effectiveFrom, setEffectiveFrom] = useState<string>(editConfig?.effectiveFrom || "2026-01-01");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Business validation check
    if (chargeMethod === "FREE" && unitPrice !== 0) {
      setErrorMsg("Hình thức miễn phí (FREE) bắt buộc đơn giá = 0");
      return;
    }
    if (chargeMethod === "METERED" && chargeType !== "ELECTRICITY" && chargeType !== "WATER") {
      setErrorMsg("Hình thức theo đồng hồ (METERED) chỉ áp dụng cho Điện và Nước");
      return;
    }

    try {
      await onSubmit({
        chargeType,
        chargeMethod,
        unitPrice: chargeMethod === "FREE" ? 0 : Number(unitPrice),
        effectiveFrom,
      });
      onClose();
    } catch (err: any) {
      const code = err?.response?.data?.error?.code;
      if (code === "CHARGE_CONFIG_OVERLAP") {
        setErrorMsg("Đơn giá dịch vụ hợp đồng đã tồn tại trong khoảng thời gian áp dụng!");
      } else {
        setErrorMsg(err?.response?.data?.message || "Tạo đơn giá dịch vụ thất bại");
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={editConfig ? "Sửa Đơn Giá Hợp Đồng" : "Thêm Đơn Giá Dịch Vụ Hợp Đồng"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Loại Phí Dịch Vụ</label>
          <Select value={chargeType} onChange={(e) => setChargeType(e.target.value as ChargeType)}>
            <option value="ELECTRICITY">Tiền điện</option>
            <option value="WATER">Tiền nước</option>
            <option value="WIFI">Tiền Wifi</option>
            <option value="GARBAGE">Tiền rác</option>
            <option value="PARKING">Tiền gửi xe</option>
            <option value="OTHER">Phí khác</option>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Hình Thức Tính Phí</label>
          <Select value={chargeMethod} onChange={(e) => setChargeMethod(e.target.value as ChargeMethod)}>
            <option value="METERED">Theo chỉ số đồng hồ (METERED)</option>
            <option value="PER_PERSON">Theo đầu người (PER_PERSON)</option>
            <option value="PER_ROOM">Cố định / phòng (PER_ROOM)</option>
            <option value="FREE">Miễn phí (FREE)</option>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Đơn Giá (VNĐ)</label>
          <Input
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            disabled={chargeMethod === "FREE"}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#252724] mb-1">Ngày Bắt Đầu Hiệu Lực</label>
          <Input type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} required />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            Lưu Đơn Giá Hợp Đồng
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
