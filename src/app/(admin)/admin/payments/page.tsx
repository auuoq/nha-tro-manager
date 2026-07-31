"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  PaymentItemDTO,
  WebhookEventDTO,
  PaymentListTable,
  UnmatchedWebhookTable,
  ManualPaymentDialog,
  getPaymentsAction,
} from "@/features/payments";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItemDTO[]>([]);
  const [unmatchedEvents, setUnmatchedEvents] = useState<WebhookEventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"ALL" | "UNMATCHED">("ALL");
  
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [selectedInvoiceCode, setSelectedInvoiceCode] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    const res = await getPaymentsAction({
      status: statusFilter ? (statusFilter as PaymentStatus) : undefined,
      method: methodFilter ? (methodFilter as PaymentMethod) : undefined,
    });
    if (res.success && res.data) setPayments(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, methodFilter]);

  const handleOpenManual = () => {
    setSelectedInvoiceId("");
    setSelectedInvoiceCode("");
    setIsManualOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Thanh Toán & Ngân Hàng"
        description="Lịch sử giao dịch tiền mặt, chuyển khoản thủ công và webhook ngân hàng tự động"
        action={
          <Button variant="primary" size="sm" onClick={handleOpenManual}>
            <span>💵 Ghi Nhận Thanh Toán Thủ Công</span>
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-[#E8E5DF] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "ALL" ? "bg-[#1F2421] text-white" : "bg-[#F8F7F4] text-[#73766F] hover:bg-[#F2EFE9]"
            }`}
          >
            Tất Cả Giao Dịch ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab("UNMATCHED")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "UNMATCHED" ? "bg-[#A36E35] text-white" : "bg-[#FBF3E8] text-[#A36E35] hover:bg-[#F5E0C9]"
            }`}
          >
            ⚠️ Webhook Bị Thất Lạc ({unmatchedEvents.length})
          </button>
        </div>

        {activeTab === "ALL" && (
          <div className="flex gap-3 text-xs w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-[#E8E5DF] px-3 bg-white text-xs text-[#252724] focus:outline-none focus:border-[#3F594F]"
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="REFUNDED">Đã hoàn tiền</option>
              <option value="PARTIALLY_REFUNDED">Hoàn tiền 1 phần</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-10 rounded-xl border border-[#E8E5DF] px-3 bg-white text-xs text-[#252724] focus:outline-none focus:border-[#3F594F]"
            >
              <option value="">-- Tất cả phương thức --</option>
              <option value="CASH">Tiền mặt</option>
              <option value="BANK_TRANSFER">Chuyển khoản thủ công</option>
              <option value="VIETQR">VietQR Tự động</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === "ALL" ? (
        <PaymentListTable payments={payments} onRefresh={fetchPayments} />
      ) : (
        <UnmatchedWebhookTable events={unmatchedEvents} onRefresh={fetchPayments} />
      )}

      <ManualPaymentDialog
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSuccess={fetchPayments}
        invoiceId={selectedInvoiceId}
        invoiceCode={selectedInvoiceCode}
      />
    </div>
  );
}
