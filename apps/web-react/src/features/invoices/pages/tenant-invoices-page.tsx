import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { invoicesApi } from "../api/invoices.api";
import { InvoiceTable } from "../components/invoice-table";

export const TenantInvoicesPage: React.FC = () => {
  const [page] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-invoices", { page }],
    queryFn: () => invoicesApi.listTenantInvoices({ page, pageSize: 12 }),
  });

  const invoices = data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh Sách Hóa Đơn Thuê Trọ"
        description="Tra cứu và kiểm tra lịch sử hóa đơn thanh toán tiền nhà"
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <InvoiceTable invoices={invoices} isTenantView={true} />
      )}
    </div>
  );
};
