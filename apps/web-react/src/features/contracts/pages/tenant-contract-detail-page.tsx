import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { contractsApi } from "../api/contracts.api";
import { translateContractStatus, formatCurrency, formatDate } from "@/shared/lib/formatters";
import { FileText, Calendar, ShieldCheck } from "lucide-react";

export const TenantContractDetailPage: React.FC = () => {
  const { contractId = "" } = useParams<{ contractId: string }>();

  const { data: contract, isLoading } = useQuery({
    queryKey: ["tenant-contract", contractId],
    queryFn: () => contractsApi.getTenantContractDetail(contractId),
    enabled: Boolean(contractId),
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (!contract) {
    return (
      <div className="p-8 text-center text-[#A84646] bg-[#FDF0F0] rounded-2xl border border-[#F5D5D5]">
        Hợp đồng không tồn tại hoặc bạn không có quyền xem hợp đồng này.
      </div>
    );
  }

  const statusInfo = translateContractStatus(contract.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hợp Đồng Thuê Trọ: ${contract.contractCode}`}
        description={`Phòng ${contract.roomNumber || "-"} • ${contract.buildingName || "-"}`}
        action={<Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#3F594F]" /> Thông Tin Hợp Đồng Thuê Trọ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-[#73766F]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F8F7F4] p-4 rounded-xl border border-[#E8E5DF]">
            <div>
              <span className="font-semibold text-[#252724] block mb-1">Giá Thuê Hàng Tháng:</span>
              <strong className="text-[#3F594F] font-bold text-base">{formatCurrency(contract.monthlyPrice)} / tháng</strong>
            </div>
            <div>
              <span className="font-semibold text-[#252724] block mb-1">Tiền Đặt Cọc Đã Đóng:</span>
              <strong className="text-[#252724] font-bold text-base">{formatCurrency(contract.depositAmount)}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold text-[#252724] block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#3F594F]" /> Thời Hạn Thuê:
              </span>
              <span>{formatDate(contract.startDate)} ➔ {formatDate(contract.endDate)}</span>
            </div>
            <div>
              <span className="font-semibold text-[#252724] block mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3F594F]" /> Ngày Chốt Hóa Đơn:
              </span>
              <span>Ngày {contract.billingDay} hàng tháng</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
