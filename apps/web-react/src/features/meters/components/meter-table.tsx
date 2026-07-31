import React from "react";
import { Link } from "react-router-dom";
import { Meter } from "../types/meter.types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Zap, Droplet, ArrowRight } from "lucide-react";

export interface MeterTableProps {
  meters: Meter[];
}

export const MeterTable: React.FC<MeterTableProps> = ({ meters }) => {
  if (meters.length === 0) {
    return (
      <EmptyState
        icon={Zap}
        title="Chưa có đồng hồ điện/nước nào"
        description="Nhấn nút '+ Thêm Đồng Hồ' ở trên để khởi tạo đồng hồ đo đếm cho phòng trọ."
      />
    );
  }

  return (
    <div className="bg-white border border-[#E8E5DF] rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#252724]">
          <thead className="bg-[#F2EFE9]/60 text-[#73766F] font-semibold border-b border-[#E8E5DF]">
            <tr>
              <th className="px-5 py-3.5">Loại & Mã Serial</th>
              <th className="px-5 py-3.5">Phòng Trọ & Tòa Nhà</th>
              <th className="px-5 py-3.5 text-right">Chỉ Số Ban Đầu</th>
              <th className="px-5 py-3.5 text-right">Chỉ Số Gần Nhất</th>
              <th className="px-5 py-3.5 text-center">Trạng Thái</th>
              <th className="px-5 py-3.5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2EFE9]">
            {meters.map((m) => (
              <tr key={m.id} className="hover:bg-[#F8F7F4] transition-colors">
                <td className="px-5 py-3.5 font-semibold text-[#252724] flex items-center gap-2">
                  {m.type === "ELECTRICITY" ? (
                    <div className="w-7 h-7 rounded-lg bg-[#FBF3E8] text-[#A36E35] flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-[#EEF4F8] text-[#4D6779] flex items-center justify-center shrink-0">
                      <Droplet className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <span className="font-mono font-bold text-[#252724] block">{m.serialNumber}</span>
                    <span className="text-[10px] text-[#73766F] uppercase">
                      {m.type === "ELECTRICITY" ? "Điện (kWh)" : "Nước (m³)"}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="font-semibold text-[#252724]">Phòng {m.roomNumber || "-"}</span>
                  <div className="text-[11px] text-[#73766F]">{m.buildingName || "-"}</div>
                </td>
                <td className="px-5 py-3.5 text-right font-mono font-medium">{m.initialReading}</td>
                <td className="px-5 py-3.5 text-right font-mono font-bold text-[#3F594F]">
                  {m.latestReading !== undefined ? m.latestReading : m.initialReading}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <Badge variant={m.isActive ? "success" : "neutral"}>
                    {m.isActive ? "Đang hoạt động" : "Đã dỡ bỏ"}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link to={`/admin/meters/${m.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      <span>Chi Tiết</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#73766F]" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
