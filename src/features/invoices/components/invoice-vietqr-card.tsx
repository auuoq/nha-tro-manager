"use client";

import React, { useState } from "react";
import Link from "next/link";
import { InvoiceDetailDTO } from "../types/invoice.types";
import { Button } from "@/components/ui/button";
import { generateInvoiceVietQRAction } from "../actions/generate-invoice-vietqr.action";
import { Settings, Landmark } from "lucide-react";

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
    <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#252724]">💳 Thanh Toán Qua VietQR</h3>
          <p className="text-xs text-[#73766F] mt-0.5">
            Quét mã QR để chuyển khoản <span className="font-bold text-[#3F594F]">{invoice.remainingAmount.toLocaleString("vi-VN")} VNĐ</span> cho hóa đơn kỳ <span className="font-mono">{invoice.billingPeriod}</span>.
          </p>
        </div>
        <Link href="/admin/buildings" className="text-xs text-[#3F594F] hover:underline font-medium flex items-center gap-1">
          <Settings className="w-3.5 h-3.5" />
          <span>Sửa tài khoản ngân hàng</span>
        </Link>
      </div>

      {error && <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium">{error}</div>}

      {!qrData ? (
        <Button variant="primary" size="sm" onClick={handleGenerateQR} isLoading={loading}>
          <span>📱 Tạo Mã QR Chuyển Khoản VietQR</span>
        </Button>
      ) : (
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="bg-white border-2 border-[#E8E5DF] rounded-2xl p-3 shadow-2xs shrink-0">
            <img
              src={qrData.qrUrl}
              alt="VietQR Payment QR Code"
              className="w-48 h-48 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏦</text></svg>";
              }}
            />
          </div>
          <div className="space-y-2.5 text-xs flex-1">
            <div className="p-3 bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[#73766F]">Tên tài khoản:</span>
                <span className="font-bold text-[#252724]">{qrData.bankAccountName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#73766F]">Số tài khoản:</span>
                <span className="font-mono font-bold text-[#252724] text-sm">{qrData.bankAccountNo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#73766F]">Số tiền chuyển khoản:</span>
                <span className="font-bold text-[#3E6148]">{qrData.amount.toLocaleString("vi-VN")} VNĐ</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#E8E5DF]">
                <span className="text-[#73766F]">Nội dung chuyển khoản:</span>
                <span className="font-mono font-bold text-[#3F594F] bg-[#EBF0ED] px-2 py-0.5 rounded-md">{qrData.content}</span>
              </div>
            </div>
            <div className="p-2.5 bg-[#FBF3E8] border border-[#F2E0C9] rounded-xl text-[#A36E35] text-[11px] font-medium">
              ⚠️ Vui lòng ghi đúng nội dung CK để hệ thống tự động nhận diện thanh toán qua Webhook Ngân hàng.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
