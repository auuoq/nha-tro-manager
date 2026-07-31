import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { tenantsApi } from "../api/tenants.api";
import { TenantFormDialog } from "../components/tenant-dialog";
import { TenantAccountCard } from "../components/tenant-account-card";
import { TenantCreateInput } from "../types/tenant.types";
import { ArrowLeft, User, Edit2 } from "lucide-react";

export const TenantDetailPage: React.FC = () => {
  const { tenantId = "" } = useParams<{ tenantId: string }>();
  const queryClient = useQueryClient();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: () => tenantsApi.getById(tenantId),
    enabled: Boolean(tenantId),
  });

  const updateMutation = useMutation({
    mutationFn: (input: TenantCreateInput) => tenantsApi.update(tenantId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
      setIsEditDialogOpen(false);
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Cập nhật hồ sơ thất bại");
    },
  });

  const handleUpdateSubmit = async (input: TenantCreateInput) => {
    setErrorMsg(null);
    await updateMutation.mutateAsync(input);
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (!tenant) {
    return (
      <div className="p-8 text-center text-[#A84646] bg-[#FDF0F0] rounded-2xl border border-[#F5D5D5]">
        Hồ sơ khách thuê không tồn tại hoặc bạn không có quyền truy cập.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/admin/tenants" className="text-xs text-[#73766F] hover:text-[#3F594F] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách khách thuê
        </Link>
      </div>

      <PageHeader
        title={`Chi Tiết Khách Thuê: ${tenant.fullName}`}
        description={`SĐT: ${tenant.phone || "Chưa cập nhật"} • CCCD: ${tenant.idCardNumber || "Chưa cập nhật"}`}
        action={
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit2 className="w-3.5 h-3.5" /> Sửa Hồ Sơ
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info Card */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#3F594F]" /> Thông Tin Cá Nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-[#73766F]">
              <div>
                <span className="font-semibold text-[#252724] block">Họ và tên:</span>
                <span>{tenant.fullName}</span>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Giới tính:</span>
                <span>{tenant.gender || "Chưa cập nhật"}</span>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Số điện thoại:</span>
                <span className="font-mono text-[#252724]">{tenant.phone || "—"}</span>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Số CCCD/CMND:</span>
                <span className="font-mono text-[#252724]">{tenant.idCardNumber || "—"}</span>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Quê quán:</span>
                <span>{tenant.hometown || "Chưa cập nhật"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Account Management */}
        <div className="lg:col-span-2 space-y-6">
          <TenantAccountCard
            tenant={tenant}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] })}
          />
        </div>
      </div>

      <TenantFormDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleUpdateSubmit}
        editTenant={tenant}
        loading={updateMutation.isPending}
        error={errorMsg}
      />
    </div>
  );
};
