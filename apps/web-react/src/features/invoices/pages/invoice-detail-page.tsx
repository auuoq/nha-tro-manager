import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { invoicesApi } from "../api/invoices.api";
import { ManualInvoiceItemInput, ApplyDiscountInput } from "../types/invoice.types";
import { formatCurrency } from "@/shared/lib/formatters";
import { InvoiceStatusActions } from "../components/invoice-status-actions";
import { InvoiceItemsSection } from "../components/invoice-items-section";
import { InvoiceDiscountDialog } from "../components/invoice-discount-dialog";
import { ArrowLeft, DollarSign } from "lucide-react";

export const InvoiceDetailPage: React.FC = () => {
  const { invoiceId = "" } = useParams<{ invoiceId: string }>();
  const queryClient = useQueryClient();

  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => invoicesApi.getById(invoiceId),
    enabled: Boolean(invoiceId),
  });

  const recalculateMutation = useMutation({
    mutationFn: () => invoicesApi.recalculate(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
    },
  });

  const issueMutation = useMutation({
    mutationFn: () => invoicesApi.issue(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (reason?: string) => invoicesApi.cancel(invoiceId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const reissueMutation = useMutation({
    mutationFn: () => invoicesApi.reissue(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: (item: ManualInvoiceItemInput) => invoicesApi.addItem(invoiceId, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => invoicesApi.deleteItem(invoiceId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
    },
  });

  const discountMutation = useMutation({
    mutationFn: (data: ApplyDiscountInput) => invoicesApi.applyDiscount(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center text-[#A84646] bg-[#FDF0F0] rounded-2xl border border-[#F5D5D5]">
        Hóa đơn không tồn tại hoặc bạn không có quyền truy cập.
      </div>
    );
  }

  const isDraft = invoice.status === "DRAFT";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/admin/invoices" className="text-xs text-[#73766F] hover:text-[#3F594F] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách hóa đơn
        </Link>
      </div>

      <PageHeader
        title={`Hóa Đơn: ${invoice.invoiceCode}`}
        description={`Phòng ${invoice.roomNumber || "-"} • Kỳ ${invoice.billingPeriod}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Status Actions & Totals */}
        <div className="space-y-6 lg:col-span-1">
          <InvoiceStatusActions
            invoice={invoice}
            onRecalculate={async () => { await recalculateMutation.mutateAsync(undefined); }}
            onIssue={async () => { await issueMutation.mutateAsync(undefined); }}
            onCancel={async () => { await cancelMutation.mutateAsync(undefined); }}
            onReissue={async () => { await reissueMutation.mutateAsync(undefined); }}
            onOpenDiscount={() => setIsDiscountDialogOpen(true)}
            loading={issueMutation.isPending || cancelMutation.isPending}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#3F594F]" /> Tổng Kết Hóa Đơn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-[#73766F]">
              <div className="flex justify-between py-1 border-b border-[#F2EFE9]">
                <span>Nợ cũ mang sang:</span>
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
                <span>TỔNG TIỀN PHẢI THU:</span>
                <span className="font-mono text-[#3F594F]">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between py-1 text-[#3E6148]">
                <span>Đã thanh toán:</span>
                <span className="font-mono font-bold">{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between py-1 text-[#A84646]">
                <span>CÒN LẠI PHẢI ĐÓNG:</span>
                <span className="font-mono font-bold">{formatCurrency(invoice.remainingAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Invoice Items */}
        <div className="lg:col-span-2 space-y-6">
          <InvoiceItemsSection
            items={invoice.items || []}
            isDraft={isDraft}
            onAddItem={async (item) => { await addItemMutation.mutateAsync(item); }}
            onDeleteItem={async (itemId) => { await deleteItemMutation.mutateAsync(itemId); }}
            loading={addItemMutation.isPending}
          />
        </div>
      </div>

      <InvoiceDiscountDialog
        open={isDiscountDialogOpen}
        onClose={() => setIsDiscountDialogOpen(false)}
        onSubmit={async (data) => { await discountMutation.mutateAsync(data); }}
        currentDiscount={invoice.discountAmount}
        loading={discountMutation.isPending}
      />
    </div>
  );
};
