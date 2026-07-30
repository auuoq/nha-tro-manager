"use client";

import React, { useState } from "react";
import { WebhookEventDTO } from "../types/payment.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { matchWebhookEventAction } from "../actions/match-webhook-event.action";

export interface UnmatchedWebhookTableProps {
  events: WebhookEventDTO[];
  onRefresh: () => void;
}

export const UnmatchedWebhookTable: React.FC<UnmatchedWebhookTableProps> = ({ events, onRefresh }) => {
  const [selectedEvent, setSelectedEvent] = useState<WebhookEventDTO | null>(null);
  const [invoiceIdInput, setInvoiceIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !invoiceIdInput.trim()) return;

    setLoading(true);
    setError("");

    const res = await matchWebhookEventAction(selectedEvent.id, invoiceIdInput.trim());
    setLoading(false);

    if (!res.success) {
      setError("error" in res ? (res.error as string) : "Gán hóa đơn thất bại");
      return;
    }

    setSelectedEvent(null);
    setInvoiceIdInput("");
    onRefresh();
  };

  if (events.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
        🎉 Không có giao dịch webhook nào bị thất lạc (Unmatched). Tất cả đã được tự động khớp thành công!
      </div>
    );
  }

  return (
    <div className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-amber-50 px-4 py-3 border-b border-amber-200 text-xs font-semibold text-amber-900 flex items-center justify-between">
        <span>⚠️ Giao Dịch Ngân Hàng Chưa Tự Động Khớp Hóa Đơn ({events.length})</span>
        <span className="text-[11px] text-amber-700 font-normal">Cần Owner đối soát và gán mã hóa đơn thủ công</span>
      </div>
      <table className="w-full text-left text-xs text-slate-700">
        <thead className="bg-slate-50 uppercase tracking-wider text-slate-500 border-b border-slate-200 text-[11px]">
          <tr>
            <th className="px-4 py-3">Cổng / EventId</th>
            <th className="px-4 py-3">Số Tiền</th>
            <th className="px-4 py-3">Nội Dung Chuyển Khoản</th>
            <th className="px-4 py-3">Thời Gian</th>
            <th className="px-4 py-3 text-right">Gán Hóa Đơn</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {events.map((e) => {
            const amount = Number(e.payload?.amount || e.payload?.transferAmount || 0);
            const content = String(e.payload?.content || e.payload?.description || "");

            return (
              <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono">
                  <span className="font-bold text-slate-900">{e.provider}</span>
                  <span className="block text-[10px] text-slate-400">{e.eventId}</span>
                </td>
                <td className="px-4 py-3 font-mono font-bold text-blue-700">{amount.toLocaleString("vi-VN")}đ</td>
                <td className="px-4 py-3 font-mono text-[11px] text-slate-800">{content || "N/A"}</td>
                <td className="px-4 py-3 text-slate-500 text-[11px]">{new Date(e.createdAt).toLocaleString("vi-VN")}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setSelectedEvent(e)}>
                    🔗 Gán Thủ Công
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedEvent && (
        <Dialog isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Gán Giao Dịch Webhook Cho Hóa Đơn" maxWidth="md">
          <form onSubmit={handleMatchSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

            <div className="bg-slate-50 p-3 rounded-lg border text-xs space-y-1">
              <div><span className="text-slate-500">Cổng:</span> <span className="font-bold">{selectedEvent.provider}</span></div>
              <div><span className="text-slate-500">Số tiền:</span> <span className="font-bold font-mono text-blue-700">{Number(selectedEvent.payload?.amount || selectedEvent.payload?.transferAmount || 0).toLocaleString("vi-VN")}đ</span></div>
              <div><span className="text-slate-500">Nội dung CK:</span> <span className="font-mono text-slate-800">{String(selectedEvent.payload?.content || selectedEvent.payload?.description || "")}</span></div>
            </div>

            <Input
              label="Nhập ID Hóa Đơn (*)"
              placeholder="Dán ID hóa đơn cần gán thanh toán..."
              value={invoiceIdInput}
              onChange={(e) => setInvoiceIdInput(e.target.value)}
              required
            />

            <div className="flex justify-end gap-3 pt-3 border-t">
              <Button type="button" variant="ghost" onClick={() => setSelectedEvent(null)} disabled={loading}>Hủy Bỏ</Button>
              <Button type="submit" variant="primary" isLoading={loading}>✅ Xác Nhận Gán Hóa Đơn</Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
};
