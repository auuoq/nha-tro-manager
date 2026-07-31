import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Input } from "@/shared/components/ui/input";
import { tenantsApi } from "../api/tenants.api";
import { Tenant, TenantCreateInput } from "../types/tenant.types";
import { TenantTable } from "../components/tenant-table";
import { TenantFormDialog } from "../components/tenant-dialog";
import { Search } from "lucide-react";

export const TenantsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["tenants", { search, page }],
    queryFn: () => tenantsApi.list({ search: search || undefined, page, pageSize: 12 }),
  });

  const createMutation = useMutation({
    mutationFn: (input: TenantCreateInput) => tenantsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setIsDialogOpen(false);
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Tạo hồ sơ khách thuê thất bại");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TenantCreateInput }) => tenantsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setIsDialogOpen(false);
      setEditingTenant(null);
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Cập nhật hồ sơ thất bại");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tenantsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Lưu trữ hồ sơ thất bại");
    },
  });

  const handleFormSubmit = async (input: TenantCreateInput) => {
    setErrorMsg(null);
    if (editingTenant) {
      await updateMutation.mutateAsync({ id: editingTenant.id, data: input });
    } else {
      await createMutation.mutateAsync(input);
    }
  };

  const handleArchive = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn lưu trữ hồ sơ khách thuê này?")) {
      deleteMutation.mutate(id);
    }
  };

  const tenants = data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Hồ Sơ Khách Thuê Trọ"
        description="Toàn bộ danh sách hồ sơ khách thuê trọ và trạng thái tài khoản đăng nhập Portal"
        action={
          <Button variant="primary" onClick={() => { setEditingTenant(null); setIsDialogOpen(true); }}>
            + Thêm Khách Thuê
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E5DF] shadow-2xs flex items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Input
            placeholder="Tìm theo tên, SĐT, CCCD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-[#73766F] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <TenantTable tenants={tenants} onArchive={handleArchive} />
      )}

      <TenantFormDialog
        open={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setEditingTenant(null); }}
        onSubmit={handleFormSubmit}
        editTenant={editingTenant}
        loading={createMutation.isPending || updateMutation.isPending}
        error={errorMsg}
      />
    </div>
  );
};
