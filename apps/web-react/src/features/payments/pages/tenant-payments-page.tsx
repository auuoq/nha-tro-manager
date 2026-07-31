import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { paymentsApi } from "../api/payments.api";
import { PaymentTable } from "../components/payment-table";

export const TenantPaymentsPage: React.FC = () => {
  const [page] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-payments", { page }],
    queryFn: () => paymentsApi.listTenantPayments({ page, pageSize: 12 }),
  });

  const payments = data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch Sử Thanh Toán Của Tôi"
        description="Tra cứu tất cả các giao dịch thanh toán tiền nhà đã nộp"
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <PaymentTable payments={payments} isTenantView={true} />
      )}
    </div>
  );
};
