import React from "react";
import { Invoice } from "../types/invoice.types";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { translateInvoiceStatus } from "@/shared/lib/formatters";
import { CheckCircle2, RefreshCw, XCircle, RotateCcw, Tag } from "lucide-react";

export interface InvoiceStatusActionsProps {
  invoice: Invoice;
  onRecalculate: () => Promise<void>;
  onIssue: () => Promise<void>;
  onCancel: () => Promise<void>;
  onReissue: () => Promise<void>;
  onOpenDiscount: () => void;
  loading?: boolean;
}

export const InvoiceStatusActions: React.FC<InvoiceStatusActionsProps> = ({
  invoice,
  onRecalculate,
  onIssue,
  onCancel,
  onReissue,
  onOpenDiscount,
  loading = false,
}) => {
  const statusInfo = translateInvoiceStatus(invoice.status);

  const handleIssue = () => {
    if (confirm("Xác nhận phát hành hóa đơn này cho Khách thuê (ISSUED)?")) {
      onIssue();
    }
  };

  const handleCancel = () => {
    if (confirm("Xác nhận hủy hóa đơn này (CANCELLED)?")) {
      onCancel();
    }
  };

  const handleReissue = () => {
    if (confirm("Xác nhận phát hành lại hóa đơn từ trạng thái đã hủy (REISSUE)?")) {
      onReissue();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-[#73766F] uppercase tracking-wider block font-semibold">Trạng Thái Hóa Đơn</span>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={statusInfo.variant} className="text-xs py-1 px-3">
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-[#F2EFE9] flex flex-wrap gap-2">
        {invoice.status === "DRAFT" && (
          <>
            <Button variant="primary" size="sm" onClick={handleIssue} disabled={loading}>
              <CheckCircle2 className="w-4 h-4" /> Phát Hành Hóa Đơn (ISSUED)
            </Button>
            <Button variant="outline" size="sm" onClick={onRecalculate} disabled={loading}>
              <RefreshCw className="w-4 h-4" /> Tính Toán Lại (Recalculate)
            </Button>
            <Button variant="outline" size="sm" onClick={onOpenDiscount} disabled={loading}>
              <Tag className="w-4 h-4" /> Giảm Giá (Discount)
            </Button>
          </>
        )}

        {invoice.status === "ISSUED" && invoice.paidAmount === 0 && (
          <Button variant="outline" size="sm" className="text-[#A84646] hover:bg-[#FDF0F0]" onClick={handleCancel} disabled={loading}>
            <XCircle className="w-4 h-4" /> Hủy Hóa Đơn (CANCELLED)
          </Button>
        )}

        {invoice.status === "CANCELLED" && (
          <Button variant="outline" size="sm" onClick={handleReissue} disabled={loading}>
            <RotateCcw className="w-4 h-4" /> Phát Hành Lại (REISSUE)
          </Button>
        )}
      </div>
    </div>
  );
};
