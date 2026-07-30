"use client";

import React, { useState } from "react";
import { InvoiceDetailDTO } from "../types/invoice.types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyInvoiceDiscountAction } from "../actions/apply-invoice-discount.action";

export interface InvoiceSummaryCardProps {
  invoice: InvoiceDetailDTO;
  onSuccess: () => void;
}

export const InvoiceSummaryCard: React.FC<InvoiceSummaryCardProps> = ({ invoice, onSuccess }) => {
  const [discountAmount, setDiscountAmount] = useState(invoice.discountAmount);
  const [reason, setReason] = useState("");
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await applyInvoiceDiscountAction(invoice.id, Number(discountAmount), reason);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Áp dụng giảm giá thất bại");
      return;
    }

    setShowDiscountForm(false);
    onSuccess();
  };

  return (
    <Card title="Tổng Cộng & Công Nợ Nợ Cũ">
      <div className="space-y-3 text-xs">
        <div className="flex justify-between items-center py-1">
          <span className="text-slate-500">Tổng tiền các khoản dịch vụ kỳ này:</span>
          <span className="font-bold text-slate-800 font-mono text-sm">{invoice.subtotalAmount.toLocaleString("vi-VN")} VNĐ</span>
        </div>

        {invoice.discountAmount > 0 && (
          <div className="flex justify-between items-center py-1 text-emerald-600 font-semibold">
            <span>Mức giảm giá / Chiết khấu:</span>
            <span className="font-mono text-sm">-{invoice.discountAmount.toLocaleString("vi-VN")} VNĐ</span>
          </div>
        )}

        <div className="flex justify-between items-center py-2 border-t border-b border-slate-100 bg-slate-50 px-3 rounded-lg">
          <span className="font-bold text-slate-900 uppercase">Tiền Hóa Đơn Kỳ Này (Current Amount):</span>
          <span className="font-bold text-blue-600 font-mono text-base">{invoice.totalAmount.toLocaleString("vi-VN")} VNĐ</span>
        </div>

        <div className="flex justify-between items-center py-1">
          <span className="text-slate-500">Nợ cũ chưa thanh toán từ các kỳ trước (Previous Debt):</span>
          <span className={`font-bold font-mono text-sm ${invoice.previousOutstandingAmount > 0 ? "text-amber-600" : "text-slate-700"}`}>
            {invoice.previousOutstandingAmount.toLocaleString("vi-VN")} VNĐ
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-t border-slate-200 bg-emerald-50 px-4 rounded-lg">
          <div>
            <span className="font-bold text-emerald-900 text-sm block">TỔNG CỘNG PHẢI THANH TOÁN (TOTAL DUE):</span>
            <span className="text-[11px] text-emerald-700 italic">Bao gồm Tiền kỳ này + Nợ cũ chưa thanh toán</span>
          </div>
          <span className="font-bold text-emerald-700 font-mono text-xl">{invoice.totalAmountDue.toLocaleString("vi-VN")} VNĐ</span>
        </div>

        {invoice.status === "DRAFT" && (
          <div className="pt-2">
            {!showDiscountForm ? (
              <Button variant="outline" size="sm" onClick={() => setShowDiscountForm(true)}>
                🏷️ Áp Dụng Giảm Giá / Chiết Khấu
              </Button>
            ) : (
              <form onSubmit={handleApplyDiscount} className="bg-slate-50 p-3 rounded-lg border space-y-3">
                <span className="font-bold text-slate-800 block">Áp Dụng Giảm Giá Cho Hóa Đơn DRAFT</span>
                {error && <div className="p-2 bg-red-50 text-red-600 rounded">{error}</div>}
                <Input label="Số Tiền Giảm Giá (VNĐ) (*)" type="number" value={discountAmount} onChange={(e) => setDiscountAmount(Number(e.target.value))} required />
                <Input label="Lý Do Giảm Giá" placeholder="Hỗ trợ mùa dịch / Khuyến mãi..." value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowDiscountForm(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" variant="primary" size="sm" isLoading={loading}>
                    Lưu Giảm Giá
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
