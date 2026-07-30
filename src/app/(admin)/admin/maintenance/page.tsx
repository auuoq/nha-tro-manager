import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Wrench } from "lucide-react";

export default function AdminMaintenancePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Quản Lý Báo Hỏng & Sửa Chữa"
        description="Tiếp nhận và xử lý yêu cầu sửa chữa thiết bị từ khách thuê"
      />
      <EmptyState
        icon={Wrench}
        title="Chưa có yêu cầu báo hỏng nào"
        description="Khi khách thuê gửi phản ánh sự cố hoặc yêu cầu sửa chữa thiết bị, thông tin sẽ được hiển thị tại đây."
      />
    </div>
  );
}
