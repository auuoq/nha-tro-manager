import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { webhooksApi } from "../api/webhooks.api";
import { invoicesApi } from "@/features/invoices/api/invoices.api";
import { WebhookEvent } from "../types/webhook.types";
import { WebhookTable } from "../components/webhook-table";
import { WebhookMatchDialog } from "../components/webhook-match-dialog";

export const UnmatchedWebhooksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: invoicesData } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => invoicesApi.list({ page: 1, pageSize: 100 }),
  });
  const invoices = (invoicesData?.items || []).map((inv) => ({
    id: inv.id,
    name: `HĐ ${inv.invoiceCode} (Phòng ${inv.roomNumber || "-"})`,
    remainingAmount: inv.remainingAmount,
  }));

  const { data, isLoading } = useQuery({
    queryKey: ["webhooks-unmatched", { page }],
    queryFn: () => webhooksApi.listUnmatched({ page, pageSize: 12 }),
  });

  const matchMutation = useMutation({
    mutationFn: ({ eventId, invoiceId }: { eventId: string; invoiceId: string }) =>
      webhooksApi.matchWebhook(eventId, { invoiceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks-unmatched"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setIsDialogOpen(false);
      setSelectedEvent(null);
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "WEBHOOK_ALREADY_MATCHED") {
        setErrorMsg("Giao dịch webhook này đã được gán hóa đơn trước đó!");
      } else if (code === "INVOICE_NOT_PAYABLE") {
        setErrorMsg("Hóa đơn đã chọn không ở trạng thái nhận thanh toán!");
      } else {
        setErrorMsg(err?.response?.data?.message || "Gán hóa đơn thất bại");
      }
    },
  });

  const handleMatchSubmit = async (invoiceId: string) => {
    if (!selectedEvent) return;
    setErrorMsg(null);
    await matchMutation.mutateAsync({ eventId: selectedEvent.eventId, invoiceId });
  };

  const events = data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Giao Dịch Chuyển Khoản Chưa Khớp (Unmatched Webhooks)"
        description="Rà soát các giao dịch Bank Webhook tự động chưa tự khớp được với mã hóa đơn"
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <WebhookTable
          events={events}
          onMatch={(event) => {
            setSelectedEvent(event);
            setErrorMsg(null);
            setIsDialogOpen(true);
          }}
        />
      )}

      <WebhookMatchDialog
        open={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setSelectedEvent(null); }}
        onSubmit={handleMatchSubmit}
        event={selectedEvent}
        invoices={invoices}
        loading={matchMutation.isPending}
        error={errorMsg}
      />
    </div>
  );
};
