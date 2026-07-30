"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OwnerList, CreateOwnerDialog, OwnerItemDTO, getOwnersAction, suspendOwnerAction, reactivateOwnerAction } from "@/features/owners";
import { Plus } from "lucide-react";

export default function SuperAdminOwnersPage() {
  const [owners, setOwners] = useState<OwnerItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchOwners = async () => {
    setLoading(true);
    const res = await getOwnersAction();
    if (res.success && res.data) {
      setOwners(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleSuspend = async (ownerUserId: string) => {
    if (confirm("Bạn có chắc chắn muốn tạm khóa tài khoản Chủ nhà này?")) {
      const res = await suspendOwnerAction(ownerUserId, "Khóa tài khoản bởi Super Admin");
      if (res.success) fetchOwners();
    }
  };

  const handleReactivate = async (ownerUserId: string) => {
    const res = await reactivateOwnerAction(ownerUserId);
    if (res.success) fetchOwners();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Quản Lý Chủ Nhà (Owners)"
        description="Tạo tài khoản Chủ nhà mới, cấp mật khẩu tạm và quản lý trạng thái tài khoản"
        action={
          <Button variant="primary" size="md" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>Tạo Tài Khoản Owner</span>
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : (
        <OwnerList owners={owners} onSuspend={handleSuspend} onReactivate={handleReactivate} />
      )}

      <CreateOwnerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchOwners}
      />
    </div>
  );
}
