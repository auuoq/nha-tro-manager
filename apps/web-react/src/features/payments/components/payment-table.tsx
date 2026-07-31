import React from "react";
import { Link } from "react-router-dom";
import { Payment } from "../types/payment.types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { formatCurrency, formatDate, translatePaymentStatus, translatePaymentMethod } from "@/shared/lib/formatters";
import { CreditCard, ArrowRight } from "lucide-react";

export interface PaymentTableProps {
  payments: Payment[];
  isTenantView?: boolean;
}

export const PaymentTable: React.FC<PaymentTableProps> = ({ payments, isTenantView = false }) => {
  if (payments.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Chưa có giao dịch thanh toán nào"
        description={isTenantView ? "Bạn chưa có giao dịch thanh toán nào." : "Nhấn '+ Ghi Nhận Thanh Toán' để tạo giao dịch thanh toán mới."}
      />
    );
  }

  return (
    <div className="bg-white border border-[#E8E5DF] rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#252724]">
          <thead className="bg-[#F2EFE9]/60 text-[#73766F] font-semibold border-b border-[#E8E5DF]">
            <tr>
              <th className="px-5 py-3.5">Mã Thanh Toán</th>
              <th className="px-5 py-3.5">Hóa Đơn / Phòng</th>
              <th className="px-5 py-3.5">Phương Thức</th>
              <th className="px-5 py-3.5">Ngày Thanh Toán</th>
              <th className="px-5 py-3.5 text-right">Số Tiền (VNĐ)</th>
              <th className="px-5 py-3.5 text-center">Trạng Thái</th>
              <th className="px-5 py-3.5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2EFE9]">
            {payments.map((p) => {
              const statusInfo = translatePaymentStatus(p.status);
              const detailUrl = `/admin/payments/${p.id}`;

              return (
                <tr key={p.id} className="hover:bg-[#F8F7F4] transition-colors">
                  <td className="px-5 py-3.5 font-mono font-semibold text-[#252724]">{p.paymentCode || p.id.slice(0, 8)}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-[#252724] block">HĐ: {p.invoiceCode || "-"}</span>
                    {p.roomNumber && <span className="text-[11px] text-[#73766F]">Phòng {p.roomNumber}</span>}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-[#52554E]">{translatePaymentMethod(p.method)}</td>
                  <td className="px-5 py-3.5 font-mono text-[#52554E]">{formatDate(p.paidAt)}</td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-[#3F594F]">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {!isTenantView && (
                      <Link to={detailUrl}>
                        <Button variant="outline" size="sm" className="text-xs">
                          <span>Chi Tiết</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#73766F]" />
                        </Button>
                      </Link>
                    )}
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
