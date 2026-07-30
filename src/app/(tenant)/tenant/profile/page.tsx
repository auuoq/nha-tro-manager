"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TenantProfileForm, TenantDetailDTO, getOwnTenantProfileAction } from "@/features/tenants";

export default function TenantOwnProfilePage() {
  const [tenant, setTenant] = useState<TenantDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    const res = await getOwnTenantProfileAction();
    if (res.success && res.data) setTenant(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải hồ sơ của bạn...</div>;
  if (!tenant) return <div className="p-8 text-center text-red-600 font-semibold">Không tìm thấy hồ sơ cá nhân của bạn.</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Hồ Sơ Cá Nhân"
        description="Xem thông tin hợp đồng, tài khoản và cập nhật thông tin liên hệ của bạn"
      />
      <TenantProfileForm tenant={tenant} onSuccess={fetchProfile} />
    </div>
  );
}
