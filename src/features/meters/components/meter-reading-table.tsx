"use client";

import React, { useState } from "react";
import { MeterReadingDTO } from "../types/meter.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getMeterReadingImageSignedUrlAction } from "../actions/get-meter-reading-image-signed-url.action";
import { Zap, Eye } from "lucide-react";

export interface MeterReadingTableProps {
  readings: MeterReadingDTO[];
}

export const MeterReadingTable: React.FC<MeterReadingTableProps> = ({ readings }) => {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleViewImage = async (readingId: string) => {
    setLoadingId(readingId);
    const res = await getMeterReadingImageSignedUrlAction(readingId);
    setLoadingId(null);

    if (res.success && res.data) {
      setSignedUrls((prev) => ({ ...prev, [readingId]: res.data.url }));
    } else {
      alert(res.error);
    }
  };

  if (readings.length === 0) {
    return (
      <EmptyState
        icon={Zap}
        title="Chưa có lịch sử chốt chỉ số"
        description="Bản ghi chốt điện nước định kỳ sẽ được liệt kê tại đây."
      />
    );
  }

  return (
    <div className="bg-white border border-[#E8E5DF] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#252724]">
          <thead className="bg-[#F2EFE9]/60 text-[#73766F] font-semibold border-b border-[#E8E5DF]">
            <tr>
              <th className="px-5 py-3.5">Kỳ Chốt</th>
              <th className="px-5 py-3.5">Cơ Sở & Phòng Trọ</th>
              <th className="px-5 py-3.5">Loại Đồng Hồ</th>
              <th className="px-5 py-3.5">Chỉ Số (Cũ ➔ Mới)</th>
              <th className="px-5 py-3.5">Tiêu Thụ</th>
              <th className="px-5 py-3.5 text-right">Ảnh Minh Chứng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2EFE9]">
            {readings.map((r) => (
              <tr key={r.id} className="hover:bg-[#F8F7F4] transition-colors">
                <td className="px-5 py-3.5 font-mono font-semibold text-[#252724]">{r.period}</td>
                <td className="px-5 py-3.5">
                  <span className="font-semibold text-[#252724]">Phòng {r.roomNumber}</span>
                  <div className="text-[11px] text-[#73766F]">{r.buildingName}</div>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={r.meterType === "ELECTRICITY" ? "warning" : "info"}>
                    {r.meterType === "ELECTRICITY" ? "Điện" : "Nước"} ({r.serialNumber})
                  </Badge>
                </td>
                <td className="px-5 py-3.5 font-mono text-[#52554E]">
                  {r.previousValue} ➔ <span className="font-bold text-[#252724]">{r.currentValue}</span>
                </td>
                <td className="px-5 py-3.5 font-bold text-[#3E6148] font-mono">
                  +{r.consumption} {r.meterType === "ELECTRICITY" ? "kWh" : "m³"}
                </td>
                <td className="px-5 py-3.5 text-right">
                  {r.imagePath ? (
                    signedUrls[r.id] ? (
                      <img src={signedUrls[r.id]} alt="Ảnh đồng hồ" className="w-16 h-12 object-cover rounded-xl border border-[#E8E5DF] ml-auto" />
                    ) : (
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => handleViewImage(r.id)} isLoading={loadingId === r.id}>
                        <Eye className="w-3.5 h-3.5 text-[#3F594F]" />
                        <span>Xem Ảnh</span>
                      </Button>
                    )
                  ) : (
                    <span className="text-[11px] text-[#A3A69F] italic">Không có ảnh</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
