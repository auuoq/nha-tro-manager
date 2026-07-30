"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  MeterListSection,
  MeterTable,
  MeterFormDialog,
  ReplaceMeterDialog,
  MeterReadingFormDialog,
  MeterReadingTable,
  MeterDTO,
  MeterReadingDTO,
  getMetersAction,
  getMeterReadingsAction,
} from "@/features/meters";
import { getRoomsAction } from "@/features/rooms";

export default function OwnerMetersPage() {
  const [meters, setMeters] = useState<MeterDTO[]>([]);
  const [readings, setReadings] = useState<MeterReadingDTO[]>([]);
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"METERS" | "READINGS">("METERS");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [replaceMeter, setReplaceMeter] = useState<MeterDTO | null>(null);
  const [recordMeter, setRecordMeter] = useState<MeterDTO | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const mRes = await getMetersAction();
    const rRes = await getMeterReadingsAction();
    if (mRes.success && mRes.data) setMeters(mRes.data);
    if (rRes.success && rRes.data) setReadings(rRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    getRoomsAction().then((res) => {
      if (res.success && res.data) {
        setRooms(res.data.map((r) => ({ id: r.id, name: `P.${r.roomNumber} (${r.buildingName})` })));
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Đồng Hồ & Chốt Số Điện Nước"
        description="Quản lý đồng hồ điện nước, thay thế thiết bị và chốt số định kỳ hàng tháng cho từng phòng"
        action={
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>+ Thêm Đồng Hồ</Button>
          </div>
        }
      />

      <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
        <button
          className={`pb-2 px-1 border-b-2 transition-colors ${activeTab === "METERS" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          onClick={() => setActiveTab("METERS")}
        >
          Danh Sách Đồng Hồ ({meters.length})
        </button>
        <button
          className={`pb-2 px-1 border-b-2 transition-colors ${activeTab === "READINGS" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          onClick={() => setActiveTab("READINGS")}
        >
          Lịch Sử Chốt Số ({readings.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
      ) : activeTab === "METERS" ? (
        <MeterListSection meters={meters} onReplaceMeter={(m) => setReplaceMeter(m)} onRecordReading={(m) => setRecordMeter(m)} />
      ) : (
        <MeterReadingTable readings={readings} />
      )}

      <MeterFormDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={fetchData} rooms={rooms} />
      {replaceMeter && <ReplaceMeterDialog isOpen={true} onClose={() => setReplaceMeter(null)} onSuccess={fetchData} meter={replaceMeter} />}
      {recordMeter && <MeterReadingFormDialog isOpen={true} onClose={() => setRecordMeter(null)} onSuccess={fetchData} meter={recordMeter} />}
    </div>
  );
}
