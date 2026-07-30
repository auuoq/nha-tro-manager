"use client";

import React from "react";
import { OwnerItemDTO } from "../types/owner.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { translateUserRole } from "@/lib/formatters";
import { Users, Lock, Unlock } from "lucide-react";

export interface OwnerListProps {
  owners: OwnerItemDTO[];
  onSuspend: (ownerUserId: string) => void;
  onReactivate: (ownerUserId: string) => void;
}

export const OwnerList: React.FC<OwnerListProps> = ({ owners, onSuspend, onReactivate }) => {
  if (owners.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Chưa có tài khoản Chủ nhà (Owner) nào"
        description="Nhấn nút '+ Tạo Tài Khoản Owner' ở trên để cấp tài khoản mới."
      />
    );
  }

  return (
    <div className="bg-white border border-[#E8E5DF] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#252724]">
          <thead className="bg-[#F2EFE9]/60 text-[#73766F] font-semibold border-b border-[#E8E5DF]">
            <tr>
              <th className="px-5 py-3.5">Họ và Tên Chủ Nhà</th>
              <th className="px-5 py-3.5">Số Điện Thoại</th>
              <th className="px-5 py-3.5">Quy Mô Quản Lý</th>
              <th className="px-5 py-3.5 text-center">Trạng Thái</th>
              <th className="px-5 py-3.5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2EFE9]">
            {owners.map((owner) => (
              <tr key={owner.id} className="hover:bg-[#F8F7F4] transition-colors">
                <td className="px-5 py-3.5 font-semibold text-[#252724]">
                  {owner.fullName}
                  {owner.profile?.businessName && (
                    <div className="text-[11px] font-normal text-[#73766F]">{owner.profile.businessName}</div>
                  )}
                </td>
                <td className="px-5 py-3.5 font-mono text-[#52554E]">{owner.phone}</td>
                <td className="px-5 py-3.5 font-semibold text-[#3F594F]">{owner.buildingsCount} tòa nhà</td>
                <td className="px-5 py-3.5 text-center">
                  <Badge variant={owner.isActive ? "success" : "danger"}>
                    {owner.isActive ? "Đang hoạt động" : "Tạm khóa"}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-right">
                  {owner.isActive ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-[#A84646] hover:bg-[#FDF0F0]"
                      onClick={() => onSuspend(owner.id)}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Tạm Khóa</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-[#3E6148] border-[#D1E3D5] hover:bg-[#EBF3ED]"
                      onClick={() => onReactivate(owner.id)}
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Mở Khóa</span>
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
