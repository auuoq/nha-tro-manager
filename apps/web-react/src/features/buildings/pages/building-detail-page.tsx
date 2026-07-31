import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { buildingsApi } from "../api/buildings.api";
import { BuildingCreateInput } from "../types/building.types";
import { BuildingFormDialog } from "../components/building-dialog";
import { ChargeConfig, ChargeType, ChargeMethod, ChargeConfigCreateInput } from "@/shared/types/charge-config.types";
import { ArrowLeft, Edit3, Plus, ShieldAlert, Zap } from "lucide-react";

export const BuildingDetailPage: React.FC = () => {
  const { buildingId = "" } = useParams<{ buildingId: string }>();
  const queryClient = useQueryClient();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ChargeConfig | null>(null);
  const [chargeType, setChargeType] = useState<ChargeType>("ELECTRICITY");
  const [chargeMethod, setChargeMethod] = useState<ChargeMethod>("METERED");
  const [unitPrice, setUnitPrice] = useState<number>(3500);
  const [effectiveFrom, setEffectiveFrom] = useState<string>(new Date().toISOString().slice(0, 10));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editErrorMsg, setEditErrorMsg] = useState<string | null>(null);

  const { data: building, isLoading: isBuildingLoading } = useQuery({
    queryKey: ["building", buildingId],
    queryFn: () => buildingsApi.getById(buildingId),
    enabled: Boolean(buildingId),
  });

  const { data: chargeConfigs = [], isLoading: isConfigsLoading } = useQuery({
    queryKey: ["building-charge-configs", buildingId],
    queryFn: () => buildingsApi.getChargeConfigs(buildingId),
    enabled: Boolean(buildingId),
  });

  const updateBuildingMutation = useMutation({
    mutationFn: (input: BuildingCreateInput) => buildingsApi.update(buildingId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["building", buildingId] });
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
      setIsEditOpen(false);
    },
    onError: (err: any) => {
      setEditErrorMsg(err?.response?.data?.message || "Cập nhật tòa nhà thất bại");
    },
  });

  const createConfigMutation = useMutation({
    mutationFn: (input: ChargeConfigCreateInput) => buildingsApi.createChargeConfig(buildingId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["building-charge-configs", buildingId] });
      setEditingConfig(null);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      setErrorMsg(code === "CHARGE_CONFIG_OVERLAP"
        ? "Đơn giá dịch vụ đã tồn tại trong khoảng thời gian áp dụng!"
        : err?.response?.data?.message || "Tạo đơn giá dịch vụ thất bại");
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({ configId, input }: { configId: string; input: ChargeConfigCreateInput }) =>
      buildingsApi.updateChargeConfig(buildingId, configId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["building-charge-configs", buildingId] });
      setEditingConfig(null);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      setErrorMsg(code === "CHARGE_CONFIG_OVERLAP"
        ? "Đơn giá dịch vụ đã tồn tại trong khoảng thời gian áp dụng!"
        : err?.response?.data?.message || "Cập nhật đơn giá thất bại");
    },
  });

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (chargeMethod === "FREE" && unitPrice !== 0) {
      setErrorMsg("Hình thức miễn phí (FREE) bắt buộc đơn giá = 0");
      return;
    }
    if (chargeMethod === "METERED" && chargeType !== "ELECTRICITY" && chargeType !== "WATER") {
      setErrorMsg("Hình thức theo đồng hồ (METERED) chỉ áp dụng cho Điện và Nước");
      return;
    }

    const input: ChargeConfigCreateInput = {
      chargeType,
      chargeMethod,
      unitPrice: chargeMethod === "FREE" ? 0 : Number(unitPrice),
      effectiveFrom,
    };

    if (editingConfig) {
      await updateConfigMutation.mutateAsync({ configId: editingConfig.id, input });
    } else {
      await createConfigMutation.mutateAsync(input);
    }
  };

  if (isBuildingLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải thông tin chi tiết tòa nhà...</div>;
  }

  if (!building) {
    return <div className="p-8 text-center text-red-600 font-semibold">Tòa nhà không tồn tại hoặc bạn không có quyền truy cập.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3">
          <Link to="/admin/buildings" className="text-xs font-medium text-[#73766F] hover:text-[#252724] inline-flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Danh sách Tòa nhà</span>
          </Link>
        </div>
        <PageHeader
          title={building.name}
          description={building.address}
          action={
            <Button variant="outline" size="sm" onClick={() => { setEditErrorMsg(null); setIsEditOpen(true); }}>
              <Edit3 className="w-3.5 h-3.5 text-[#3F594F]" />
              <span>Sửa Thông Tin Tòa Nhà</span>
            </Button>
          }
        />
      </div>

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
          <form onSubmit={handleSaveConfig} className="bg-[#F8F7F4] p-4.5 rounded-2xl border border-[#E8E5DF] space-y-4">
            <span className="text-xs font-semibold text-[#252724] uppercase tracking-wider block">
              Thiết Lập / Cập Nhật Đơn Giá Mới
            </span>
            {errorMsg && (
              <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#252724] mb-1">Loại Phí (*)</label>
                <Select value={chargeType} onChange={(e) => setChargeType(e.target.value as ChargeType)} disabled={Boolean(editingConfig)}>
                  <option value="ELECTRICITY">Điện (ELECTRICITY)</option>
                  <option value="WATER">Nước (WATER)</option>
                  <option value="WIFI">Internet / Wifi (WIFI)</option>
                  <option value="GARBAGE">Rác Thải (GARBAGE)</option>
                  <option value="PARKING">Gửi Xe (PARKING)</option>
                  <option value="OTHER">Khác (OTHER)</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#252724] mb-1">Phương Thức Tính (*)</label>
                <Select value={chargeMethod} onChange={(e) => setChargeMethod(e.target.value as ChargeMethod)}>
                  <option value="METERED">Số Đồng Hồ (METERED)</option>
                  <option value="PER_PERSON">Theo Đầu Người (PER_PERSON)</option>
                  <option value="PER_ROOM">Cố Định / Phòng (PER_ROOM)</option>
                  <option value="FREE">Miễn Phí (FREE)</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#252724] mb-1">Đơn Giá (VNĐ) (*)</label>
                <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#252724] mb-1">Hiệu Lực Từ (*)</label>
                <Input type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} required />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {editingConfig && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingConfig(null)}>
                  Hủy
                </Button>
              )}
              <Button type="submit" variant="primary" size="sm" disabled={createConfigMutation.isPending || updateConfigMutation.isPending}>
                <Plus className="w-3.5 h-3.5" />
                <span>Lưu Đơn Giá Dịch Vụ</span>
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            <span className="text-xs font-semibold text-[#73766F] uppercase tracking-wider block">
              Đơn Giá Đang Hiệu Lực ({chargeConfigs.length} khoản)
            </span>
            {isConfigsLoading ? (
              <Skeleton className="h-32 w-full rounded-xl" />
            ) : chargeConfigs.length === 0 ? (
              <p className="text-xs text-[#A3A69F] italic p-4 bg-[#F8F7F4] rounded-xl border border-[#E8E5DF] text-center">
                Chưa có đơn giá dịch vụ nào được thiết lập.
              </p>
            ) : (
              <div className="divide-y divide-[#F2EFE9] border border-[#E8E5DF] rounded-2xl overflow-hidden bg-white">
                {chargeConfigs.map((config) => (
                  <button
                    key={config.id}
                    type="button"
                    className="w-full p-3.5 flex items-center justify-between hover:bg-[#F8F7F4] transition-colors text-xs text-left"
                    onClick={() => {
                      setEditingConfig(config);
                      setChargeType(config.chargeType);
                      setChargeMethod(config.chargeMethod);
                      setUnitPrice(config.unitPrice);
                      setEffectiveFrom(config.effectiveFrom);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="info">{config.chargeType}</Badge>
                      <span className="font-semibold text-[#252724] text-sm">{config.unitPrice.toLocaleString("vi-VN")} VNĐ</span>
                      <span className="text-[#73766F]">({config.chargeMethod})</span>
                    </div>
                    <span className="text-[#A3A69F]">Hiệu lực từ: {new Date(config.effectiveFrom).toLocaleDateString("vi-VN")}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <BuildingFormDialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={async (input) => {
          await updateBuildingMutation.mutateAsync(input);
        }}
        editBuilding={building}
        loading={updateBuildingMutation.isPending}
        error={editErrorMsg}
      />
    </div>
  );
};
