import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { buildingsApi } from "../api/buildings.api";
import { ChargeConfig, ChargeType, ChargeMethod, ChargeConfigCreateInput } from "@/shared/types/charge-config.types";
import { translateChargeType, translateChargeMethod } from "@/shared/adapters/charge-config.adapter";
import { ArrowLeft, Building2, CreditCard, Wifi, ShieldAlert, Plus, Edit2 } from "lucide-react";

export const BuildingDetailPage: React.FC = () => {
  const { buildingId = "" } = useParams<{ buildingId: string }>();
  const queryClient = useQueryClient();

  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ChargeConfig | null>(null);
  const [chargeType, setChargeType] = useState<ChargeType>("ELECTRICITY");
  const [chargeMethod, setChargeMethod] = useState<ChargeMethod>("METERED");
  const [unitPrice, setUnitPrice] = useState<number>(3500);
  const [effectiveFrom, setEffectiveFrom] = useState<string>("2026-01-01");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const createConfigMutation = useMutation({
    mutationFn: (input: ChargeConfigCreateInput) => buildingsApi.createChargeConfig(buildingId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["building-charge-configs", buildingId] });
      setIsConfigDialogOpen(false);
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "CHARGE_CONFIG_OVERLAP") {
        setErrorMsg("Đơn giá dịch vụ đã tồn tại trong khoảng thời gian áp dụng!");
      } else {
        setErrorMsg(err?.response?.data?.message || "Tạo đơn giá dịch vụ thất bại");
      }
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({ configId, input }: { configId: string; input: ChargeConfigCreateInput }) =>
      buildingsApi.updateChargeConfig(buildingId, configId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["building-charge-configs", buildingId] });
      setIsConfigDialogOpen(false);
      setEditingConfig(null);
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "CHARGE_CONFIG_OVERLAP") {
        setErrorMsg("Đơn giá dịch vụ đã tồn tại trong khoảng thời gian áp dụng!");
      } else {
        setErrorMsg(err?.response?.data?.message || "Cập nhật đơn giá thất bại");
      }
    },
  });

  const handleSaveConfig = async (e: React.FormEvent) => {
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

    const payload: ChargeConfigCreateInput = {
      chargeType,
      chargeMethod,
      unitPrice: chargeMethod === "FREE" ? 0 : Number(unitPrice),
      effectiveFrom,
    };

    if (editingConfig) {
      await updateConfigMutation.mutateAsync({ configId: editingConfig.id, input: payload });
    } else {
      await createConfigMutation.mutateAsync(payload);
    }
  };

  if (isBuildingLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (!building) {
    return (
      <div className="p-8 text-center text-[#A84646] bg-[#FDF0F0] rounded-2xl border border-[#F5D5D5]">
        Tòa nhà không tồn tại hoặc bạn không có quyền truy cập (BUILDING_NOT_FOUND).
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/admin/buildings" className="text-xs text-[#73766F] hover:text-[#3F594F] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách
        </Link>
      </div>

      <PageHeader
        title={`Chi Tiết Tòa Nhà: ${building.name}`}
        description={building.address}
        action={
          <Button variant="primary" onClick={() => { setEditingConfig(null); setErrorMsg(null); setIsConfigDialogOpen(true); }}>
            <Plus className="w-4 h-4" /> Thêm Đơn Giá Dịch Vụ
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: General & Bank Info */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#3F594F]" /> Thông Tin Tòa Nhà
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-[#73766F]">
              <div>
                <span className="font-semibold text-[#252724] block">Địa chỉ:</span>
                <span>{building.address}</span>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Quy mô:</span>
                <span>{building.totalRooms ?? 0} phòng trọ</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#3F594F]" /> Tài Khoản VietQR Ngân Hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-[#73766F]">
              {building.bankAccount ? (
                <>
                  <div>Ngân hàng: <strong className="text-[#252724]">{building.bankName || "-"}</strong></div>
                  <div>Số tài khoản: <strong className="text-[#252724]">{building.bankAccount}</strong></div>
                  <div>Chủ tài khoản: <strong className="text-[#252724]">{building.accountHolder || "-"}</strong></div>
                </>
              ) : (
                <p className="italic text-[#A3A69F]">Chưa cấu hình tài khoản ngân hàng</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-[#3F594F]" /> Wifi & Nội Quy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-[#73766F]">
              <div>Tên Wifi: <strong className="text-[#252724]">{building.wifiName || "Chưa thiết lập"}</strong></div>
              <div>Mật khẩu: <strong className="text-[#252724]">{building.wifiPassword || "Chưa thiết lập"}</strong></div>
              {building.rules && (
                <div className="pt-2 border-t border-[#F2EFE9] mt-2">
                  <span className="font-semibold text-[#252724] block mb-1">Nội quy:</span>
                  <p className="whitespace-pre-line">{building.rules}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Charge Configs Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Đơn Giá Dịch Vụ Cấp Tòa Nhà ({chargeConfigs.length})</CardTitle>
              <Button size="sm" variant="outline" onClick={() => { setEditingConfig(null); setIsConfigDialogOpen(true); }}>
                + Thêm Cấu Hình
              </Button>
            </CardHeader>
            <CardContent>
              {isConfigsLoading ? (
                <Skeleton className="h-48 w-full rounded-xl" />
              ) : chargeConfigs.length === 0 ? (
                <p className="text-xs text-[#73766F] p-4 text-center">Chưa có đơn giá dịch vụ cấp Tòa nhà nào được thiết lập.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8F7F4] text-[#73766F] uppercase font-semibold border-b border-[#E8E5DF]">
                      <tr>
                        <th className="px-3 py-2.5">Loại Phí</th>
                        <th className="px-3 py-2.5">Hình Thức</th>
                        <th className="px-3 py-2.5">Đơn Giá</th>
                        <th className="px-3 py-2.5">Hiệu Lực Từ</th>
                        <th className="px-3 py-2.5 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E5DF]">
                      {chargeConfigs.map((cfg) => (
                        <tr key={cfg.id} className="hover:bg-[#F8F7F4]/50">
                          <td className="px-3 py-3 font-semibold text-[#252724]">{translateChargeType(cfg.chargeType)}</td>
                          <td className="px-3 py-3">{translateChargeMethod(cfg.chargeMethod)}</td>
                          <td className="px-3 py-3 font-bold text-[#3F594F]">{cfg.unitPrice.toLocaleString("vi-VN")} ₫</td>
                          <td className="px-3 py-3">{cfg.effectiveFrom}</td>
                          <td className="px-3 py-3 text-right">
                            <button
                              onClick={() => {
                                setEditingConfig(cfg);
                                setChargeType(cfg.chargeType);
                                setChargeMethod(cfg.chargeMethod);
                                setUnitPrice(cfg.unitPrice);
                                setEffectiveFrom(cfg.effectiveFrom);
                                setIsConfigDialogOpen(true);
                              }}
                              className="p-1 text-[#73766F] hover:text-[#3F594F] rounded-lg"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charge Config Form Modal */}
      <Dialog
        open={isConfigDialogOpen}
        onClose={() => setIsConfigDialogOpen(false)}
        title={editingConfig ? "Cập Nhật Đơn Giá Dịch Vụ" : "Thêm Đơn Giá Dịch Vụ Cấp Tòa Nhà"}
      >
        <form onSubmit={handleSaveConfig} className="space-y-4">
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
            <Button type="button" variant="ghost" onClick={() => setIsConfigDialogOpen(false)}>
              Hủy Bỏ
            </Button>
            <Button type="submit" variant="primary">
              Lưu Đơn Giá
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
