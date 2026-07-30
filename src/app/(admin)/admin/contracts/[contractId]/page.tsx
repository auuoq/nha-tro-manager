"use client";

import React, { useEffect, useState, use } from "react";
import {
  ContractDetailHeader,
  ContractStatusActions,
  ContractTenantList,
  ContractTenantDialog,
  ContractChargeConfigForm,
  ContractFormDialog,
  ContractDetailDTO,
  getContractDetailAction,
  removeContractMemberAction,
  OptionItem,
} from "@/features/contracts";
import { getRoomsAction } from "@/features/rooms";
import { getTenantsAction } from "@/features/tenants";

export default function ContractDetailPage({ params }: { params: Promise<{ contractId: string }> }) {
  const { contractId } = use(params);
  const [contract, setContract] = useState<ContractDetailDTO | null>(null);
  const [rooms, setRooms] = useState<OptionItem[]>([]);
  const [tenants, setTenants] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tenantDialogMode, setTenantDialogMode] = useState<"ADD_MEMBER" | "CHANGE_PRIMARY" | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    const res = await getContractDetailAction(contractId);
    if (res.success && res.data) setContract(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
    getRoomsAction().then((r) => r.success && r.data && setRooms(r.data.map((item) => ({ id: item.id, name: item.roomNumber }))));
    getTenantsAction().then((t) => t.success && t.data && setTenants(t.data.map((item) => ({ id: item.id, name: item.fullName }))));
  }, [contractId]);

  const handleRemoveMember = async (ctId: string) => {
    if (confirm("Ghi nhận khách thuê này rời khỏi hợp đồng?")) {
      const res = await removeContractMemberAction(ctId);
      if (res.success) fetchDetail();
      else alert(res.error);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải chi tiết hợp đồng...</div>;
  if (!contract) return <div className="p-8 text-center text-red-600 font-semibold">Hợp đồng không tồn tại hoặc bạn không có quyền truy cập.</div>;

  return (
    <div className="space-y-6">
      <ContractDetailHeader contract={contract} onEdit={() => setIsEditOpen(true)} />
      <ContractStatusActions contract={contract} onSuccess={fetchDetail} />
      <ContractTenantList
        tenants={contract.tenants}
        onAddMember={() => setTenantDialogMode("ADD_MEMBER")}
        onChangePrimary={() => setTenantDialogMode("CHANGE_PRIMARY")}
        onRemoveMember={handleRemoveMember}
      />
      <ContractChargeConfigForm
        contractId={contract.id}
        contractChargeConfigs={contract.chargeConfigs}
        roomOverrideChargeConfigs={contract.roomOverrideChargeConfigs}
        buildingDefaultChargeConfigs={contract.buildingDefaultChargeConfigs}
        onSuccess={fetchDetail}
      />
      <ContractFormDialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSuccess={fetchDetail} rooms={rooms} tenants={tenants} editContract={contract} />
      {tenantDialogMode && (
        <ContractTenantDialog isOpen={true} onClose={() => setTenantDialogMode(null)} onSuccess={fetchDetail} contractId={contract.id} tenants={tenants} mode={tenantDialogMode} />
      )}
    </div>
  );
}
