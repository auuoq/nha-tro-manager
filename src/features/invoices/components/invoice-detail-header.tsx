"use client";

import React from "react";
import Link from "next/link";
import { InvoiceDetailDTO } from "../types/invoice.types";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { translateInvoiceStatus } from "@/lib/formatters";
import { ArrowLeft } from "lucide-react";

export interface InvoiceDetailHeaderProps {
  invoice: InvoiceDetailDTO;
}

export const InvoiceDetailHeader: React.FC<InvoiceDetailHeaderProps> = ({ invoice }) => {
  const statusInfo = translateInvoiceStatus(invoice.status);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Link href="/admin/invoices" className="text-xs font-medium text-[#73766F] hover:text-[#252724] inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại Danh sách Hóa Đơn</span>
        </Link>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      <PageHeader
        title={`Hóa Đơn ${invoice.invoiceCode} (Kỳ ${invoice.billingPeriod})`}
        description={`${invoice.buildingName} • Phòng ${invoice.roomNumber} • Đại diện: ${invoice.primaryTenantName} • Hợp đồng: ${invoice.contractCode}`}
      />
    </div>
  );
};
