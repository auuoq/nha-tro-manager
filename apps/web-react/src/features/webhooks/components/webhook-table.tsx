import React from "react";
import { WebhookEvent } from "../types/webhook.types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";
import { Inbox, Link as LinkIcon } from "lucide-react";

export interface WebhookTableProps {
  events: WebhookEvent[];
  onMatch: (event: WebhookEvent) => void;
}

export const WebhookTable: React.FC<WebhookTableProps> = ({ events, onMatch }) => {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Không có giao dịch webhook chưa khớp"
        description="Toàn bộ các giao dịch ngân hàng chuyển khoản đã được khớp thành công vào hóa đơn."
      />
    );
  }

  return (
    <div className="bg-white border border-[#E8E5DF] rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#252724]">
          <thead className="bg-[#F2EFE9]/60 text-[#73766F] font-semibold border-b border-[#E8E5DF]">
            <tr>
              <th className="px-5 py-3.5">Provider & Event ID</th>
              <th className="px-5 py-3.5">Mã Giao Dịch / STK</th>
              <th className="px-5 py-3.5">Nội Dung Chuyển Khoản</th>
              <th className="px-5 py-3.5">Thời Gian</th>
              <th className="px-5 py-3.5 text-right">Số Tiền (VNĐ)</th>
              <th className="px-5 py-3.5 text-center">Trạng Thái</th>
              <th className="px-5 py-3.5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2EFE9]">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-[#F8F7F4] transition-colors">
                <td className="px-5 py-3.5">
                  <span className="font-semibold text-[#252724] block">{e.provider}</span>
                  <span className="text-[10px] font-mono text-[#73766F]">{e.eventId}</span>
                </td>
                <td className="px-5 py-3.5 font-mono text-[#52554E]">{e.transactionRef}</td>
                <td className="px-5 py-3.5 font-mono text-[#A36E35] font-semibold">{e.content}</td>
                <td className="px-5 py-3.5 font-mono text-[#52554E]">{formatDate(e.occurredAt)}</td>
                <td className="px-5 py-3.5 text-right font-mono font-bold text-[#3F594F]">
                  {formatCurrency(e.amount)}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <Badge variant="warning">Chưa Khớp (UNMATCHED)</Badge>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Button variant="primary" size="sm" onClick={() => onMatch(e)}>
                    <LinkIcon className="w-3.5 h-3.5" /> Gán Hóa Đơn
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
