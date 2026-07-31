import React, { useState } from "react";
import { Dialog } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { VietQRResponse } from "../types/payment.types";
import { formatCurrency } from "@/shared/lib/formatters";
import { QrCode, Copy, CheckCircle2, ShieldAlert } from "lucide-react";

export interface VietQRDialogProps {
  open: boolean;
  onClose: () => void;
  data: VietQRResponse | null;
  loading?: boolean;
  error?: string | null;
}

export const VietQRDialog: React.FC<VietQRDialogProps> = ({
  open,
  onClose,
  data,
  loading = false,
  error = null,
}) => {
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);

  const copyToClipboard = (text: string, type: "acc" | "content") => {
    navigator.clipboard.writeText(text);
    if (type === "acc") {
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 2000);
    } else {
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Thanh Toán Qua Mã VietQR">
      {loading ? (
        <div className="space-y-4 p-4 text-center">
          <Skeleton className="w-48 h-48 mx-auto rounded-2xl" />
          <Skeleton className="w-full h-12 rounded-xl" />
        </div>
      ) : error ? (
        <div className="p-4 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : data ? (
        <div className="space-y-4 text-xs">
          {/* QR Code Container */}
          <div className="bg-white border border-[#E8E5DF] p-4 rounded-2xl text-center space-y-2 shadow-2xs">
            <div className="w-52 h-52 mx-auto rounded-xl overflow-hidden border border-[#E8E5DF] p-2 bg-white flex items-center justify-center">
              {data.qrCodeUrl ? (
                <img src={data.qrCodeUrl} alt="VietQR Code" className="w-full h-full object-contain" />
              ) : (
                <QrCode className="w-24 h-24 text-[#73766F]" />
              )}
            </div>
            <p className="text-[11px] text-[#73766F]">Quét mã QR bằng ứng dụng ngân hàng để chuyển khoản tự động</p>
          </div>

          {/* Account Details */}
          <div className="bg-[#F8F7F4] p-4 rounded-xl border border-[#E8E5DF] space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[#73766F]">Ngân hàng:</span>
              <span className="font-bold text-[#252724]">{data.bankName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#73766F]">Số tài khoản:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#252724]">{data.accountNumber}</span>
                <button
                  onClick={() => copyToClipboard(data.accountNumber, "acc")}
                  className="p-1 text-[#3F594F] hover:bg-[#EBF0ED] rounded transition-colors"
                  title="Sao chép STK"
                >
                  {copiedAcc ? <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6148]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#73766F]">Chủ tài khoản:</span>
              <span className="font-semibold text-[#252724] uppercase">{data.accountName}</span>
            </div>

            <div className="flex justify-between items-center border-t border-[#E8E5DF] pt-2">
              <span className="text-[#73766F]">Số tiền thanh toán:</span>
              <span className="font-mono font-bold text-sm text-[#3F594F]">{formatCurrency(data.amount)}</span>
            </div>

            <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[#E8E5DF]">
              <span className="text-[#73766F]">Nội dung chuyển khoản:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#A36E35]">{data.transferContent}</span>
                <button
                  onClick={() => copyToClipboard(data.transferContent, "content")}
                  className="p-1 text-[#3F594F] hover:bg-[#EBF0ED] rounded transition-colors"
                  title="Sao chép nội dung"
                >
                  {copiedContent ? <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6148]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
};
