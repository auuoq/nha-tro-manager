import React from "react";
import { Link } from "react-router-dom";
import { Tenant } from "../types/tenant.types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Users, ArrowRight, Trash2 } from "lucide-react";

export interface TenantTableProps {
  tenants: Tenant[];
  onArchive: (tenantId: string) => void;
}

export const TenantTable: React.FC<TenantTableProps> = ({ tenants, onArchive }) => {
  if (tenants.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Chưa có khách thuê nào"
        description="Nhấn nút '+ Thêm Khách Thuê' ở trên để tạo hồ sơ khách thuê mới."
      />
    );
  }

  return (
    <div className="bg-white border border-[#E8E5DF] rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#252724]">
          <thead className="bg-[#F2EFE9]/60 text-[#73766F] font-semibold border-b border-[#E8E5DF]">
            <tr>
              <th className="px-5 py-3.5">Họ và Tên Khách Thuê</th>
              <th className="px-5 py-3.5">Số Điện Thoại</th>
              <th className="px-5 py-3.5">Số CCCD / CMND</th>
              <th className="px-5 py-3.5 text-center">Tài Khoản Đăng Nhập</th>
              <th className="px-5 py-3.5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2EFE9]">
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-[#F8F7F4] transition-colors">
                <td className="px-5 py-3.5 font-semibold text-[#252724]">
                  {t.fullName}
                  {t.hometown && <div className="text-[11px] font-normal text-[#73766F]">Quê quán: {t.hometown}</div>}
                </td>
                <td className="px-5 py-3.5 font-mono text-[#52554E]">{t.phone || "—"}</td>
                <td className="px-5 py-3.5 font-mono text-[#52554E]">{t.idCardNumber || "—"}</td>
                <td className="px-5 py-3.5 text-center">
                  {t.hasAccount ? (
                    t.isAccountActive ? (
                      <Badge variant="success">Đã cấp tài khoản</Badge>
                    ) : (
                      <Badge variant="danger">Đã tạm khóa</Badge>
                    )
                  ) : (
                    <Badge variant="neutral">Chưa có tài khoản</Badge>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right space-x-1.5">
                  <Link to={`/admin/tenants/${t.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      <span>Chi Tiết</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#73766F]" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#A84646] hover:bg-[#FDF0F0] p-2"
                    title="Lưu trữ khách thuê"
                    onClick={() => onArchive(t.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
