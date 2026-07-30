"use client";

import React from "react";
import { MeterDTO } from "../types/meter.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface MeterTableProps {
  meters: MeterDTO[];
  onReplaceMeter: (meter: MeterDTO) => void;
  onRecordReading: (meter: MeterDTO) => void;
}

export const MeterTable: React.FC<MeterTableProps> = ({ meters, onReplaceMeter, onRecordReading }) => {
  if (meters.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-sm">
        <p className="text-base font-medium">Chưa có đồng hồ điện nước nào được khởi tạo.</p>
        <p className="text-xs text-slate-400 mt-1">Nhấn nút "+ Thêm Đồng Hồ Mới" ở trên để khởi tạo.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3">Loại & Số Serial</th>
            <th className="px-6 py-3">Cơ Sở & Phòng Trọ</th>
            <th className="px-6 py-3">Chỉ Số Gần Nhất</th>
            <th className="px-6 py-3">Trạng Thái</th>
            <th className="px-6 py-3 text-right">Thao Tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {meters.map((m) => (
            <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-6 py-4 font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {m.type === "ELECTRICITY" ? "⚡ Điện" : "💧 Nước"}
                  </span>
                  <span className="text-slate-500 text-xs">({m.serialNumber})</span>
                </div>
                <div className="text-[11px] text-slate-400">Lắp ngày: {new Date(m.installedAt).toLocaleDateString("vi-VN")}</div>
              </td>
              <td className="px-6 py-4">
                <span className="font-semibold text-slate-800">Phòng {m.roomNumber}</span>
                <div className="text-xs text-slate-500">{m.buildingName}</div>
              </td>
              <td className="px-6 py-4 text-xs font-mono">
                {m.lastReadingValue !== null ? (
                  <div>
                    <span className="font-bold text-slate-900">{m.lastReadingValue}</span> {m.type === "ELECTRICITY" ? "kWh" : "m³"}
                    <div className="text-[11px] text-slate-400">Kỳ {m.lastReadingPeriod}</div>
                  </div>
                ) : (
                  <div>
                    <span className="font-semibold text-slate-500">Ban đầu: {m.initialReading}</span>
                    <div className="text-[11px] text-slate-400">Chưa chốt kỳ nào</div>
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <Badge variant={m.isActive ? "success" : "neutral"}>
                  {m.isActive ? "Hoạt Động" : "Đã Ngừng / Thay Mới"}
                </Badge>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {m.isActive ? (
                  <>
                    <Button variant="primary" size="sm" onClick={() => onRecordReading(m)}>
                      📝 Chốt Chỉ Số
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onReplaceMeter(m)}>
                      🔄 Thay Đồng Hồ
                    </Button>
                  </>
                ) : (
                  <span className="text-xs text-slate-400 italic">Đã ngừng</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
