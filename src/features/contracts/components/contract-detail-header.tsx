"use client";

import React from "react";
import Link from "next/link";
import { ContractDetailDTO } from "../types/contract.types";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ContractDetailHeaderProps {
  contract: ContractDetailDTO;
  onEdit: () => void;
}

export const ContractDetailHeader: React.FC<ContractDetailHeaderProps> = ({ contract, onEdit }) => {
  const statusBadgeVariant = {
    DRAFT: "warning" as const,
    ACTIVE: "success" as const,
    EXPIRING: "warning" as const,
    TERMINATED: "neutral" as const,
    CANCELLED: "danger" as const,
  };

  const statusLabel = {
    DRAFT: "Bản Nháp (DRAFT)",
    ACTIVE: "Đang Hiệu Lực",
    EXPIRING: "Sắp Hết Hạn",
    TERMINATED: "Đã Thanh Lý",
    CANCELLED: "Đã Hủy",
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Link href="/admin/contracts" className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
          ← Quay lại Danh sách Hợp Đồng
        </Link>
        <Badge variant={statusBadgeVariant[contract.status]}>{statusLabel[contract.status]}</Badge>
      </div>

      <PageHeader
        title={`Hợp Đồng ${contract.contractCode}`}
        description={`${contract.buildingName} • Phòng ${contract.roomNumber} • Đại diện: ${contract.primaryTenantName} • Giá thuê: ${contract.monthlyPrice.toLocaleString("vi-VN")}đ/tháng • Tiền cọc: ${contract.depositAmount.toLocaleString("vi-VN")}đ`}
        action={
          contract.status === "DRAFT" ? (
            <Button variant="outline" size="sm" onClick={onEdit}>
              ✏️ Sửa Hợp Đồng Nháp
            </Button>
          ) : undefined
        }
      />
    </div>
  );
};
