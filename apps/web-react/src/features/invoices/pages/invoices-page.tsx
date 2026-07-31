import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Select } from "@/shared/components/ui/select";
import { invoicesApi } from "../api/invoices.api";
import { buildingsApi } from "@/features/buildings/api/buildings.api";
import { contractsApi } from "@/features/contracts/api/contracts.api";
import { InvoiceStatus, CreateDraftInvoiceInput } from "../types/invoice.types";
import { InvoiceTable } from "../components/invoice-table";
import { InvoiceDraftDialog } from "../components/invoice-draft-dialog";

export const InvoicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: buildingsData } = useQuery({
    queryKey: ["buildings"],
    queryFn: () => buildingsApi.list({ page: 1, pageSize: 100 }),
  });
  const buildings = buildingsData?.items || [];

  const { data: contractsData } = useQuery({
    queryKey: ["contracts", { buildingId: selectedBuildingId }],
    queryFn: () => contractsApi.list({ buildingId: selectedBuildingId || undefined, page: 1, pageSize: 100 }),
  });
  const contracts = (contractsData?.items || []).map((c) => ({
    id: c.id,
    name: `Phòng ${c.roomNumber || "-"} — HĐ ${c.contractCode}`,
  }));

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", { buildingId: selectedBuildingId, status: selectedStatus, page }],
    queryFn: () =>
      invoicesApi.list({
        buildingId: selectedBuildingId || undefined,
        status: (selectedStatus as InvoiceStatus) || undefined,
        page,
        pageSize: 12,
      }),
  });

  const createDraftMutation = useMutation({
    mutationFn: (input: CreateDraftInvoiceInput) => invoicesApi.createDraft(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setIsDialogOpen(false);
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "MISSING_CHARGE_CONFIG") {
        setErrorMsg("Thiếu đơn giá dịch vụ (MISSING_CHARGE_CONFIG)!");
      } else if (code === "MISSING_METER_READING") {
        setErrorMsg("Thiếu chỉ số điện/nước kỳ này (MISSING_METER_READING)!");
      } else if (code === "INVOICE_ALREADY_EXISTS_FOR_PERIOD") {
        setErrorMsg("Hóa đơn kỳ này đã được tạo!");
      } else if (code === "CONTRACT_NOT_ACTIVE") {
        setErrorMsg("Hợp đồng không còn ở trạng thái hoạt động!");
      } else {
        setErrorMsg(err?.response?.data?.message || "Tạo hóa đơn nháp thất bại");
      }
    },
  });

  const handleCreateDraft = async (input: CreateDraftInvoiceInput) => {
    setErrorMsg(null);
    await createDraftMutation.mutateAsync(input);
  };

  const invoices = data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Hóa Đơn Thanh Toán"
        description="Lập hóa đơn tiền nhà hàng tháng và theo dõi công nợ khách thuê"
        action={
          <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
            + Tạo Hóa Đơn Nháp
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
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">-- Trạng thái hóa đơn --</option>
          <option value="DRAFT">Nháp (DRAFT)</option>
          <option value="ISSUED">Đã phát hành (ISSUED)</option>
          <option value="PARTIALLY_PAID">Thanh toán 1 phần</option>
          <option value="PAID">Đã thanh toán (PAID)</option>
          <option value="OVERDUE">Quá hạn (OVERDUE)</option>
          <option value="CANCELLED">Đã hủy (CANCELLED)</option>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <InvoiceTable invoices={invoices} />
      )}

      <InvoiceDraftDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateDraft}
        contracts={contracts}
        loading={createDraftMutation.isPending}
        error={errorMsg}
      />
    </div>
  );
};
