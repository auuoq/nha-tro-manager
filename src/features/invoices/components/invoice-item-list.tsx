"use client";

import React from "react";
import { InvoiceItemDTO } from "../types/invoice.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface InvoiceItemListProps {
  items: InvoiceItemDTO[];
  isDraft: boolean;
  onAddManualItem: () => void;
}

export const InvoiceItemList: React.FC<InvoiceItemListProps> = ({ items, isDraft, onAddManualItem }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Chi Tiết Các Khoản Thu Trong Hóa Đơn ({items.length})</h3>
          <p className="text-xs text-slate-500 mt-0.5">Danh sách snapshot các dịch vụ tiền phòng, điện, nước, wifi, rác, gửi xe</p>
        </div>
        {isDraft && (
          <Button variant="outline" size="sm" onClick={onAddManualItem}>
            + Thêm Khoản Phụ Thu
          </Button>
        )}
      </div>

      <div className="divide-y divide-slate-100 text-xs">
        {items.map((i) => (
          <div key={i.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors">
            <div className="space-y-0.5">
              <div className="font-semibold text-slate-800 flex items-center gap-2">
                <Badge variant="neutral">{i.type}</Badge>
                <span>{i.description}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Số lượng: {i.quantity} {i.unit} × {i.unitPrice.toLocaleString("vi-VN")}đ
                {i.previousReading !== null && i.currentReading !== null && (
                  <span className="ml-2 text-slate-500 font-mono">(Chỉ số: {i.previousReading} ➔ {i.currentReading})</span>
                )}
              </div>
            </div>

            <div className="font-bold text-slate-900 font-mono text-sm">
              {i.amount.toLocaleString("vi-VN")} VNĐ
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
