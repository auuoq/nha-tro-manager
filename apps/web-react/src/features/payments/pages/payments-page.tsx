import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Select } from "@/shared/components/ui/select";
import { paymentsApi } from "../api/payments.api";
import { buildingsApi } from "@/features/buildings/api/buildings.api";
import { invoicesApi } from "@/features/invoices/api/invoices.api";
import { PaymentMethod, PaymentStatus, CreateManualPaymentInput } from "../types/payment.types";
import { PaymentTable } from "../components/payment-table";
import { ManualPaymentDialog } from "../components/manual-payment-dialog";

export const PaymentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: buildingsData } = useQuery({
    queryKey: ["buildings"],
    queryFn: () => buildingsApi.list({ page: 1, pageSize: 100 }),
  });
  const buildings = buildingsData?.items || [];

  const { data: invoicesData } = useQuery({
    queryKey: ["invoices", { buildingId: selectedBuildingId }],
    queryFn: () => invoicesApi.list({ buildingId: selectedBuildingId || undefined, page: 1, pageSize: 100 }),
  });
  const invoices = (invoicesData?.items || []).map((inv) => ({
    id: inv.id,
    name: `HĐ ${inv.invoiceCode} (Phòng ${inv.roomNumber || "-"})`,
  }));

  const { data, isLoading } = useQuery({
    queryKey: ["payments", { buildingId: selectedBuildingId, method: selectedMethod, status: selectedStatus, page }],
    queryFn: () =>
      paymentsApi.list({
        buildingId: selectedBuildingId || undefined,
        method: (selectedMethod as PaymentMethod) || undefined,
        status: (selectedStatus as PaymentStatus) || undefined,
        page,
        pageSize: 12,
      }),
  });

  const createManualMutation = useMutation({
    mutationFn: (input: CreateManualPaymentInput) => paymentsApi.createManual(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setIsDialogOpen(false);
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "PAYMENT_AMOUNT_INVALID") {
        setErrorMsg("Số tiền thanh toán không hợp lệ!");
      } else if (code === "INVOICE_NOT_PAYABLE") {
        setErrorMsg("Hóa đơn không ở trạng thái được phép thanh toán!");
      } else if (code === "PAYMENT_DUPLICATE") {
        setErrorMsg("Giao dịch thanh toán bị trùng lặp!");
      } else {
        setErrorMsg(err?.response?.data?.message || "Tạo thanh toán thất bại");
      }
    },
  });

  const handleCreateManual = async (input: CreateManualPaymentInput) => {
    setErrorMsg(null);
    await createManualMutation.mutateAsync(input);
  };

  const payments = data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Giao Dịch Thanh Toán"
        description="Lịch sử các giao dịch thanh toán tiền nhà, ngân hàng VietQR và xác nhận thu tiền"
        action={
          <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
            + Ghi Nhận Thanh Toán
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E5DF] shadow-2xs flex flex-wrap items-center gap-3">
        <Select
          value={selectedBuildingId}
          onChange={(e) => setSelectedBuildingId(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">-- Tất cả tòa nhà --</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </Select>

        <Select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="w-full sm:w-44"
        >
          <option value="">-- Phương thức --</option>
          <option value="VIETQR">VietQR</option>
          <option value="BANK_TRANSFER">Chuyển khoản</option>
          <option value="CASH">Tiền mặt</option>
          <option value="BANK_WEBHOOK">Bank Webhook</option>
        </Select>

        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full sm:w-44"
        >
          <option value="">-- Trạng thái --</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="CANCELLED">Đã hủy</option>
          <option value="REFUNDED">Đã hoàn tiền</option>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <PaymentTable payments={payments} />
      )}

      <ManualPaymentDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateManual}
        invoices={invoices}
        loading={createManualMutation.isPending}
        error={errorMsg}
      />
    </div>
  );
};
