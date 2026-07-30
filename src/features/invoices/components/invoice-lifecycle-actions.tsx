"use client";

import React, { useState } from "react";
import { InvoiceDetailDTO } from "../types/invoice.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { issueInvoiceAction } from "../actions/issue-invoice.action";
import { cancelInvoiceAction } from "../actions/cancel-invoice.action";
import { reissueInvoiceAction } from "../actions/reissue-invoice.action";
import { useRouter } from "next/navigation";

export interface InvoiceLifecycleActionsProps {
  invoice: InvoiceDetailDTO;
  onSuccess: () => void;
}

export const InvoiceLifecycleActions: React.FC<InvoiceLifecycleActionsProps> = ({ invoice, onSuccess }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState("");

  const handleIssue = async () => {
    if (!confirm("Xác nhận phát hành hóa đơn? Sau khi phát hành, các khoản thu sẽ bị khóa và không thể sửa.")) return;
    setLoading(true);
    const res = await issueInvoiceAction(invoice.id);
    setLoading(false);
    if (res.success) onSuccess();
    else alert(res.error);
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await cancelInvoiceAction(invoice.id, cancelReason);
    setLoading(false);
    if (!res.success) { setError(res.error || "Hủy hóa đơn thất bại"); return; }
    setIsCancelOpen(false);
    onSuccess();
  };

  const handleReissue = async () => {
    if (!confirm("Tạo phiên bản DRAFT mới (revision mới) từ hóa đơn đã hủy?")) return;
    setLoading(true);
    const res = await reissueInvoiceAction(invoice.id);
    setLoading(false);
    if (res.success && res.data) {
      router.push(`/admin/invoices/${res.data.id}`);
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
      <div className="text-xs">
        <span className="font-bold text-slate-800 block">Vòng Đời Hóa Đơn: {invoice.status}</span>
        <span className="text-slate-500">
          {invoice.status === "DRAFT" && "Bản nháp chưa được phát hành. Kiểm tra kỹ các khoản thu trước khi phát hành."}
          {invoice.status === "ISSUED" && `Đã phát hành ngày ${invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString("vi-VN") : ""}. Hạn thanh toán: ${new Date(invoice.dueDate).toLocaleDateString("vi-VN")}.`}
          {invoice.status === "CANCELLED" && `Đã hủy. Lý do: ${invoice.cancellationReason}`}
          {invoice.status === "PAID" && "Hóa đơn đã được thanh toán đầy đủ."}
          {invoice.status === "OVERDUE" && "Hóa đơn đã quá hạn thanh toán."}
        </span>
      </div>
      <div className="flex gap-2">
        {invoice.status === "DRAFT" && (
          <Button variant="primary" size="sm" onClick={handleIssue} isLoading={loading}>🚀 Phát Hành Hóa Đơn</Button>
        )}
        {(invoice.status === "ISSUED" || invoice.status === "OVERDUE") && (
          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setIsCancelOpen(true)} isLoading={loading}>
            ❌ Hủy Hóa Đơn
          </Button>
        )}
        {invoice.status === "CANCELLED" && (
          <Button variant="outline" size="sm" onClick={handleReissue} isLoading={loading}>🔄 Phát Hành Lại (Revision Mới)</Button>
        )}
      </div>
      <Dialog isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)} title="Hủy Hóa Đơn Đã Phát Hành" maxWidth="sm">
        <form onSubmit={handleCancelSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}
          <Input label="Lý Do Hủy Hóa Đơn (*)" placeholder="Nhập sai chỉ số / sai đơn giá..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} required />
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsCancelOpen(false)} disabled={loading}>Hủy Bỏ</Button>
            <Button type="submit" variant="danger" isLoading={loading}>Xác Nhận Hủy Hóa Đơn</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
