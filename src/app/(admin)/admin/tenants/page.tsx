"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TenantListSection, TenantFormDialog, TenantItemDTO, getTenantsAction, archiveTenantAction } from "@/features/tenants";

export default function OwnerTenantsPage() {
  const [tenants, setTenants] = useState<TenantItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    const res = await getTenantsAction();
    if (res.success && res.data) setTenants(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleArchive = async (tenantId: string) => {
    if (confirm("Bạn có chắc chắn muốn lưu trữ hồ sơ khách thuê này?")) {
      const res = await archiveTenantAction(tenantId);
      if (res.success) fetchTenants();
      else alert(res.error);
    }
  };

  return (
    <div>
      <PageHeader
        title="Quản Lý Hồ Sơ Khách Thuê Trọ"
        description="Toàn bộ danh sách hồ sơ khách thuê trọ và trạng thái tài khoản đăng nhập Portal"
        action={<Button variant="primary" onClick={() => setIsDialogOpen(true)}>+ Thêm Khách Thuê</Button>}
      />

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">Đang tải danh sách khách thuê...</div>
      ) : (
        <TenantListSection tenants={tenants} onArchive={handleArchive} />
      )}

      <TenantFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchTenants}
      />
    </div>
  );
}
