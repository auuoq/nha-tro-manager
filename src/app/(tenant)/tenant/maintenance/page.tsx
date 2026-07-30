import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Wrench, Plus } from "lucide-react";

export default function TenantMaintenancePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Gửi Báo Hỏng / Sự Cố"
        description="Phản ánh sự cố thiết bị trong phòng đến chủ nhà để xử lý kịp thời"
        action={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            <span>Gửi Yêu Cầu Sửa Chữa</span>
          </Button>
        }
      />
      <EmptyState
        icon={Wrench}
        title="Chưa có yêu cầu báo hỏng nào"
        description="Nếu phòng của bạn có thiết bị bị hỏng (điều hòa, bóng đèn, vòi nước...), hãy nhấn '+ Gửi Yêu Cầu Sửa Chữa' để báo cho chủ nhà."
      />
    </div>
  );
}
