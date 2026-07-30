"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PaymentItemDTO } from "../types/payment.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDateTime, translatePaymentStatus, translatePaymentMethod } from "@/lib/formatters";
import { cancelPaymentAction } from "../actions/cancel-payment.action";
import { RefundPaymentDialog } from "./refund-payment-dialog";
import { CreditCard, RotateCcw, XCircle } from "lucide-react";

export interface PaymentListTableProps {
  payments: PaymentItemDTO[];
  isOwner?: boolean;
  onRefresh?: () => void;
}

export const PaymentListTable: React.FC<PaymentListTableProps> = ({
  payments,
  isOwner = true,
  onRefresh,
}) => {
  const [selectedRefund, setSelectedRefund] = useState<{ id: string; code: string; max: number } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCancel = async (p: PaymentItemDTO) => {
    const reason = prompt(`Nhập lý do hủy giao dịch ${p.paymentCode}:`);
    if (!reason || !reason.trim()) return;

    setLoadingId(p.id);
    const res = await cancelPaymentAction({ paymentId: p.id, cancellationReason: reason });
    setLoadingId(null);

    if (res.success) {
      if (onRefresh) onRefresh();
    } else {
      alert(res.error);
    }
  };

  if (payments.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Chưa có giao dịch thanh toán nào"
        description="Lịch sử giao dịch tiền mặt, chuyển khoản và webhook sẽ được ghi nhận tại đây."
      />
    );
  }

  return (
    <div className="bg-white border border-[#E8E5DF] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#252724]">
          <thead className="bg-[#F2EFE9]/60 text-[#73766F] font-semibold border-b border-[#E8E5DF]">
            <tr>
              <th className="px-5 py-3.5">Mã Giao Dịch</th>
              <th className="px-5 py-3.5">Hóa Đơn / Phòng</th>
              <th className="px-5 py-3.5 text-right">Số Tiền</th>
              <th className="px-5 py-3.5 text-right">Thực Nhận</th>
              <th className="px-5 py-3.5">Phương Thức</th>
              <th className="px-5 py-3.5 text-center">Trạng Thái</th>
              <th className="px-5 py-3.5">Thời Gian</th>
              {isOwner && <th className="px-5 py-3.5 text-right">Thao Tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2EFE9]">
            {payments.map((p) => {
              const statusInfo = translatePaymentStatus(p.status);
              const canCancel = isOwner && p.status === "CONFIRMED" && p.refundAmount === 0;
              const canRefund = isOwner && (p.status === "CONFIRMED" || p.status === "PARTIALLY_REFUNDED") && p.netAmount > 0;

              return (
                <tr key={p.id} className="hover:bg-[#F8F7F4] transition-colors">
                  <td className="px-5 py-3.5 font-mono font-semibold text-[#252724]">{p.paymentCode}</td>
                  <td className="px-5 py-3.5">
                    {isOwner ? (
                      <Link href={`/admin/invoices/${p.invoiceId}`} className="font-semibold text-[#3F594F] hover:underline">
                        {p.invoiceCode}
                      </Link>
                    ) : (
                      <span className="font-semibold text-[#252724]">{p.invoiceCode}</span>
                    )}
                    <span className="block text-[11px] text-[#73766F] mt-0.5">{p.buildingName} • Phòng {p.roomNumber}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-semibold text-[#252724]">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-semibold text-[#3E6148]">
                    {formatCurrency(p.netAmount)}
                    {p.refundAmount > 0 && (
                      <span className="block text-[10px] text-[#A84646] font-normal">(Đã hoàn {formatCurrency(p.refundAmount)})</span>
                    )}
                    {p.overpaymentAmount > 0 && (
                      <span className="block text-[10px] text-[#A36E35] font-normal">(Tiền dư {formatCurrency(p.overpaymentAmount)})</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-[#252724]">{translatePaymentMethod(p.method)}</span>
                    {p.transactionRef && (
                      <span className="block font-mono text-[10px] text-[#73766F] mt-0.5">{p.transactionRef}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-[#73766F] text-[11px]">
                    {formatDateTime(p.createdAt)}
                  </td>
                  {isOwner && (
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        {canRefund && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] text-[#A36E35] border-[#F2E0C9] hover:bg-[#FBF3E8]"
                            onClick={() => setSelectedRefund({ id: p.id, code: p.paymentCode, max: p.netAmount })}
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Hoàn Tiền</span>
                          </Button>
                        )}
                        {canCancel && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[11px] text-[#A84646] hover:bg-[#FDF0F0]"
                            onClick={() => handleCancel(p)}
                            isLoading={loadingId === p.id}
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Hủy</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedRefund && (
        <RefundPaymentDialog
          isOpen={!!selectedRefund}
          onClose={() => setSelectedRefund(null)}
          onSuccess={() => {
            setSelectedRefund(null);
            if (onRefresh) onRefresh();
          }}
          paymentId={selectedRefund.id}
          paymentCode={selectedRefund.code}
          maxRefundable={selectedRefund.max}
        />
      )}
    </div>
  );
};
