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
    const invId = prompt("Nhập ID Hóa Đơn cần ghi nhận thanh toán thủ công:");
    if (!invId || !invId.trim()) return;
    setSelectedInvoiceId(invId.trim());
    setSelectedInvoiceCode(invId.trim().slice(0, 8));
    setIsManualOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Thanh Toán & Ngân Hàng"
        description="Lịch sử giao dịch tiền mặt, chuyển khoản thủ công và webhook ngân hàng tự động"
        action={
          <Button variant="primary" size="sm" onClick={handleOpenManual}>
            💵 Ghi Nhận Thanh Toán Thủ Công
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "ALL" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất Cả Giao Dịch ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab("UNMATCHED")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "UNMATCHED" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
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
              className="h-9 rounded-md border border-slate-300 px-3 bg-white focus:outline-none"
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
              className="h-9 rounded-md border border-slate-300 px-3 bg-white focus:outline-none"
            >
              <option value="">-- Tất cả phương thức --</option>
              <option value="CASH">Tiền mặt</option>
              <option value="BANK_TRANSFER">CK thủ công</option>
              <option value="BANK_WEBHOOK">Bank Webhook</option>
              <option value="VIETQR">VietQR</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Đang tải lịch sử thanh toán...</div>
      ) : activeTab === "ALL" ? (
        <PaymentListTable payments={payments} isOwner={true} onRefresh={fetchPayments} />
      ) : (
        <UnmatchedWebhookTable events={unmatchedEvents} onRefresh={fetchPayments} />
      )}

      {isManualOpen && selectedInvoiceId && (
        <ManualPaymentDialog
          isOpen={isManualOpen}
          onClose={() => setIsManualOpen(false)}
          onSuccess={fetchPayments}
          invoiceId={selectedInvoiceId}
          invoiceCode={selectedInvoiceCode}
        />
      )}
    </div>
  );
}
