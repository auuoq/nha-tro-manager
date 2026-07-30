"use client";

import React from "react";
import Link from "next/link";
import { TenantDetailDTO } from "../types/tenant.types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface TenantDetailHeaderProps {
  tenant: TenantDetailDTO;
  onEdit: () => void;
}

export const TenantDetailHeader: React.FC<TenantDetailHeaderProps> = ({ tenant, onEdit }) => {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Link href="/admin/tenants" className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
          ← Quay lại Danh sách Khách Thuê
        </Link>
        <div className="flex gap-2">
          {tenant.hasAccount ? (
            tenant.isAccountActive ? (
              <Badge variant="success">Account Hoạt Động</Badge>
            ) : (
              <Badge variant="danger">Account Đang Khóa</Badge>
            )
          ) : (
            <Badge variant="neutral">Chưa Có Account</Badge>
          )}
        </div>
      </div>

      <PageHeader
        title={tenant.fullName}
        description={`SĐT: ${tenant.phone || "Chưa cập nhật"} • CCCD: ${tenant.idCardNumber || "Chưa cập nhật"} • Quê quán: ${tenant.hometown || "Chưa cập nhật"}`}
        action={
          <Button variant="outline" size="sm" onClick={onEdit}>
            ✏️ Sửa Hồ Sơ
          </Button>
        }
      />
    </div>
  );
};
