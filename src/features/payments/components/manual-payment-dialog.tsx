"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentMethod } from "@prisma/client";
import { recordManualPaymentAction } from "../actions/record-manual-payment.action";
import { getInvoicesAction } from "@/features/invoices/actions/get-invoices.action";
import { InvoiceItemDTOList } from "@/features/invoices/types/invoice.types";
import { formatCurrency } from "@/lib/formatters";
import { DollarSign, Receipt, ChevronDown } from "lucide-react";

export interface ManualPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoiceId?: string;
  invoiceCode?: string;
  defaultAmount?: number;
}

export const ManualPaymentDialog: React.FC<ManualPaymentDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  invoiceId: initialInvoiceId = "",
  invoiceCode: initialInvoiceCode = "",
  defaultAmount = 0,
}) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(initialInvoiceId);
  const [selectedInvoiceCode, setSelectedInvoiceCode] = useState(initialInvoiceCode);
  const [amount, setAmount] = useState(defaultAmount > 0 ? defaultAmount.toString() : "");
  const [method, setMethod] = useState<"CASH" | "BANK_TRANSFER" | "OTHER">(PaymentMethod.CASH as "CASH");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  
  const [unpaidInvoices, setUnpaidInvoices] = useState<InvoiceItemDTOList[]>([]);
  const [fetchingInvoices, setFetchingInvoices] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync state when props change
  useEffect(() => {
    if (isOpen) {
      setSelectedInvoiceId(initialInvoiceId);
      setSelectedInvoiceCode(initialInvoiceCode);
      setAmount(defaultAmount > 0 ? defaultAmount.toString() : "");
      setError("");

      // Fetch unpaid invoices if invoiceId is not pre-selected
      if (!initialInvoiceId) {
        fetchUnpaidInvoices();
      }
    }
  }, [isOpen, initialInvoiceId, initialInvoiceCode, defaultAmount]);

  const fetchUnpaidInvoices = async () => {
    setFetchingInvoices(true);
    const res = await getInvoicesAction();
    if (res.success && res.data) {
      // Filter unpaid / partially paid / issued invoices
      const activeUnpaid = res.data.filter(
        (inv) => inv.status === "ISSUED" || inv.status === "PARTIALLY_PAID" || inv.status === "OVERDUE" || inv.status === "DRAFT"
      );
      setUnpaidInvoices(activeUnpaid);

      // Auto-select first invoice if available
      if (activeUnpaid.length > 0 && !selectedInvoiceId) {
        const first = activeUnpaid[0];
        setSelectedInvoiceId(first.id);
        setSelectedInvoiceCode(first.invoiceCode);
        setAmount(Number(first.totalAmount).toString());
      }
    }
    setFetchingInvoices(false);
  };

  const handleInvoiceSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const invId = e.target.value;
    setSelectedInvoiceId(invId);
    const found = unpaidInvoices.find((i) => i.id === invId);
    if (found) {
      setSelectedInvoiceCode(found.invoiceCode);
      setAmount(Number(found.totalAmount).toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      setError("Vui lòng chọn hóa đơn cần ghi nhận thanh toán");
      return;
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Số tiền phải lớn hơn 0");
      return;
    }

    setLoading(true);
    setError("");

    const res = await recordManualPaymentAction({
      invoiceId: selectedInvoiceId,
      amount: numericAmount,
      method,
      transactionRef: transactionRef.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Ghi nhận thanh toán thất bại");
      return;
    }

    if (res.data?.overpaymentAmount && res.data.overpaymentAmount > 0) {
      alert(`⚠️ Cảnh báo: Số tiền ghi nhận (${numericAmount.toLocaleString("vi-VN")}đ) vượt quá dư nợ hóa đơn. Tiền thừa: ${res.data.overpaymentAmount.toLocaleString("vi-VN")}đ.`);
    }

    onSuccess();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={selectedInvoiceCode ? `Ghi Nhận Thanh Toán Thủ Công - ${selectedInvoiceCode}` : "Ghi Nhận Thanh Toán Thủ Công"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium">{error}</div>}

        {/* Invoice Selector Dropdown (If not pre-selected) */}
        {!initialInvoiceId ? (
          <div>
            <label className="block text-xs font-semibold text-[#252724] mb-1">
              Chọn Hóa Đơn Cần Thanh Toán (*)
            </label>
            {fetchingInvoices ? (
              <div className="h-10 bg-[#F8F7F4] border border-[#E8E5DF] rounded-2xl animate-pulse flex items-center px-3 text-xs text-[#73766F]">
                Đang tải danh sách hóa đơn...
              </div>
            ) : unpaidInvoices.length === 0 ? (
              <div className="p-3 bg-[#F8F7F4] border border-[#E8E5DF] rounded-2xl text-xs text-[#73766F] text-center">
                Không tìm thấy hóa đơn nào chưa thanh toán.
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedInvoiceId}
                  onChange={handleInvoiceSelectChange}
                  className="w-full h-[42px] px-3.5 bg-white border border-[#E8E5DF] rounded-2xl text-xs text-[#252724] focus:outline-none focus:border-[#3F594F] focus:ring-4 focus:ring-[#3F594F]/10 transition-all appearance-none pr-10 cursor-pointer"
                >
                  {unpaidInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceCode} — Phòng {inv.roomNumber} ({inv.primaryTenantName}) — {formatCurrency(inv.totalAmount)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#73766F] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 bg-[#F8F7F4] border border-[#E8E5DF] rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#73766F] block">Hóa Đơn Đang Chọn:</span>
              <span className="text-xs font-bold text-[#252724]">{selectedInvoiceCode}</span>
            </div>
            <Receipt className="w-5 h-5 text-[#3F594F]" />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#252724] mb-1">Phương Thức Thanh Toán (*)</label>
          <div className="relative">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as "CASH" | "BANK_TRANSFER" | "OTHER")}
              className="w-full h-[42px] px-3.5 bg-white border border-[#E8E5DF] rounded-2xl text-xs text-[#252724] focus:outline-none focus:border-[#3F594F] focus:ring-4 focus:ring-[#3F594F]/10 transition-all appearance-none pr-10 cursor-pointer"
            >
              <option value={PaymentMethod.CASH}>💵 Tiền mặt (CASH)</option>
              <option value={PaymentMethod.BANK_TRANSFER}>🏦 Chuyển khoản ngân hàng thủ công (BANK_TRANSFER)</option>
              <option value={PaymentMethod.OTHER}>💳 Khác (OTHER)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#73766F] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <Input
          label="Số Tiền Thanh Toán (VNĐ) (*)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="1"
          placeholder="Nhập số tiền..."
        />

        <Input
          label="Mã Giao Dịch / Mã Tham Chiếu Ngân Hàng"
          placeholder="VD: FT12345678..."
          value={transactionRef}
          onChange={(e) => setTransactionRef(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold text-[#252724] mb-1">Ghi Chú Vận Hành</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Khách đưa tiền mặt trực tiếp cho quản lý..."
            className="w-full bg-white border border-[#E8E5DF] rounded-2xl p-3 text-xs text-[#252724] placeholder:text-[#A3A69F] focus:outline-none focus:border-[#3F594F] focus:ring-4 focus:ring-[#3F594F]/10 transition-all"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3.5 border-t border-[#F2EFE9]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            <span>Xác Nhận Ghi Nhận Thanh Toán</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
