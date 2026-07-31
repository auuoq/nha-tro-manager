import React from "react";
import { Link } from "react-router-dom";
import { Invoice } from "../types/invoice.types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { formatCurrency, translateInvoiceStatus } from "@/shared/lib/formatters";
import { Receipt, ArrowRight } from "lucide-react";

export interface InvoiceTableProps {
  invoices: Invoice[];
  isTenantView?: boolean;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices, isTenantView = false }) => {
  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Chưa có hóa đơn nào"
        description={isTenantView ? "Bạn chưa có hóa đơn thanh toán nào." : "Nhấn '+ Tạo Hóa Đơn Nháp' ở trên để lập hóa đơn."}
      />
    );
  }

  return (
    <div className="bg-white border border-[#E8E5DF] rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#252724]">
          <thead className="bg-[#F2EFE9]/60 text-[#73766F] font-semibold border-b border-[#E8E5DF]">
            <tr>
              <th className="px-5 py-3.5">Mã Hóa Đơn</th>
              <th className="px-5 py-3.5">Phòng Trọ & Tòa Nhà</th>
              <th className="px-5 py-3.5">Kỳ Thanh Toán</th>
              <th className="px-5 py-3.5 text-right">Tổng Tiền (VNĐ)</th>
              <th className="px-5 py-3.5 text-right">Còn Lại</th>
              <th className="px-5 py-3.5 text-center">Trạng Thái</th>
              <th className="px-5 py-3.5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2EFE9]">
            {invoices.map((inv) => {
              const statusInfo = translateInvoiceStatus(inv.status);
              const detailUrl = isTenantView ? `/tenant/invoices/${inv.id}` : `/admin/invoices/${inv.id}`;

              return (
                <tr key={inv.id} className="hover:bg-[#F8F7F4] transition-colors">
                  <td className="px-5 py-3.5 font-mono font-semibold text-[#252724]">{inv.invoiceCode}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-[#252724]">Phòng {inv.roomNumber || "-"}</span>
                    <div className="text-[11px] text-[#73766F]">{inv.buildingName || "-"}</div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[#52554E]">{inv.billingPeriod}</td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-[#252724]">
                    {formatCurrency(inv.totalAmount)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-[#3F594F]">
                    {formatCurrency(inv.remainingAmount)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to={detailUrl}>
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
