"use client";

import React, { useEffect, useState, use } from "react";
import {
  TenantDetailHeader,
  TenantAccountCard,
  TenantIdCardSection,
  TenantFormDialog,
  TenantDetailDTO,
  getTenantDetailAction,
} from "@/features/tenants";

export default function TenantDetailPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = use(params);
  const [tenant, setTenant] = useState<TenantDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    const res = await getTenantDetailAction(tenantId);
    if (res.success && res.data) setTenant(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [tenantId]);

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải chi tiết hồ sơ khách thuê...</div>;
  if (!tenant) return <div className="p-8 text-center text-red-600 font-semibold">Hồ sơ không tồn tại hoặc bạn không có quyền truy cập.</div>;

  return (
    <div className="space-y-6">
      <TenantDetailHeader tenant={tenant} onEdit={() => setIsEditOpen(true)} />
      <TenantAccountCard tenant={tenant} onSuccess={fetchDetail} />
      <TenantIdCardSection tenant={tenant} onSuccess={fetchDetail} />
      <TenantFormDialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSuccess={fetchDetail} editTenant={tenant} />
    </div>
  );
}
