import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { paymentsApi } from "../api/payments.api";
import { RefundPaymentInput } from "../types/payment.types";
import { formatCurrency, formatDate, translatePaymentStatus, translatePaymentMethod } from "@/shared/lib/formatters";
import { PaymentCancelDialog } from "../components/payment-cancel-dialog";
import { PaymentRefundDialog } from "../components/payment-refund-dialog";
import { ArrowLeft, CreditCard, DollarSign, XCircle, RotateCcw } from "lucide-react";

export const PaymentDetailPage: React.FC = () => {
  const { paymentId = "" } = useParams<{ paymentId: string }>();
  const queryClient = useQueryClient();

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  const { data: payment, isLoading } = useQuery({
    queryKey: ["payment", paymentId],
    queryFn: () => paymentsApi.getById(paymentId),
    enabled: Boolean(paymentId),
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => paymentsApi.cancel(paymentId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment", paymentId] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Hủy thanh toán thất bại");
    },
  });

  const refundMutation = useMutation({
    mutationFn: (input: RefundPaymentInput) => paymentsApi.refund(paymentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment", paymentId] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "REFUND_EXCEEDS_PAYMENT") {
        setRefundError("Số tiền hoàn trả vượt quá số tiền thanh toán khả dụng!");
      } else {
        setRefundError(err?.response?.data?.message || "Hoàn tiền thất bại");
      }
    },
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (!payment) {
    return (
      <div className="p-8 text-center text-[#A84646] bg-[#FDF0F0] rounded-2xl border border-[#F5D5D5]">
        Giao dịch thanh toán không tồn tại hoặc bạn không có quyền truy cập.
      </div>
    );
  }

  const statusInfo = translatePaymentStatus(payment.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/admin/payments" className="text-xs text-[#73766F] hover:text-[#3F594F] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách thanh toán
        </Link>
      </div>

      <PageHeader
        title={`Giao Dịch: ${payment.paymentCode || payment.id.slice(0, 8)}`}
        description={`Hóa đơn ${payment.invoiceCode || "-"} • Ngày thu: ${formatDate(payment.paidAt)}`}
        action={
          <div className="flex gap-2">
            {payment.status === "CONFIRMED" && (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsRefundDialogOpen(true)}>
                  <RotateCcw className="w-3.5 h-3.5" /> Hoàn Tiền (Refund)
                </Button>
                <Button variant="outline" size="sm" className="text-[#A84646] hover:bg-[#FDF0F0]" onClick={() => setIsCancelDialogOpen(true)}>
                  <XCircle className="w-3.5 h-3.5" /> Hủy Thanh Toán
                </Button>
              </>
            )}
            {payment.status === "PARTIALLY_REFUNDED" && (
              <Button variant="outline" size="sm" onClick={() => setIsRefundDialogOpen(true)}>
                <RotateCcw className="w-3.5 h-3.5" /> Hoàn Tiền Tiếp
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#3F594F]" /> Thông Tin Giao Dịch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-[#73766F]">
              <div>
                <span className="font-semibold text-[#252724] block">Trạng thái:</span>
                <Badge variant={statusInfo.variant} className="mt-0.5">{statusInfo.label}</Badge>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Phương thức:</span>
                <span>{translatePaymentMethod(payment.method)}</span>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Mã giao dịch ngân hàng:</span>
                <span className="font-mono text-[#252724]">{payment.transactionRef || "—"}</span>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Ngày ghi nhận:</span>
                <span>{formatDate(payment.paidAt)}</span>
              </div>
              {payment.note && (
                <div className="pt-2 border-t border-[#F2EFE9] mt-2">
                  <span className="font-semibold text-[#252724] block mb-1">Ghi chú:</span>
                  <p className="whitespace-pre-line">{payment.note}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#3F594F]" /> Chi Tiết Dòng Tiền
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-[#73766F]">
              <div className="flex justify-between py-1.5 border-b border-[#F2EFE9]">
                <span>Số tiền nạp ban đầu:</span>
                <span className="font-mono font-bold text-sm text-[#252724]">{formatCurrency(payment.amount)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2EFE9] text-[#A84646]">
                <span>Số tiền đã hoàn lại:</span>
                <span className="font-mono font-bold">-{formatCurrency(payment.refundAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-[#E8E5DF] text-[#3F594F] font-bold text-base">
                <span>Số tiền thực nhận (Net):</span>
                <span className="font-mono">{formatCurrency(payment.netAmount)}</span>
              </div>
              {payment.overpaymentAmount && payment.overpaymentAmount > 0 ? (
                <div className="p-3 bg-[#EBF3ED] border border-[#D6E6DA] rounded-xl text-[#3E6148]">
                  Số tiền nộp thừa: <strong className="font-mono">{formatCurrency(payment.overpaymentAmount)}</strong> (Hóa đơn đã được thanh toán dư).
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <PaymentCancelDialog
        open={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onSubmit={async (reason) => { await cancelMutation.mutateAsync(reason); }}
        loading={cancelMutation.isPending}
      />

      <PaymentRefundDialog
        open={isRefundDialogOpen}
        onClose={() => setIsRefundDialogOpen(false)}
        onSubmit={async (data) => { await refundMutation.mutateAsync(data); }}
        paymentAmount={payment.amount}
        alreadyRefundedAmount={payment.refundAmount}
        loading={refundMutation.isPending}
        error={refundError}
      />
    </div>
  );
};
