"use client";

import React, { useEffect, useState, use } from "react";
import {
  InvoiceDetailHeader,
  InvoiceItemList,
  InvoiceSummaryCard,
  ManualInvoiceItemDialog,
  InvoiceLifecycleActions,
  InvoiceVietQRCard,
  InvoiceDetailDTO,
  getInvoiceDetailAction,
} from "@/features/invoices";

export default function InvoiceDetailPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = use(params);
  const [invoice, setInvoice] = useState<InvoiceDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isManualOpen, setIsManualOpen] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    const res = await getInvoiceDetailAction(invoiceId);
    if (res.success && res.data) setInvoice(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchDetail(); }, [invoiceId]);

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải chi tiết hóa đơn...</div>;
  if (!invoice) return <div className="p-8 text-center text-red-600 font-semibold">Hóa đơn không tồn tại hoặc bạn không có quyền truy cập.</div>;

  const isDraft = invoice.status === "DRAFT";

  return (
    <div className="space-y-6">
      <InvoiceDetailHeader invoice={invoice} />
      <InvoiceLifecycleActions invoice={invoice} onSuccess={fetchDetail} />
      <InvoiceItemList
        items={invoice.items}
        isDraft={isDraft}
        onAddManualItem={() => setIsManualOpen(true)}
      />
      <InvoiceSummaryCard invoice={invoice} onSuccess={fetchDetail} />
      <InvoiceVietQRCard invoice={invoice} />
      {isDraft && (
        <ManualInvoiceItemDialog
          isOpen={isManualOpen}
          onClose={() => setIsManualOpen(false)}
          onSuccess={fetchDetail}
          invoiceId={invoice.id}
        />
      )}
    </div>
  );
}
