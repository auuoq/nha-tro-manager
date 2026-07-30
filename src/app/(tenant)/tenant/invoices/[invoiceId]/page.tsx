"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, translateInvoiceStatus } from "@/lib/formatters";
import { InvoiceDetailDTO, InvoiceVietQRCard, getTenantInvoiceDetailAction } from "@/features/invoices";
import { ArrowLeft } from "lucide-react";

export default function TenantInvoiceDetailPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = use(params);
  const [invoice, setInvoice] = useState<InvoiceDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantInvoiceDetailAction(invoiceId).then((res) => {
      if (res.success && res.data) setInvoice(res.data);
      setLoading(false);
    });
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center text-[#A84646] font-semibold bg-[#FDF0F0] rounded-2xl border border-[#F5D5D5]">
        Hóa đơn không tồn tại hoặc bạn không có quyền xem.
      </div>
    );
  }

  const statusInfo = translateInvoiceStatus(invoice.status);

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between">
        <Link href="/tenant/invoices" className="text-xs font-medium text-[#73766F] hover:text-[#252724] inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại danh sách hóa đơn</span>
        </Link>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-[#252724] tracking-tight">Hóa Đơn {invoice.invoiceCode}</h1>
        <p className="text-xs text-[#73766F] mt-1">
          Kỳ: {invoice.billingPeriod} • {invoice.buildingName} • Phòng {invoice.roomNumber} • Hạn TT: {formatDate(invoice.dueDate)}
        </p>
      </div>

      <Card title="Chi Tiết Các Khoản Thu">
        <div className="divide-y divide-[#F2EFE9] text-xs">
          {invoice.items.map((i) => (
            <div key={i.id} className="py-3 flex items-center justify-between hover:bg-[#F8F7F4] px-2 rounded-xl transition-colors">
              <div>
                <span className="font-semibold text-[#252724]">{i.description}</span>
                <div className="text-[#73766F] text-[11px] mt-0.5">
                  {i.quantity} {i.unit} × {formatCurrency(i.unitPrice)}
                  {i.previousReading !== null && (
                    <span className="ml-1.5 font-mono text-[#52554E]">({i.previousReading} ➔ {i.currentReading})</span>
                  )}
                </div>
              </div>
              <span className="font-semibold text-[#252724] font-mono">{formatCurrency(i.amount)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Tổng Cộng & Thanh Toán">
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between text-[#73766F]">
            <span>Tổng khoản thu kỳ này:</span>
            <span className="font-semibold font-mono text-[#252724]">{formatCurrency(invoice.subtotalAmount)}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between text-[#3E6148] font-semibold">
              <span>Giảm giá:</span>
              <span className="font-mono">-{formatCurrency(invoice.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-2.5 border-t border-b border-[#E8E5DF] font-bold bg-[#F8F7F4] px-3 rounded-xl">
            <span className="text-[#252724]">Tiền Hóa Đơn Kỳ Này:</span>
            <span className="font-mono text-[#3F594F] text-sm">{formatCurrency(invoice.totalAmount)}</span>
          </div>
          {invoice.previousOutstandingAmount > 0 && (
            <div className="flex justify-between text-[#A36E35] font-semibold">
              <span>Nợ cũ chưa thanh toán:</span>
              <span className="font-mono">{formatCurrency(invoice.previousOutstandingAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-[#EBF3ED] px-4 rounded-xl border border-[#D1E3D5] font-bold">
            <span className="text-[#3E6148]">TỔNG PHẢI THANH TOÁN:</span>
            <span className="font-mono text-[#3E6148] text-base">{formatCurrency(invoice.totalAmountDue)}</span>
          </div>
          <div className="flex justify-between text-[#3E6148] font-medium pt-1">
            <span>Đã thanh toán:</span>
            <span className="font-mono font-semibold">{formatCurrency(invoice.paidAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1">
            <span className="text-[#252724]">Còn cần thanh toán:</span>
            <span className="font-mono text-[#A84646]">{formatCurrency(invoice.remainingAmount)}</span>
          </div>
        </div>
      </Card>

      <InvoiceVietQRCard invoice={invoice} />
    </div>
  );
}
