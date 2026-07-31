import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { invoicesApi } from "../api/invoices.api";
import { formatCurrency, translateInvoiceStatus } from "@/shared/lib/formatters";
import { InvoiceItemsSection } from "../components/invoice-items-section";
import { DollarSign } from "lucide-react";

export const TenantInvoiceDetailPage: React.FC = () => {
  const { invoiceId = "" } = useParams<{ invoiceId: string }>();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["tenant-invoice", invoiceId],
    queryFn: () => invoicesApi.getTenantInvoice(invoiceId),
    enabled: Boolean(invoiceId),
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center text-[#A84646] bg-[#FDF0F0] rounded-2xl border border-[#F5D5D5]">
        Hóa đơn không tồn tại hoặc bạn không có quyền xem hóa đơn này.
      </div>
    );
  }

  const statusInfo = translateInvoiceStatus(invoice.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hóa Đơn: ${invoice.invoiceCode}`}
        description={`Kỳ thanh toán: ${invoice.billingPeriod}`}
        action={<Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#3F594F]" /> Tổng Kết Chi Phí
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-[#73766F]">
              <div className="flex justify-between py-1 border-b border-[#F2EFE9]">
                <span>Nợ cũ:</span>
                <span className="font-mono font-medium text-[#252724]">{formatCurrency(invoice.previousOutstandingAmount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F2EFE9]">
                <span>Cộng phát sinh:</span>
                <span className="font-mono font-medium text-[#252724]">{formatCurrency(invoice.subtotalAmount)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between py-1 border-b border-[#F2EFE9] text-[#A84646]">
                  <span>Giảm giá:</span>
                  <span className="font-mono font-bold">-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 font-bold text-sm text-[#252724] border-b border-[#E8E5DF]">
                <span>TỔNG THANH TOÁN:</span>
                <span className="font-mono text-[#3F594F]">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between py-1 text-[#3E6148]">
                <span>Đã thanh toán:</span>
                <span className="font-mono font-bold">{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between py-1 text-[#A84646]">
                <span>CÒN LẠI CẦN THANH TOÁN:</span>
                <span className="font-mono font-bold">{formatCurrency(invoice.remainingAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <InvoiceItemsSection items={invoice.items || []} isDraft={false} onAddItem={async () => {}} onDeleteItem={async () => {}} />
        </div>
      </div>
    </div>
  );
};
