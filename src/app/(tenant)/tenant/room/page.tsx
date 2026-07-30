import React from "react";
import { PageHeader } from "@/components/layout/page-header";

export default function TenantRoomPage() {
  return (
    <div>
      <PageHeader
        title="Thông Tin Phòng Ở"
        description="Danh sách nội thất bàn giao, thông tin Wifi và Nội quy tòa nhà"
      />
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        Chi tiết phòng ở sẽ hiển thị tại đây khi kết nối dữ liệu.
      </div>
    </div>
  );
}
