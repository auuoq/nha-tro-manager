import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { contractsApi } from "../api/contracts.api";
import { tenantsApi } from "@/features/tenants/api/tenants.api";
import { ContractStatus, ContractUpdateInput } from "../types/contract.types";
import { ChargeConfig, ChargeConfigCreateInput } from "@/shared/types/charge-config.types";
import { translateChargeType, translateChargeMethod } from "@/shared/adapters/charge-config.adapter";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";
import { ContractStatusActions } from "../components/contract-status-actions";
import { ContractTenantSection } from "../components/contract-tenant-section";
import { ContractFormDialog } from "../components/contract-dialog";
import { ContractChargeConfigForm } from "../components/contract-charge-config-form";
import { ArrowLeft, FileText, DollarSign, Plus, Edit2 } from "lucide-react";

export const ContractDetailPage: React.FC = () => {
  const { contractId = "" } = useParams<{ contractId: string }>();
  const queryClient = useQueryClient();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChargeDialogOpen, setIsChargeDialogOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<ChargeConfig | null>(null);

  const { data: contract, isLoading } = useQuery({
    queryKey: ["contract", contractId],
    queryFn: () => contractsApi.getById(contractId),
    enabled: Boolean(contractId),
  });

  const { data: contractTenants = [] } = useQuery({
    queryKey: ["contract-tenants", contractId],
    queryFn: () => contractsApi.getTenants(contractId),
    enabled: Boolean(contractId),
  });

  const { data: chargeConfigs = [] } = useQuery({
    queryKey: ["contract-charge-configs", contractId],
    queryFn: () => contractsApi.getChargeConfigs(contractId),
    enabled: Boolean(contractId),
  });

  const { data: allTenantsData } = useQuery({
    queryKey: ["all-tenants"],
    queryFn: () => tenantsApi.list({ page: 1, pageSize: 100 }),
  });
  const availableTenants = (allTenantsData?.items || []).map((t) => ({ id: t.id, name: t.fullName }));

  const statusMutation = useMutation({
    mutationFn: ({ targetStatus, reason }: { targetStatus: ContractStatus; reason?: string }) =>
      contractsApi.updateStatus(contractId, targetStatus, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract", contractId] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Chuyển trạng thái thất bại");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: ContractUpdateInput) => contractsApi.update(contractId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract", contractId] });
      setIsEditDialogOpen(false);
    },
  });

  const addTenantMutation = useMutation({
    mutationFn: ({ tenantId, isPrimary }: { tenantId: string; isPrimary: boolean }) =>
      contractsApi.addTenant(contractId, tenantId, isPrimary),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-tenants", contractId] });
    },
  });

  const removeTenantMutation = useMutation({
    mutationFn: (tenantId: string) => contractsApi.removeTenant(contractId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-tenants", contractId] });
    },
  });

  const createChargeMutation = useMutation({
    mutationFn: (input: ChargeConfigCreateInput) => contractsApi.createChargeConfig(contractId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-charge-configs", contractId] });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (!contract) {
    return (
      <div className="p-8 text-center text-[#A84646] bg-[#FDF0F0] rounded-2xl border border-[#F5D5D5]">
        Hợp đồng không tồn tại hoặc bạn không có quyền truy cập.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/admin/contracts" className="text-xs text-[#73766F] hover:text-[#3F594F] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách hợp đồng
        </Link>
      </div>

      <PageHeader
        title={`Chi Tiết Hợp Đồng ${contract.contractCode}`}
        description={`Phòng ${contract.roomNumber || "-"} • ${contract.buildingName || "-"}`}
        action={
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit2 className="w-3.5 h-3.5" /> Chỉnh Sửa Hợp Đồng
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lifecycle Actions & Overview */}
        <div className="space-y-6 lg:col-span-1">
          <ContractStatusActions
            contract={contract}
            onStatusChange={async (targetStatus, reason) => { await statusMutation.mutateAsync({ targetStatus, reason }); }}
            loading={statusMutation.isPending}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#3F594F]" /> Thông Tin Hợp Đồng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-[#73766F]">
              <div>
                <span className="font-semibold text-[#252724] block">Mã hợp đồng:</span>
                <span className="font-mono font-bold text-[#252724]">{contract.contractCode}</span>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Giá thuê hàng tháng:</span>
                <strong className="text-[#3F594F] font-bold text-sm">{formatCurrency(contract.monthlyPrice)} / tháng</strong>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Tiền đặt cọc:</span>
                <span>{formatCurrency(contract.depositAmount)}</span>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Thời hạn hợp đồng:</span>
                <span>{formatDate(contract.startDate)} ➔ {formatDate(contract.endDate)}</span>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Ngày chốt tiền hàng tháng:</span>
                <span>Ngày {contract.billingDay} hàng tháng</span>
              </div>
              {contract.notes && (
                <div className="pt-2 border-t border-[#F2EFE9] mt-2">
                  <span className="font-semibold text-[#252724] block mb-1">Ghi chú:</span>
                  <p className="whitespace-pre-line">{contract.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Contract Tenants & Charge Configs */}
        <div className="lg:col-span-2 space-y-6">
          <ContractTenantSection
            contractId={contractId}
            tenants={contractTenants}
            availableTenants={availableTenants}
            onAddTenant={async (tenantId, isPrimary) => { await addTenantMutation.mutateAsync({ tenantId, isPrimary }); }}
            onRemoveTenant={async (tenantId) => { await removeTenantMutation.mutateAsync(tenantId); }}
            loading={addTenantMutation.isPending}
          />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#3F594F]" /> Đơn Giá Dịch Vụ Hợp Đồng ({chargeConfigs.length})
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => { setEditingCharge(null); setIsChargeDialogOpen(true); }}>
                <Plus className="w-3.5 h-3.5" /> Thêm Đơn Giá Dịch Vụ
              </Button>
            </CardHeader>
            <CardContent>
              {chargeConfigs.length === 0 ? (
                <p className="text-xs text-[#73766F] p-4 text-center">Chưa có đơn giá riêng cho hợp đồng này. Hệ thống sẽ kế thừa từ Tòa nhà.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8F7F4] text-[#73766F] uppercase font-semibold border-b border-[#E8E5DF]">
                      <tr>
                        <th className="px-3 py-2.5">Loại Phí</th>
                        <th className="px-3 py-2.5">Hình Thức</th>
                        <th className="px-3 py-2.5">Đơn Giá</th>
                        <th className="px-3 py-2.5">Hiệu Lực Từ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E5DF]">
                      {chargeConfigs.map((cfg) => (
                        <tr key={cfg.id} className="hover:bg-[#F8F7F4]/50">
                          <td className="px-3 py-3 font-semibold text-[#252724]">{translateChargeType(cfg.chargeType)}</td>
                          <td className="px-3 py-3">{translateChargeMethod(cfg.chargeMethod)}</td>
                          <td className="px-3 py-3 font-bold text-[#3F594F]">{formatCurrency(cfg.unitPrice)}</td>
                          <td className="px-3 py-3">{cfg.effectiveFrom}</td>
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

      <ContractFormDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmitUpdate={async (input) => { await updateMutation.mutateAsync(input); }}
        rooms={[]}
        tenants={[]}
        editContract={contract}
        loading={updateMutation.isPending}
      />

      <ContractChargeConfigForm
        open={isChargeDialogOpen}
        onClose={() => setIsChargeDialogOpen(false)}
        onSubmit={async (input) => { await createChargeMutation.mutateAsync(input); }}
        editConfig={editingCharge}
        loading={createChargeMutation.isPending}
      />
    </div>
  );
};
