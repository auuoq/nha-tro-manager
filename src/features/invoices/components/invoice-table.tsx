"use client";

import React, { useState } from "react";
import Link from "next/link";
import { InvoiceItemDTOList } from "../types/invoice.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, translateInvoiceStatus } from "@/lib/formatters";
import { ManualPaymentDialog } from "@/features/payments/components/manual-payment-dialog";
import { Receipt, ArrowRight, DollarSign } from "lucide-react";

export interface InvoiceTableProps {
  invoices: InvoiceItemDTOList[];
  onRefresh?: () => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices, onRefresh }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<{ id: string; code: string; amount: number } | null>(null);

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Chưa có hóa đơn nào"
        description="Nhấn nút '+ Tạo Hóa Đơn DRAFT Mới' ở trên để khởi tạo bảng kê thu tiền tháng này."
      />
    );
  }

  return (
    <>
      <div className="bg-white border border-[#E8E5DF] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#252724]">
            <thead className="bg-[#F2EFE9]/60 text-[#73766F] font-semibold border-b border-[#E8E5DF]">
              <tr>
                <th className="px-5 py-3.5">Mã Hóa Đơn</th>
                <th className="px-5 py-3.5">Kỳ Thanh Toán</th>
                <th className="px-5 py-3.5">Cơ Sở & Phòng Trọ</th>
                <th className="px-5 py-3.5">Khách Đại Diện</th>
                <th className="px-5 py-3.5 text-right">Tổng Tiền Hóa Đơn</th>
                <th className="px-5 py-3.5 text-center">Trạng Thái</th>
                <th className="px-5 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9]">
              {invoices.map((inv) => {
                const statusInfo = translateInvoiceStatus(inv.status);
                const canRecordPayment = inv.status === "ISSUED" || inv.status === "PARTIALLY_PAID" || inv.status === "OVERDUE";

                return (
                  <tr key={inv.id} className="hover:bg-[#F8F7F4] transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-[#252724]">
                      {inv.invoiceCode}
                      {inv.revision > 1 && (
                        <span className="text-[10px] font-normal text-[#A36E35] ml-1">
                          (Lần {inv.revision})
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#52554E]">{inv.billingPeriod}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-[#252724]">Phòng {inv.roomNumber}</span>
                      <div className="text-[11px] text-[#73766F]">{inv.buildingName}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#252724]">{inv.primaryTenantName}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-[#252724]">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canRecordPayment && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs bg-[#EBF0ED] text-[#3F594F] hover:bg-[#D1E3D5] border border-[#D1E3D5] cursor-pointer"
                            onClick={() => setSelectedInvoice({ id: inv.id, code: inv.invoiceCode, amount: Number(inv.totalAmount) })}
                          >
                            <span>💵 Thu Tiền</span>
                          </Button>
                        )}
                        <Link href={`/admin/invoices/${inv.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            <span>Chi Tiết</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#73766F]" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <ManualPaymentDialog
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSuccess={() => {
            setSelectedInvoice(null);
            onRefresh?.();
          }}
          invoiceId={selectedInvoice.id}
          invoiceCode={selectedInvoice.code}
          defaultAmount={selectedInvoice.amount}
        />
      )}
    </>
  );
};
