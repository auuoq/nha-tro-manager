import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Select } from "@/shared/components/ui/select";
import { contractsApi } from "../api/contracts.api";
import { roomsApi } from "@/features/rooms/api/rooms.api";
import { tenantsApi } from "@/features/tenants/api/tenants.api";
import { Contract, ContractCreateInput, ContractStatus } from "../types/contract.types";
import { ContractTable } from "../components/contract-table";
import { ContractFormDialog } from "../components/contract-dialog";

export const ContractsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: roomsData } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => roomsApi.list({ page: 1, pageSize: 100 }),
  });
  const rooms = (roomsData?.items || []).map((r) => ({ id: r.id, name: `Phòng ${r.roomNumber}` }));

  const { data: tenantsData } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => tenantsApi.list({ page: 1, pageSize: 100 }),
  });
  const tenants = (tenantsData?.items || []).map((t) => ({ id: t.id, name: t.fullName }));

  const { data, isLoading } = useQuery({
    queryKey: ["contracts", { status: selectedStatus, page }],
    queryFn: () =>
      contractsApi.list({
        status: (selectedStatus as ContractStatus) || undefined,
        page,
        pageSize: 12,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (input: ContractCreateInput) => contractsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      setIsDialogOpen(false);
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Tạo hợp đồng thất bại");
    },
  });

  const handleCreateSubmit = async (input: ContractCreateInput) => {
    setErrorMsg(null);
    await createMutation.mutateAsync(input);
  };

  const contracts = data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Hợp Đồng Thuê Trọ"
        description="Danh sách hợp đồng thuê trọ và theo dõi vòng đời DRAFT -> ACTIVE -> TERMINATED"
        action={
          <Button variant="primary" onClick={() => { setEditingContract(null); setIsDialogOpen(true); }}>
            + Tạo Hợp Đồng Mới
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E5DF] shadow-2xs flex items-center justify-between">
        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">-- Tất cả trạng thái --</option>
          <option value="DRAFT">Nháp (DRAFT)</option>
          <option value="ACTIVE">Hiệu lực (ACTIVE)</option>
          <option value="EXPIRING">Sắp hết hạn (EXPIRING)</option>
          <option value="TERMINATED">Kết thúc (TERMINATED)</option>
          <option value="CANCELLED">Đã hủy (CANCELLED)</option>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <ContractTable contracts={contracts} />
      )}

      <ContractFormDialog
        open={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setEditingContract(null); }}
        onSubmitCreate={handleCreateSubmit}
        rooms={rooms}
        tenants={tenants}
        editContract={editingContract}
        loading={createMutation.isPending}
        error={errorMsg}
      />
    </div>
  );
};
