"use client";

import React, { useState } from "react";
import { InvoiceDetailDTO } from "../types/invoice.types";
import { Button } from "@/components/ui/button";
import { generateInvoiceVietQRAction } from "../actions/generate-invoice-vietqr.action";

export interface InvoiceVietQRCardProps {
  invoice: InvoiceDetailDTO;
}

export const InvoiceVietQRCard: React.FC<InvoiceVietQRCardProps> = ({ invoice }) => {
  const [qrData, setQrData] = useState<{ qrUrl: string; bankAccountNo: string; bankAccountName: string; amount: number; content: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const payableStatuses = ["ISSUED", "PARTIALLY_PAID", "OVERDUE"];
  const canShowQr = payableStatuses.includes(invoice.status) && invoice.remainingAmount > 0;

  if (!canShowQr) return null;

  const handleGenerateQR = async () => {
    setLoading(true);
    setError("");
    const res = await generateInvoiceVietQRAction(invoice.id);
    setLoading(false);

    if (!res.success || !res.data) {
      setError(res.error || "Không thể tạo mã QR thanh toán");
      return;
    }

    setQrData(res.data);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-1">💳 Thanh Toán Qua VietQR</h3>
      <p className="text-xs text-slate-500 mb-4">
        Quét mã QR để chuyển khoản <span className="font-bold text-blue-700">{invoice.remainingAmount.toLocaleString("vi-VN")} VNĐ</span> cho hóa đơn kỳ <span className="font-mono">{invoice.billingPeriod}</span>.
      </p>

      {error && <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

      {!qrData ? (
        <Button variant="primary" size="sm" onClick={handleGenerateQR} isLoading={loading}>
          📱 Tạo Mã QR Chuyển Khoản
        </Button>
      ) : (
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="bg-white border-2 border-slate-200 rounded-xl p-3">
            <img
              src={qrData.qrUrl}
              alt="VietQR Payment QR Code"
              className="w-48 h-48 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏦</text></svg>";
              }}
            />
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-500 block">Tên tài khoản:</span>
              <span className="font-bold text-slate-900">{qrData.bankAccountName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Số tài khoản:</span>
              <span className="font-mono font-bold text-slate-900">{qrData.bankAccountNo}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Số tiền chuyển khoản:</span>
              <span className="font-bold text-blue-700">{qrData.amount.toLocaleString("vi-VN")} VNĐ</span>
            </div>
            <div>
              <span className="text-slate-500 block">Nội dung chuyển khoản:</span>
              <span className="font-mono font-bold text-emerald-700">{qrData.content}</span>
            </div>
            <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-700">
              ⚠️ Vui lòng ghi đúng nội dung CK để hệ thống tự động nhận diện thanh toán.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
