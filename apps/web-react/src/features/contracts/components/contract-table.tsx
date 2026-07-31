import React from "react";
import { Link } from "react-router-dom";
import { Contract } from "../types/contract.types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { formatCurrency, formatDate, translateContractStatus } from "@/shared/lib/formatters";
import { FileText, ArrowRight } from "lucide-react";

export interface ContractTableProps {
  contracts: Contract[];
}

export const ContractTable: React.FC<ContractTableProps> = ({ contracts }) => {
  if (contracts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Chưa có hợp đồng thuê trọ nào"
        description="Nhấn nút '+ Tạo Hợp Đồng Mới' ở trên để khởi tạo hợp đồng cho phòng trọ."
      />
    );
  }

  return (
    <div className="bg-white border border-[#E8E5DF] rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#252724]">
          <thead className="bg-[#F2EFE9]/60 text-[#73766F] font-semibold border-b border-[#E8E5DF]">
            <tr>
              <th className="px-5 py-3.5">Mã Hợp Đồng</th>
              <th className="px-5 py-3.5">Phòng Trọ & Cơ Sở</th>
              <th className="px-5 py-3.5">Khách Đại Diện</th>
              <th className="px-5 py-3.5">Thời Hạn Thuê</th>
              <th className="px-5 py-3.5">Giá Thuê / Tiền Cọc</th>
              <th className="px-5 py-3.5 text-center">Trạng Thái</th>
              <th className="px-5 py-3.5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2EFE9]">
            {contracts.map((c) => {
              const statusInfo = translateContractStatus(c.status);
              return (
                <tr key={c.id} className="hover:bg-[#F8F7F4] transition-colors">
                  <td className="px-5 py-3.5 font-mono font-semibold text-[#252724]">{c.contractCode}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-[#252724]">Phòng {c.roomNumber || "-"}</span>
                    <div className="text-[11px] text-[#73766F]">{c.buildingName || "-"}</div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-[#252724]">
                    {c.primaryTenantName || "Chưa gán"}
                    <div className="text-[11px] text-[#73766F] font-normal">Tổng {c.tenantsCount || 1} thành viên</div>
                  </td>
                  <td className="px-5 py-3.5 text-[#52554E]">
                    {formatDate(c.startDate)} ➔ {formatDate(c.endDate)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-[#252724] block">{formatCurrency(c.monthlyPrice)} / tháng</span>
                    <span className="text-[#73766F] text-[11px]">Tiền cọc: {formatCurrency(c.depositAmount)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to={`/admin/contracts/${c.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        <span>Chi Tiết</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#73766F]" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
