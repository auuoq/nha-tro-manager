"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  InvoiceListSection,
  CreateInvoiceDialog,
  InvoiceItemDTOList,
  getInvoicesAction,
} from "@/features/invoices";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItemDTOList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    const res = await getInvoicesAction();
    if (res.success && res.data) setInvoices(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Hóa Đơn"
        description="Danh sách hóa đơn tiền thuê phòng, điện, nước và dịch vụ hàng tháng"
        action={
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
            ➕ Tạo Hóa Đơn Nháp
          </Button>
        }
      />

      {loading ? (
        <div className="p-8 text-center text-slate-500">Đang tải hóa đơn...</div>
      ) : (
        <InvoiceListSection invoices={invoices} />
      )}

      <CreateInvoiceDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchInvoices}
        contracts={[]}
      />
    </div>
  );
}
