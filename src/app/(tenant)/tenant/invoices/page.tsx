"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate, translateInvoiceStatus } from "@/lib/formatters";
import { InvoiceItemDTOList, getTenantInvoicesAction } from "@/features/invoices";
import { Receipt, ArrowRight } from "lucide-react";

export default function TenantInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItemDTOList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantInvoicesAction().then((res) => {
      if (res.success && res.data) setInvoices(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Hóa Đơn Tiền Phòng Của Tôi" description="Danh sách hóa đơn hàng tháng" />
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Hóa Đơn Tiền Phòng Của Tôi"
        description="Danh sách hóa đơn tiền thuê phòng, điện, nước và dịch vụ hàng tháng"
      />

      {invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Chưa có hóa đơn nào"
          description="Hiện tại bạn không có hóa đơn tiền phòng nào được phát hành."
        />
      ) : (
        <div className="bg-white border border-[#E8E5DF] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#252724]">
              <thead className="bg-[#F2EFE9]/60 text-[#73766F] font-semibold border-b border-[#E8E5DF]">
                <tr>
                  <th className="px-5 py-3.5">Mã Hóa Đơn</th>
                  <th className="px-5 py-3.5">Kỳ Thanh Toán</th>
                  <th className="px-5 py-3.5">Tổng Tiền</th>
                  <th className="px-5 py-3.5">Đã Trả</th>
                  <th className="px-5 py-3.5">Còn Thiếu</th>
                  <th className="px-5 py-3.5">Hạn Thanh Toán</th>
                  <th className="px-5 py-3.5 text-center">Trạng Thái</th>
                  <th className="px-5 py-3.5 text-right">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EFE9]">
                {invoices.map((inv) => {
                  const statusInfo = translateInvoiceStatus(inv.status);
                  return (
                    <tr key={inv.id} className="hover:bg-[#F8F7F4] transition-colors">
                      <td className="px-5 py-3.5 font-mono font-semibold text-[#252724]">{inv.invoiceCode}</td>
                      <td className="px-5 py-3.5 font-medium text-[#52554E]">{inv.billingPeriod}</td>
                      <td className="px-5 py-3.5 font-semibold text-[#252724]">{formatCurrency(inv.totalAmount)}</td>
                      <td className="px-5 py-3.5 font-medium text-[#3E6148]">{formatCurrency(inv.paidAmount)}</td>
                      <td className="px-5 py-3.5 font-semibold text-[#A84646]">{formatCurrency(inv.remainingAmount)}</td>
                      <td className="px-5 py-3.5 text-[#73766F]">{formatDate(inv.dueDate)}</td>
                      <td className="px-5 py-3.5 text-center">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/tenant/invoices/${inv.id}`} className="text-xs font-semibold text-[#3F594F] hover:underline inline-flex items-center gap-1">
                          <span>Chi tiết</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
